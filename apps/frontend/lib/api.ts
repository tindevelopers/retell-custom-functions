import { ProjectConfig } from './types';

export type ConfigResponse = { config: ProjectConfig; generation: string };

export async function fetchConfig(projectId: string): Promise<ConfigResponse | null> {
  const res = await fetch(`/api/config/${projectId}`, { cache: 'no-store' });
  if (res.status === 404) {
    return null; // Config doesn't exist yet
  }
  if (!res.ok) {
    throw new Error(`Failed to load config (${res.status})`);
  }
  return res.json();
}

export async function saveConfig(projectId: string, payload: { config: ProjectConfig; expected_generation?: string }) {
  const res = await fetch(`/api/config/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.message || 'Save failed') as Error & { status?: number; data?: any };
    (err.status as number | undefined) = res.status;
    (err.data as any) = data;
    throw err;
  }
  return data as ConfigResponse;
}

