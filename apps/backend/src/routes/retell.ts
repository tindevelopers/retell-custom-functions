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
  // Log incoming request for verification
  const timestamp = new Date().toISOString();
  
  // Log all headers for debugging (especially to find call_id if sent in headers)
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log(`[${timestamp}] Request headers:`, JSON.stringify(headers));
  
  // Capture raw request body before parsing (for Cloud Run logging)
  let rawBody = '';
  let body: Partial<RetellRequest> = {};
  
  try {
    rawBody = await c.req.text();
    console.log(`[${timestamp}] Retell transfer request received`);
    console.log(`[${timestamp}] Raw request body:`, rawBody);
    
    if (rawBody) {
      body = JSON.parse(rawBody) as Partial<RetellRequest>;
    }
  } catch (err: any) {
    console.error(`[${timestamp}] Failed to parse request body:`, err);
    console.log(`[${timestamp}] Raw body was:`, rawBody);
    return c.json({ error: true, message: 'Invalid JSON body' }, 400);
  }
  
  // Try to get call_id from headers if not in body (Retell may send it in headers)
  const callIdFromHeader = 
    c.req.header('x-retell-call-id') || 
    c.req.header('x-call-id') || 
    c.req.header('call-id') ||
    headers['x-retell-call-id'] ||
    headers['x-call-id'] ||
    headers['call-id'];
  
  // Use call_id from header if body doesn't have it or if body has "unknown"
  if (callIdFromHeader && (!body.call_id || body.call_id === 'unknown')) {
    console.log(`[${timestamp}] Using call_id from header: ${callIdFromHeader}`);
    body.call_id = callIdFromHeader;
  }
  
  console.log(`[${timestamp}] Parsed request body:`, JSON.stringify({ call_id: body.call_id, project_id: body.project_id, function_id: body.function_id }));

  // optional shared secret
  const shared = env.RETELL_SHARED_SECRET?.trim();
  if (shared) {
    const auth = c.req.header('authorization') || '';
    const expectedAuth = `Bearer ${shared}`;
    if (auth !== expectedAuth) {
      console.log(`[${timestamp}] Unauthorized request`);
      return c.json({ error: true, message: 'Unauthorized' }, 401);
    }
  }
  
  if (!body.call_id || !body.project_id || !body.function_id) {
    console.log(`[${timestamp}] Missing required fields. Received:`, JSON.stringify(body));
    return c.json({ error: true, message: 'Missing required fields' }, 400);
  }
  
  // Validate call_id is not "unknown" or empty
  if (body.call_id === 'unknown' || body.call_id.trim() === '') {
    console.log(`[${timestamp}] Invalid call_id: "${body.call_id}". Retell configuration may be incorrect.`);
    return c.json({ 
      error: true, 
      message: 'Invalid call_id: Retell is sending "unknown" as call_id. Please check Retell custom function configuration to ensure the call_id variable is properly set.' 
    }, 400);
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
    console.log(`[${timestamp}] Transfer denied: ${schedule.reason}`);
    return c.json({
      transfer_allowed: false,
      transfer_attempted: false,
      message: fnConfig.deny_message || schedule.reason,
      reason: schedule.reason,
    });
  }

  if (!fnConfig.transfer_number) {
    console.log(`[${timestamp}] Missing transfer_number in config`);
    return c.json({ error: true, message: 'Missing transfer_number in config' }, 400);
  }

  const idempotencyKey = `${body.call_id}:${body.function_id}`;
  console.log(`[${timestamp}] Attempting transfer for call ${body.call_id} to ${fnConfig.transfer_number}`);
  const transfer = await transferCall(body.call_id, fnConfig.transfer_number, idempotencyKey);
  if (!transfer.ok) {
    console.log(`[${timestamp}] Transfer failed: ${transfer.message}`);
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

  console.log(`[${timestamp}] Transfer successful for call ${body.call_id}`);
  return c.json({
    transfer_allowed: true,
    transfer_attempted: true,
    message: 'Transfer initiated',
  });
});

