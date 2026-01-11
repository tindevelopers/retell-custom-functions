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
  
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:17',message:'transfer endpoint entry',data:{timestamp},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'A'}));
  // #endregion
  
  // Capture raw request body before parsing (for Cloud Run logging)
  let rawBody = '';
  let body: Partial<RetellRequest> = {};
  
  try {
    rawBody = await c.req.text();
    console.log(`[${timestamp}] Retell transfer request received`);
    console.log(`[${timestamp}] Raw request body:`, rawBody);
    
    // #region agent log
    console.log(JSON.stringify({location:'retell.ts:28',message:'raw body received',data:{rawBody:rawBody?.substring(0,200),rawBodyLength:rawBody?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'A'}));
    // #endregion
    
    if (rawBody) {
      body = JSON.parse(rawBody) as Partial<RetellRequest>;
    }
  } catch (err: any) {
    console.error(`[${timestamp}] Failed to parse request body:`, err);
    console.log(`[${timestamp}] Raw body was:`, rawBody);
    return c.json({ error: true, message: 'Invalid JSON body' }, 400);
  }
  
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:33',message:'after JSON parse',data:{call_id:body.call_id,project_id:body.project_id,function_id:body.function_id,bodyType:typeof body.call_id},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'A'}));
  // #endregion
  
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
  
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:52',message:'before validation check',data:{call_id:body.call_id,hasCallId:!!body.call_id,callIdType:typeof body.call_id,project_id:body.project_id,function_id:body.function_id},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'B'}));
  // #endregion
  
  if (!body.call_id || !body.project_id || !body.function_id) {
    console.log(`[${timestamp}] Missing required fields. Received:`, JSON.stringify(body));
    // #region agent log
    console.log(JSON.stringify({location:'retell.ts:54',message:'validation failed - missing fields',data:{call_id:body.call_id,project_id:body.project_id,function_id:body.function_id},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'B'}));
    // #endregion
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
  
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:92',message:'before transferCall invocation',data:{call_id:body.call_id,callIdValue:String(body.call_id),callIdType:typeof body.call_id,transferNumber:fnConfig.transfer_number,idempotencyKey},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'B'}));
  // #endregion
  
  const transfer = await transferCall(body.call_id, fnConfig.transfer_number, idempotencyKey);
  
  // #region agent log
  if (transfer.ok) {
    console.log(JSON.stringify({location:'retell.ts:118',message:'after transferCall returns - success',data:{transferOk:true},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'C'}));
  } else {
    console.log(JSON.stringify({location:'retell.ts:120',message:'after transferCall returns - failure',data:{transferOk:false,transferMessage:transfer.message,transferStatus:transfer.status},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'C'}));
  }
  // #endregion
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

