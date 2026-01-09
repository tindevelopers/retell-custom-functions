import { useEffect, useState } from 'react';
import { ConfigResponse, fetchConfig, saveConfig } from '../lib/api';

type Props = {
  projectId: string;
};

export function ConfigEditor({ projectId }: Props) {
  const [data, setData] = useState<ConfigResponse | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchConfig(projectId)
      .then((res) => {
        if (!active) return;
        setData(res);
        setText(JSON.stringify(res.config, null, 2));
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const onSave = async () => {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = JSON.parse(text);
      const res = await saveConfig(projectId, {
        config: parsed,
        expected_generation: data.generation,
      });
      setData(res);
      setText(JSON.stringify(res.config, null, 2));
      setMessage('Saved');
    } catch (err: any) {
      if (err?.status === 409 && err.data?.latest_config) {
        setError('Conflict: config changed by another user. Reloading latest.');
        const latest = err.data.latest_config;
        const generation = err.data.generation;
        setData({ config: latest, generation });
        setText(JSON.stringify(latest, null, 2));
      } else {
        setError(err?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card">Error: {error}</div>;
  if (!data) return <div className="card">No data</div>;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700 }}>Project</div>
        <div>{data.config.project_id}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Generation: {data.generation}</div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 12 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="button" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
    </div>
  );
}

