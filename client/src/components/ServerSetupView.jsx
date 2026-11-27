import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { api } from '../services/api';
import { Button, StatusBadge, StatusDot } from './ui/Shared';
import { Server, Globe, Radio, ArrowRight, RefreshCw, LogOut, Sparkles } from 'lucide-react';

export function ServerSetupView() {
  const { updateSettings, logout, user, setLastNotification } = useControlCenter();

  const [worldName, setWorldName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('19132');
  const [transport, setTransport] = useState('nethernet');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!host.trim()) {
      setError('Enter your server IP or hostname first.');
      return;
    }
    setError('');
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testBedrock(host.trim(), parseInt(port, 10) || 19132);
      setTestResult(res);
      if (res?.success && !worldName.trim() && res.data?.level) {
        setWorldName(res.data.level);
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!worldName.trim() || !host.trim()) {
      setError('World / panel name and server IP are required.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const res = await updateSettings({
        bedrock: {
          isConfigured: true,
          worldName: worldName.trim(),
          host: host.trim(),
          port: parseInt(port, 10) || 19132,
          transport: transport.trim() || 'nethernet',
        },
      });
      if (res?.success) {
        if (setLastNotification) {
          setLastNotification({
            type: 'success',
            text: `Connected "${worldName.trim()}" (${host.trim()}:${port || 19132})!`
          });
        }
      } else {
        setError(res?.error || 'Failed to save server configuration.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save server configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="cc-auth-page">
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div className="cc-brand-icon" style={{ width: 42, height: 42 }}>
              <Server size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p className="cc-truncate" style={{ fontSize: 16, fontWeight: 700 }}>
                {worldName.trim() || 'Bedrock Control Center'}
              </p>
              <p className="cc-truncate" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Signed in as <strong style={{ color: 'var(--text-primary)' }}>{user?.name || user?.username}</strong>
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={14} />
            <span>Sign out</span>
          </Button>
        </div>

        {/* Setup Card */}
        <section className="cc-card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <StatusBadge tone="primary" className="mb-2">
              <Sparkles size={12} />
              <span>Initial Server Setup</span>
            </StatusBadge>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>Connect your Bedrock server</h1>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              Enter your server details below. Your World Name becomes your panel name.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label className="cc-field">
              <span className="cc-field-label">World / Panel Name</span>
              <input
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="e.g. Survival SMP"
                className="cc-input"
              />
            </label>

            <div className="cc-grid-2" style={{ gap: 12 }}>
              <label className="cc-field">
                <span className="cc-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={13} />
                  <span>Server IP / Hostname</span>
                </span>
                <input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. play.myserver.net"
                  className="cc-input cc-mono"
                />
              </label>

              <label className="cc-field">
                <span className="cc-field-label">Port</span>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="19132"
                  className="cc-input cc-mono"
                />
              </label>
            </div>

            <label className="cc-field">
              <span className="cc-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Radio size={13} />
                <span>Transport Protocol</span>
              </span>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                className="cc-select"
              >
                <option value="nethernet">NetherNet (Bedrock Dedicated Server)</option>
                <option value="raknet">RakNet / UDP</option>
              </select>
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <Button type="button" variant="outline" size="sm" onClick={handleTest} disabled={testing}>
                <RefreshCw
                  size={13}
                  style={testing ? { animation: 'spin 1s linear infinite' } : undefined}
                />
                <span>{testing ? 'Testing...' : 'Test connection'}</span>
              </Button>

              {testResult && (
                <StatusBadge tone={testResult.success ? 'success' : 'warning'}>
                  <StatusDot tone={testResult.success ? 'success' : 'warning'} />
                  <span>
                    {testResult.success
                      ? `Online · ${testResult.latencyMs ?? '?'}ms (v${testResult.data?.version || '?'})`
                      : 'Unreachable (you can still save)'}
                  </span>
                </StatusBadge>
              )}
            </div>

            {error && (
              <p role="alert" style={{ fontSize: 12, fontWeight: 500, color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving} style={{ width: '100%', marginTop: 4 }}>
              <span>{saving ? 'Saving configuration...' : 'Launch Control Center'}</span>
              <ArrowRight size={15} />
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
