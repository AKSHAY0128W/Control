import React, { useState, useEffect } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { api } from '../services/api';
import {
  PageHeader,
  SectionCard,
  InputField,
  Switch,
  StatusBadge,
  StatusDot,
  Button
} from './ui/Shared';
import {
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Globe,
  Radio,
  Archive,
  Clock
} from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, setLastNotification } = useControlCenter();

  // Target Bedrock Server
  const [bedrockHost, setBedrockHost] = useState(settings?.bedrock?.host || '');
  const [bedrockPort, setBedrockPort] = useState(settings?.bedrock?.port || 19132);
  const [bedrockWorld, setBedrockWorld] = useState(settings?.bedrock?.worldName || '');
  const [bedrockTransport, setBedrockTransport] = useState(settings?.bedrock?.transport || 'nethernet');

  // Pterodactyl
  const [panelUrl, setPanelUrl] = useState(settings?.pterodactyl?.panelUrl || 'https://panel.acido.dev');
  const [apiKey, setApiKey] = useState('');
  const [serverId, setServerId] = useState(settings?.pterodactyl?.serverId || '');

  // Render Bot Service
  const [renderServiceUrl, setRenderServiceUrl] = useState(settings?.render?.serviceUrl || 'https://afk-nqeu.onrender.com');
  const [renderServiceId, setRenderServiceId] = useState(settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0');
  const [renderApiKey, setRenderApiKey] = useState('');
  const [renderKeepAlive, setRenderKeepAlive] = useState(settings?.render?.keepAlive !== false);

  // Auto-teleport
  const [autoTpEnabled, setAutoTpEnabled] = useState(settings?.autoTeleport?.enabled ?? true);
  const [delaySeconds, setDelaySeconds] = useState(settings?.autoTeleport?.delaySeconds ?? 8);
  const [distanceThreshold, setDistanceThreshold] = useState(settings?.autoTeleport?.distanceThreshold ?? 10);

  // Backups
  const [backupEnabled, setBackupEnabled] = useState(settings?.backup?.enabled ?? true);
  const [backupTime, setBackupTime] = useState(settings?.backup?.time || '07:00');
  const [backupKeepDays, setBackupKeepDays] = useState(settings?.backup?.keepDays ?? 10);
  const [runningBackup, setRunningBackup] = useState(false);

  // Tests
  const [testingBedrock, setTestingBedrock] = useState(false);
  const [testBedrockResult, setTestBedrockResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingRender, setTestingRender] = useState(false);
  const [testRenderResult, setTestRenderResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings?.bedrock) {
      if (settings.bedrock.host !== undefined) setBedrockHost(settings.bedrock.host);
      if (settings.bedrock.port) setBedrockPort(settings.bedrock.port);
      if (settings.bedrock.worldName !== undefined) setBedrockWorld(settings.bedrock.worldName);
      if (settings.bedrock.transport) setBedrockTransport(settings.bedrock.transport);
    }
    if (settings?.pterodactyl) {
      if (settings.pterodactyl.panelUrl) setPanelUrl(settings.pterodactyl.panelUrl);
      if (settings.pterodactyl.serverId !== undefined) setServerId(settings.pterodactyl.serverId);
    }
    if (settings?.render) {
      if (settings.render.serviceUrl) setRenderServiceUrl(settings.render.serviceUrl);
      if (settings.render.serviceId) setRenderServiceId(settings.render.serviceId);
      if (settings.render.keepAlive !== undefined) setRenderKeepAlive(settings.render.keepAlive);
    }
    if (settings?.autoTeleport) {
      if (settings.autoTeleport.enabled !== undefined) setAutoTpEnabled(settings.autoTeleport.enabled);
      if (settings.autoTeleport.delaySeconds !== undefined) setDelaySeconds(settings.autoTeleport.delaySeconds);
      if (settings.autoTeleport.distanceThreshold !== undefined) setDistanceThreshold(settings.autoTeleport.distanceThreshold);
    }
    if (settings?.backup) {
      if (settings.backup.enabled !== undefined) setBackupEnabled(settings.backup.enabled);
      if (settings.backup.time) setBackupTime(settings.backup.time);
      if (settings.backup.keepDays !== undefined) setBackupKeepDays(settings.backup.keepDays);
    }
  }, [settings]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const payload = {
      bedrock: {
        isConfigured: Boolean(bedrockHost.trim()),
        host: bedrockHost.trim(),
        port: parseInt(bedrockPort, 10) || 19132,
        worldName: bedrockWorld.trim() || 'Bedrock Server',
        transport: bedrockTransport.trim() || 'nethernet',
      },
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
      },
      backup: {
        enabled: backupEnabled,
        time: backupTime,
        keepDays: parseInt(backupKeepDays, 10) || 10
      }
    };

    try {
      const res = await updateSettings(payload);
      if (res?.success) {
        setApiKey('');
        setRenderApiKey('');
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: 'Settings saved! Target server & backup schedule updated.' });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestBedrock = async () => {
    setTestingBedrock(true);
    setTestBedrockResult(null);
    try {
      const res = await api.testBedrock(bedrockHost, parseInt(bedrockPort, 10));
      setTestBedrockResult(res);
      if (res?.success) {
        setLastNotification?.({ type: 'success', text: `BDS Server is ONLINE! Latency: ${res.latencyMs}ms` });
      } else {
        setLastNotification?.({ type: 'warning', text: res?.error || 'Target server unreachable' });
      }
    } catch (err) {
      setTestBedrockResult({ success: false, error: err.message });
    } finally {
      setTestingBedrock(false);
    }
  };

  const handleTestPterodactyl = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testPterodactyl();
      setTestResult(res);
      setLastNotification?.({
        type: res?.success ? 'success' : 'warning',
        text: res?.success ? 'Pterodactyl API connected successfully!' : (res?.error || 'Pterodactyl connection failed')
      });
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
      setLastNotification?.({
        type: res?.success ? 'success' : 'warning',
        text: res?.success ? 'Render AFK service is reachable!' : 'Render service ping failed'
      });
    } catch (err) {
      setTestRenderResult({ success: false, error: err.message });
    } finally {
      setTestingRender(false);
    }
  };

  const handleBackupNow = async () => {
    setRunningBackup(true);
    try {
      const res = await api.triggerBackupNow();
      if (res?.success) {
        setLastNotification?.({ type: 'success', text: `Backup created: "${res.name}" · Retention limit: ${backupKeepDays} backups.` });
      } else {
        setLastNotification?.({ type: 'warning', text: res?.error || 'Backup creation failed — check Pterodactyl credentials.' });
      }
    } catch (err) {
      setLastNotification?.({ type: 'warning', text: `Backup error: ${err.message}` });
    } finally {
      setRunningBackup(false);
    }
  };

  const lastBackupAt = settings?.backup?.lastBackupAt;
  const lastBackupStatus = settings?.backup?.lastBackupStatus;
  const lastBackupName = settings?.backup?.lastBackupName;

  return (
    <div>
      <PageHeader
        eyebrow="System / Configuration"
        title="Settings"
        detail="Configure the BDS target, Pterodactyl panel, bot service, backup schedule, and teleport guard."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <CheckCircle2 size={14} />}
            <span>{saving ? 'Saving...' : 'Save settings'}</span>
          </Button>
        }
      />

      <div className="cc-grid-2" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Target Bedrock Server */}
          <SectionCard icon={Radio} title="Target Bedrock Server" description="Live BDS endpoint the Control Center monitors and bots connect to">
            <div className="cc-grid-2" style={{ gap: 12 }}>
              <InputField label="Server IP / Hostname" value={bedrockHost} onChange={e => setBedrockHost(e.target.value)} placeholder="play.example.com" />
              <InputField label="Port" value={bedrockPort} onChange={e => setBedrockPort(e.target.value)} type="number" placeholder="19132" />
            </div>
            <InputField label="World / Panel name" value={bedrockWorld} onChange={e => setBedrockWorld(e.target.value)} placeholder="Survival SMP" />
            <InputField label="Transport protocol" value={bedrockTransport} onChange={e => setBedrockTransport(e.target.value)} placeholder="nethernet" />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <Button variant="outline" size="sm" onClick={handleTestBedrock} disabled={testingBedrock}>
                <RefreshCw size={13} style={testingBedrock ? { animation: 'spin 1s linear infinite' } : undefined} />
                <span>{testingBedrock ? 'Testing...' : 'Test BDS connection'}</span>
              </Button>
              {testBedrockResult && (
                <StatusBadge tone={testBedrockResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testBedrockResult.success ? 'success' : 'danger'} />
                  <span>{testBedrockResult.success ? `Online · ${testBedrockResult.latencyMs ?? '?'}ms` : 'Unreachable'}</span>
                </StatusBadge>
              )}
            </div>
          </SectionCard>

          {/* Render Bot Service */}
          <SectionCard icon={Globe} title="Render AFK Bot Service" description="AFK bot worker pool hosted on Render">
            <InputField label="Worker service URL" value={renderServiceUrl} onChange={e => setRenderServiceUrl(e.target.value)} placeholder="https://afk-nqeu.onrender.com" />
            <InputField label="Render service ID" value={renderServiceId} onChange={e => setRenderServiceId(e.target.value)} mono placeholder="srv-..." />
            <InputField label="Render API key (optional)" value={renderApiKey} onChange={e => setRenderApiKey(e.target.value)} type="password" placeholder={settings?.render?.isConfigured ? 'rnd_••••••••' : 'rnd_your_api_key'} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500 }}>Keep-alive guard</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ping every 10m to prevent sleep</p>
              </div>
              <Switch checked={renderKeepAlive} onCheckedChange={setRenderKeepAlive} aria-label="Keep-alive guard" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <Button variant="outline" size="sm" onClick={handleTestRender} disabled={testingRender}>
                <RefreshCw size={13} style={testingRender ? { animation: 'spin 1s linear infinite' } : undefined} />
                <span>{testingRender ? 'Pinging...' : 'Ping Render service'}</span>
              </Button>
              {testRenderResult && (
                <StatusBadge tone={testRenderResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testRenderResult.success ? 'success' : 'danger'} />
                  <span>{testRenderResult.success ? 'Render 200 OK' : 'Ping Failed'}</span>
                </StatusBadge>
              )}
            </div>
          </SectionCard>

          {/* Automatic Daily Backup */}
          <SectionCard icon={Archive} title="Automatic Daily Backup" description="Scheduled server backups via Pterodactyl · keeps last 10 days">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500 }}>Enable daily backups</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Runs automatically every day at the configured time</p>
              </div>
              <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} aria-label="Enable daily backups" />
            </div>

            <div className="cc-grid-2" style={{ gap: 12 }}>
              <label className="cc-field">
                <span className="cc-field-label">Backup time (IST)</span>
                <input
                  type="time"
                  value={backupTime}
                  onChange={e => setBackupTime(e.target.value)}
                  disabled={!backupEnabled}
                  className="cc-input cc-mono"
                />
              </label>
              <InputField
                label="Keep (max backups)"
                value={backupKeepDays}
                onChange={e => setBackupKeepDays(e.target.value)}
                type="number"
                suffix="backups"
                disabled={!backupEnabled}
              />
            </div>

            {lastBackupAt && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${lastBackupStatus === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  background: lastBackupStatus === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
                  color: lastBackupStatus === 'success' ? 'var(--success)' : 'var(--danger)',
                  fontSize: 12
                }}
              >
                {lastBackupStatus === 'success' ? <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />}
                <div>
                  <p style={{ fontWeight: 600 }}>{lastBackupStatus === 'success' ? 'Last backup succeeded' : 'Last backup failed'}</p>
                  {lastBackupName && <p className="cc-mono" style={{ fontSize: 11, opacity: 0.85 }}>"{lastBackupName}"</p>}
                  <p style={{ fontSize: 11, opacity: 0.8 }}>
                    {new Date(lastBackupAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-alt)',
                fontSize: 12,
                color: 'var(--text-secondary)'
              }}
            >
              <Clock size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--accent)' }} />
              <p>
                Backups run at <strong>{backupTime} IST</strong> daily. Only <strong>Auto-Backup</strong> entries are pruned — manual backups are preserved.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <Button size="sm" variant="outline" onClick={handleBackupNow} disabled={runningBackup}>
                {runningBackup ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Archive size={13} />}
                <span>{runningBackup ? 'Creating backup...' : 'Run backup now'}</span>
              </Button>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Triggers immediately · counts toward retention limit</span>
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pterodactyl Panel */}
          <SectionCard icon={Server} title="AcidoHost Pterodactyl" description="Panel access for the Bedrock Dedicated Server instance">
            <InputField label="Panel URL" value={panelUrl} onChange={e => setPanelUrl(e.target.value)} placeholder="https://panel.acido.dev" />
            <InputField label="Server identifier" value={serverId} onChange={e => setServerId(e.target.value)} mono placeholder="5d956acc" />
            <InputField
              label="Client API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              type="password"
              placeholder={settings?.pterodactyl?.isConfigured ? 'ptlc_••••••••••••' : 'ptlc_your_client_api_key'}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <Button variant="outline" size="sm" onClick={handleTestPterodactyl} disabled={testing}>
                <RefreshCw size={13} style={testing ? { animation: 'spin 1s linear infinite' } : undefined} />
                <span>{testing ? 'Testing...' : 'Test panel connection'}</span>
              </Button>
              {testResult && (
                <StatusBadge tone={testResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testResult.success ? 'success' : 'danger'} />
                  <span>{testResult.success ? 'API Connected' : 'Connection Failed'}</span>
                </StatusBadge>
              )}
            </div>
          </SectionCard>

          {/* Auto-Teleport Guard */}
          <SectionCard icon={Zap} title="Automatic reboot teleport guard" description="Reposition active bots after a BDS restart">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500 }}>Global auto-teleport</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Post-restart relocation for assigned bots</p>
              </div>
              <Switch checked={autoTpEnabled} onCheckedChange={setAutoTpEnabled} aria-label="Enable global auto-teleport" />
            </div>
            <div className="cc-grid-2" style={{ gap: 12 }}>
              <InputField label="Post-restart delay" value={delaySeconds} onChange={e => setDelaySeconds(e.target.value)} suffix="sec" type="number" />
              <InputField label="Distance threshold" value={distanceThreshold} onChange={e => setDistanceThreshold(e.target.value)} suffix="blocks" type="number" />
            </div>
            <StatusBadge tone="success">
              <ShieldCheck size={13} />
              <span>Guard enabled · production policy</span>
            </StatusBadge>
          </SectionCard>

          {/* Info Note */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--warning-border)',
              background: 'var(--warning-soft)',
              display: 'flex',
              gap: 12
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--warning)' }} />
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600 }}>Target Server &amp; Worker Synchronization</h3>
              <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                When you update the Target Bedrock Server IP or Port and click Save, the Control Center immediately switches its live monitoring queries to the new address and synchronizes the change to the Render AFK bot worker pool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
