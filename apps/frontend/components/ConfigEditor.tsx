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
  const [isNewConfig, setIsNewConfig] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchConfig(projectId)
      .then((res) => {
        if (!active) return;
        if (res === null) {
          // Config doesn't exist - show empty template
          setIsNewConfig(true);
          const defaultConfig = {
            project_id: projectId,
            functions: {
              RETELL_TRANSFER: {
                enabled: true,
                timezone: 'America/New_York',
                days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                windows: [
                  {
                    start: '09:00',
                    end: '17:00',
                  },
                ],
                transfer_number: '',
                deny_message: "We're currently closed. Please call back during business hours.",
              },
            },
          };
          setText(JSON.stringify(defaultConfig, null, 2));
          setData(null);
        } else {
          setIsNewConfig(false);
          setData(res);
          setText(JSON.stringify(res.config, null, 2));
        }
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
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const parsed = JSON.parse(text);
      const res = await saveConfig(projectId, {
        config: parsed,
        expected_generation: data?.generation,
      });
      setData(res);
      setText(JSON.stringify(res.config, null, 2));
      setIsNewConfig(false);
      setMessage('Saved');
    } catch (err: any) {
      if (err?.status === 409 && err.data?.latest_config) {
        setError('Conflict: config changed by another user. Reloading latest.');
        const latest = err.data.latest_config;
        const generation = err.data.generation;
        setData({ config: latest, generation });
        setText(JSON.stringify(latest, null, 2));
        setIsNewConfig(false);
      } else {
        setError(err?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700 }}>Project</div>
        <div>{projectId}</div>
        {data && <div style={{ fontSize: 12, color: '#6b7280' }}>Generation: {data.generation}</div>}
        {isNewConfig && <div style={{ fontSize: 12, color: '#6b7280' }}>New config - fill in the details below</div>}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={18}
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 12 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="button" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : isNewConfig ? 'Create Config' : 'Save'}
        </button>
      </div>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
    </div>
  );
}

