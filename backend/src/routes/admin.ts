import { Hono } from 'hono';
import { env } from '../env.js';
import { GcsConfigStore } from '../services/gcs.js';
import { ProjectConfigSchema } from '../domain/types.js';

const gcs = new GcsConfigStore(env.GCS_BUCKET);
export const adminRouter = new Hono();

function requireAdminAuth(req: Request) {
  const auth = req.headers.get('authorization') || '';
  const expectedSecret = env.ADMIN_SHARED_SECRET?.trim();
  const expectedAuth = `Bearer ${expectedSecret}`;
  return auth === expectedAuth;
}

adminRouter.use('/*', async (c, next) => {
  if (!requireAdminAuth(c.req.raw)) {
    return c.json({ error: true, message: 'Unauthorized' }, 401);
  }
  await next();
});

adminRouter.get('/projects/:projectId/config', async (c) => {
  const projectId = c.req.param('projectId');
  try {
    const { config, generation } = await gcs.getConfig(projectId);
    return c.json({ config, generation });
  } catch (err: any) {
    if (err?.message === 'config_not_found') {
      return c.json({ error: true, message: 'Config not found' }, 404);
    }
    console.error('Config load error', err);
    return c.json({ error: true, message: 'Failed to load config' }, 500);
  }
});

adminRouter.put('/projects/:projectId/config', async (c) => {
  const projectId = c.req.param('projectId');
  const body = await c.req.json().catch(() => ({}));
  const parsed = ProjectConfigSchema.safeParse(body.config);
  if (!parsed.success) {
    return c.json({ error: true, message: parsed.error.message }, 400);
  }

  const expectedGeneration = body.expected_generation as string | undefined;

  try {
    const result = await gcs.saveConfig(projectId, parsed.data, expectedGeneration);
    return c.json({ config: parsed.data, generation: result.generation });
  } catch (err: any) {
    if (err?.message === 'generation_mismatch') {
      try {
        const latest = await gcs.getConfig(projectId);
        return c.json(
          {
            error: true,
            message: 'Generation mismatch',
            generation: latest.generation,
            latest_config: latest.config,
          },
          409,
        );
      } catch {
        return c.json({ error: true, message: 'Generation mismatch' }, 409);
      }
    }
    console.error('Config save error', err);
    return c.json({ error: true, message: 'Failed to save config' }, 500);
  }
});

