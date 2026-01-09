import { env } from '../env.js';

const DEFAULT_TIMEOUT_MS = 3000;

export type TransferResult =
  | { ok: true }
  | { ok: false; message: string; status?: number };

export async function transferCall(callId: string, transferNumber: string, idempotencyKey?: string): Promise<TransferResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const url = `${env.RETELL_API_BASE.replace(/\/$/, '')}/v2/calls/${callId}/transfer`;
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

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, message: text || 'Retell API error', status: response.status };
    }
    return { ok: true };
  } catch (err: any) {
    clearTimeout(timeout);
    return { ok: false, message: err?.message || 'Network error' };
  }
}

