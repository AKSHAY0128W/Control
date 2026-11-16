import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { api } from '../services/api';
import { 
  Sliders, 
  Key, 
  Zap, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  ExternalLink,
  Radio
} from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, setLastNotification } = useControlCenter();

  // Pterodactyl state
  const [panelUrl, setPanelUrl] = useState(settings?.pterodactyl?.panelUrl || '');
  const [apiKey, setApiKey] = useState('');
  const [serverId, setServerId] = useState(settings?.pterodactyl?.serverId || '');

  // Render Bot Service state
  const [renderServiceUrl, setRenderServiceUrl] = useState(settings?.render?.serviceUrl || '');
  const [renderServiceId, setRenderServiceId] = useState(settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0');
  const [renderApiKey, setRenderApiKey] = useState('');
  const [renderKeepAlive, setRenderKeepAlive] = useState(settings?.render?.keepAlive !== false);

  // Auto-teleport timings
  const [autoTpEnabled, setAutoTpEnabled] = useState(settings?.autoTeleport?.enabled ?? true);
  const [delaySeconds, setDelaySeconds] = useState(settings?.autoTeleport?.delaySeconds ?? 8);
  const [distanceThreshold, setDistanceThreshold] = useState(settings?.autoTeleport?.distanceThreshold ?? 10);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [testingRender, setTestingRender] = useState(false);
  const [testRenderResult, setTestRenderResult] = useState(null);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      pterodactyl: {
        panelUrl,
        serverId,
        ...(apiKey ? { apiKey } : {})
      },
      render: {
        serviceUrl: renderServiceUrl,
        serviceId: renderServiceId,
        keepAlive: renderKeepAlive,
        ...(renderApiKey ? { apiKey: renderApiKey } : {})
      },
      autoTeleport: {
        enabled: autoTpEnabled,
        delaySeconds: parseInt(delaySeconds, 10),
        distanceThreshold: parseFloat(distanceThreshold)
      }
    };

    const res = await updateSettings(payload);
    setSaving(false);
    if (res?.success) {
      setApiKey('');
      setRenderApiKey('');
    }
  };

  const handleTestPterodactyl = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testPterodactyl();
      setTestResult(res);
      if (res?.success) {
        setLastNotification({ type: 'success', text: 'AcidoHost Pterodactyl API connected successfully!' });
      } else {
        setLastNotification({ type: 'warning', text: res?.error || 'Pterodactyl connection failed' });
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleTestRender = async () => {
    setTestingRender(true);
    setTestRenderResult(null);
    try {
      const res = await api.testRender();
      setTestRenderResult(res);
      if (res?.success) {
        setLastNotification({ type: 'success', text: `Render bot service is awake! Latency: ${res.latencyMs}ms` });
      } else {
        setLastNotification({ type: 'warning', text: res?.error || 'Render service unreachable' });
      }
    } catch (err) {
      setTestRenderResult({ success: false, error: err.message });
    } finally {
      setTestingRender(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
      {/* Intro Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sliders size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>System Settings &amp; Automation Guard</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configure Render bot agent connection, AcidoHost Pterodactyl console access, and post-reboot auto-teleport timings.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Render Bot Service Integration */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Render Bot Service Integration</h4>
            </div>
            <span className="status-pill online">
              <span className="pulse-dot online" />
              Connected (srv-cba31dh5efls73cocdm0)
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Directly connect your deployed Go bot container on Render. The panel can create, update, and delete bots dynamically on the running container.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Render Service Public URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://afk-bot-service.onrender.com"
                value={renderServiceUrl}
                onChange={(e) => setRenderServiceUrl(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                The public URL assigned by Render to your AFK Web Service.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Render Service ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="srv-cba31dh5efls73cocdm0"
                value={renderServiceId}
                onChange={(e) => setRenderServiceId(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Your service ID from Render dashboard URL: <code>srv-cba31dh5efls73cocdm0</code>
              </span>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">
              Render API Key <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional - for automatic redeployments)</span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder={settings?.render?.isConfigured ? '•••••••••••••••••••••••• (Configured)' : 'rnd_...'}
              value={renderApiKey}
              onChange={(e) => setRenderApiKey(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {/* 15m Sleep Guard Switch */}
          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
            <label className="switch-label">
              <div className="switch">
                <input
                  type="checkbox"
                  checked={renderKeepAlive}
                  onChange={(e) => setRenderKeepAlive(e.target.checked)}
                />
                <span className="slider" />
              </div>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                  Enable 10-Minute Keep-Alive Pinger
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Render free tier spins down containers after 15 minutes of HTTP inactivity. This keep-alive pinger prevents idle sleep so bots stay in-world 24/7.
                </span>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleTestRender}
              disabled={testingRender || !renderServiceUrl}
            >
              <RefreshCw size={14} className={testingRender ? 'animate-spin' : ''} />
              <span>{testingRender ? 'Pinging Container...' : 'Ping Render Service'}</span>
            </button>

            {testRenderResult && (
              <span style={{ fontSize: '0.8rem', color: testRenderResult.success ? 'var(--success-text)' : 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {testRenderResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {testRenderResult.message || testRenderResult.error}
              </span>
            )}
          </div>
        </div>

        {/* AcidoHost Pterodactyl Panel Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>AcidoHost / Pterodactyl API Credentials</h4>
            </div>
            <span className={`status-pill ${settings?.pterodactyl?.isConfigured ? 'online' : 'offline'}`}>
              <span className={`pulse-dot ${settings?.pterodactyl?.isConfigured ? 'online' : 'amber'}`} />
              {settings?.pterodactyl?.isConfigured ? 'API Configured' : 'Not Configured'}
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Used to dispatch console commands (`tp`, `say`, `list`) automatically when the Minecraft server restarts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Panel URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://panel.acido.dev"
                value={panelUrl}
                onChange={(e) => setPanelUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Server Identifier / ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 5d956acc"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">
              Client API Key {settings?.pterodactyl?.isConfigured && <span style={{ color: 'var(--success-text)', fontSize: '0.74rem' }}>(Existing key is saved)</span>}
            </label>
            <input
              type="password"
              className="form-control"
              placeholder={settings?.pterodactyl?.isConfigured ? '•••••••••••••••••••••••• (Leave blank to keep existing)' : 'ptlc_...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleTestPterodactyl}
              disabled={testing || (!panelUrl && !settings?.pterodactyl?.panelUrl)}
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Testing...' : 'Test Panel Connection'}</span>
            </button>

            {testResult && (
              <span style={{ fontSize: '0.8rem', color: testResult.success ? 'var(--success-text)' : 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {testResult.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {testResult.message || testResult.error}
              </span>
            )}
          </div>
        </div>

        {/* Auto-Teleport Engine Parameters */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Zap size={18} color="var(--purple)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Automatic Reboot Teleport Guard</h4>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Whenever BDS restarts or crashes, bots respawn at World Spawn. This automation detects the restart, waits for the world to settle, and dispatches them back to their assigned iron farms.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="switch-label">
              <div className="switch">
                <input
                  type="checkbox"
                  checked={autoTpEnabled}
                  onChange={(e) => setAutoTpEnabled(e.target.checked)}
                />
                <span className="slider" />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                Enable Automatic Teleport on Server Restart Detection
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '4px' }}>
              <div className="form-group">
                <label className="form-label">Post-Restart Delay (seconds)</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  className="form-control"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Gives BDS enough time to load world chunks and spawn bots before command execution.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Distance Misplacement Threshold (blocks)</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  className="form-control"
                  value={distanceThreshold}
                  onChange={(e) => setDistanceThreshold(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  If a bot is further than this distance from the farm, it is flagged as misplaced.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Minecraft BDS Target Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Server size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Minecraft Bedrock Target Infrastructure</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', fontSize: '0.84rem' }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Server Host</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>ayx.acido.dev</strong>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Port</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>19132</strong>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Network Protocol</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>NetherNet (WebRTC)</strong>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Target World</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>CherryVale SMP (1.26.61)</strong>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '10px 24px' }}
          >
            <ShieldCheck size={16} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
