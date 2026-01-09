import { Hono } from 'hono';
import { env } from '../env.js';
import { GcsConfigStore } from '../services/gcs.js';
import { evaluateSchedule } from '../domain/schedule.js';
import { transferCall } from '../services/retell.js';

const gcs = new GcsConfigStore(env.GCS_BUCKET);

type RetellRequest = {
  call_id: string;
  project_id: string;
  function_id: string;
};

export const retellRouter = new Hono();

retellRouter.post('/transfer', async (c) => {
  // optional shared secret
  const shared = env.RETELL_SHARED_SECRET;
  if (shared) {
    const auth = c.req.header('authorization') || '';
    if (auth !== `Bearer ${shared}`) {
      return c.json({ error: true, message: 'Unauthorized' }, 401);
    }
  }

  const body = (await c.req.json().catch(() => ({}))) as Partial<RetellRequest>;
  if (!body.call_id || !body.project_id || !body.function_id) {
    return c.json({ error: true, message: 'Missing required fields' }, 400);
  }

  let project;
  try {
    const res = await gcs.getConfig(body.project_id);
    project = res.config;
  } catch (err: any) {
    if (err?.message === 'config_not_found') {
      return c.json({ error: true, message: 'Config not found' }, 404);
    }
    console.error('Config load error', err);
    return c.json({ error: true, message: 'Failed to load config' }, 500);
  }

  const fnConfig = project.functions?.[body.function_id];
  if (!fnConfig) {
    return c.json({ error: true, message: 'Function not found' }, 404);
  }

  const schedule = evaluateSchedule(fnConfig);
  if (!schedule.allowed) {
    return c.json({
      transfer_allowed: false,
      transfer_attempted: false,
      message: fnConfig.deny_message || schedule.reason,
      reason: schedule.reason,
    });
  }

  if (!fnConfig.transfer_number) {
    return c.json({ error: true, message: 'Missing transfer_number in config' }, 400);
  }

  const idempotencyKey = `${body.call_id}:${body.function_id}`;
  const transfer = await transferCall(body.call_id, fnConfig.transfer_number, idempotencyKey);
  if (!transfer.ok) {
    return c.json(
      {
        transfer_allowed: true,
        transfer_attempted: true,
        message: transfer.message || 'Transfer failed',
        error: true,
      },
      (transfer.status ?? 502) as 502,
    );
  }

  return c.json({
    transfer_allowed: true,
    transfer_attempted: true,
    message: 'Transfer initiated',
  });
});

