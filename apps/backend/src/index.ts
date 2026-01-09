import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { retellRouter } from './routes/retell.js';
import { adminRouter } from './routes/admin.js';
import { env } from './env.js';

const app = new Hono();

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: env.SERVICE_NAME,
  }),
);

app.use(
  '/admin/*',
  cors({
    origin: env.CORS_ORIGIN ?? '*',
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'PUT', 'OPTIONS'],
  }),
);

app.route('/retell', retellRouter);
app.route('/admin', adminRouter);

app.notFound((c) => c.json({ error: true, message: 'Not found' }, 404));

export default app;

// Start server when this file is executed directly
try {
  const port = Number(env.PORT || 8080);
  // eslint-disable-next-line no-console
  console.log(`Starting server on port ${port}...`);
  serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log(`Listening on http://0.0.0.0:${port}`);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
}

