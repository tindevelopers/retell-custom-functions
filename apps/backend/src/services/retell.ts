import { env } from '../env.js';

const DEFAULT_TIMEOUT_MS = 3000;

export type TransferResult =
  | { ok: true }
  | { ok: false; message: string; status?: number };

export async function transferCall(callId: string, transferNumber: string, idempotencyKey?: string): Promise<TransferResult> {
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:9',message:'transferCall entry',data:{callId,callIdType:typeof callId,callIdValue:String(callId),transferNumber,idempotencyKey},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'D'}));
  // #endregion
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const url = `${env.RETELL_API_BASE.replace(/\/$/, '')}/v2/calls/${callId}/transfer`;
  
  // #region agent log
  console.log(JSON.stringify({location:'retell.ts:14',message:'constructed URL',data:{url,apiBase:env.RETELL_API_BASE,callIdInUrl:callId},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'D'}));
  // #endregion
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RETELL_API_KEY}`,
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify({ transfer_number: transferNumber }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // #region agent log
    console.log(JSON.stringify({location:'retell.ts:26',message:'fetch response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,url},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'E'}));
    // #endregion

    if (!response.ok) {
      const text = await response.text();
      // #region agent log
      console.log(JSON.stringify({location:'retell.ts:29',message:'non-ok response',data:{status:response.status,statusText:response.statusText,responseText:text?.substring(0,500),url},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'E'}));
      // #endregion
      return { ok: false, message: text || 'Retell API error', status: response.status };
    }
    return { ok: true };
  } catch (err: any) {
    clearTimeout(timeout);
    // #region agent log
    console.log(JSON.stringify({location:'retell.ts:33',message:'fetch exception',data:{errorMessage:err?.message,errorName:err?.name,errorCode:err?.code,url},timestamp:Date.now(),sessionId:'debug-session',runId:'cloud-run',hypothesisId:'E'}));
    // #endregion
    return { ok: false, message: err?.message || 'Network error' };
  }
}

