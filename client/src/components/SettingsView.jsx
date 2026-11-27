import React, { useState, useEffect } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { api } from '../services/api';
import { 
  PageHeader, 
  SectionCard, 
  InputField, 
  Switch, 
  Badge, 
  StatusDot, 
  Button 
} from './ui/Shared';
import { 
  Cpu, 
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
  Clock,
  Trash2
} from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, setLastNotification, serverMetrics } = useControlCenter();

  // Target Bedrock Server state
  const [bedrockHost, setBedrockHost] = useState(settings?.bedrock?.host || 'ayx.acido.dev');
  const [bedrockPort, setBedrockPort] = useState(settings?.bedrock?.port || 19132);
  const [bedrockWorld, setBedrockWorld] = useState(settings?.bedrock?.worldName || 'CherryVale SMP');
  const [bedrockTransport, setBedrockTransport] = useState(settings?.bedrock?.transport || 'nethernet');

  // Pterodactyl state
  const [panelUrl, setPanelUrl] = useState(settings?.pterodactyl?.panelUrl || 'https://panel.acido.dev');
  const [apiKey, setApiKey] = useState('');
  const [serverId, setServerId] = useState(settings?.pterodactyl?.serverId || '5d956acc');

  // Render Bot Service state
  const [renderServiceUrl, setRenderServiceUrl] = useState(settings?.render?.serviceUrl || 'https://afk-nqeu.onrender.com');
  const [renderServiceId, setRenderServiceId] = useState(settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0');
  const [renderApiKey, setRenderApiKey] = useState('');
  const [renderKeepAlive, setRenderKeepAlive] = useState(settings?.render?.keepAlive !== false);

  // Auto-teleport timings
  const [autoTpEnabled, setAutoTpEnabled] = useState(settings?.autoTeleport?.enabled ?? true);
  const [delaySeconds, setDelaySeconds] = useState(settings?.autoTeleport?.delaySeconds ?? 8);
  const [distanceThreshold, setDistanceThreshold] = useState(settings?.autoTeleport?.distanceThreshold ?? 10);

  // Backup state
  const [backupEnabled, setBackupEnabled] = useState(settings?.backup?.enabled ?? true);
  const [backupTime, setBackupTime] = useState(settings?.backup?.time || '07:00');
  const [backupKeepDays, setBackupKeepDays] = useState(settings?.backup?.keepDays ?? 10);
  const [runningBackup, setRunningBackup] = useState(false);

  // Testing states
  const [testingBedrock, setTestingBedrock] = useState(false);
  const [testBedrockResult, setTestBedrockResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingRender, setTestingRender] = useState(false);
  const [testRenderResult, setTestRenderResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync state if settings load asynchronously
  useEffect(() => {
    if (settings?.bedrock) {
      if (settings.bedrock.host) setBedrockHost(settings.bedrock.host);
      if (settings.bedrock.port) setBedrockPort(settings.bedrock.port);
      if (settings.bedrock.worldName) setBedrockWorld(settings.bedrock.worldName);
      if (settings.bedrock.transport) setBedrockTransport(settings.bedrock.transport);
    }
    if (settings?.pterodactyl) {
      if (settings.pterodactyl.panelUrl) setPanelUrl(settings.pterodactyl.panelUrl);
      if (settings.pterodactyl.serverId) setServerId(settings.pterodactyl.serverId);
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
        host: bedrockHost.trim(),
        port: parseInt(bedrockPort, 10) || 19132,
        worldName: bedrockWorld.trim() || 'CherryVale SMP',
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
          setLastNotification({ type: 'success', text: 'Settings saved! Backup schedule updated.' });
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
        if (setLastNotification) {
          setLastNotification({ 
            type: 'success', 
            text: `BDS Server is ONLINE! Latency: ${res.latencyMs}ms (Version: ${res.data?.version || 'Unknown'})` 
          });
        }
      } else {
        if (setLastNotification) {
          setLastNotification({ type: 'warning', text: res?.error || 'Target server unreachable' });
        }
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
      if (res?.success) {
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: 'AcidoHost Pterodactyl API connected successfully!' });
        }
      } else {
        if (setLastNotification) {
          setLastNotification({ type: 'warning', text: res?.error || 'Pterodactyl connection failed' });
        }
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
      if (setLastNotification) {
        setLastNotification({ 
          type: res?.success ? 'success' : 'warning', 
          text: res?.success ? 'Render AFK service is reachable!' : 'Render service ping failed' 
        });
      }
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
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: `Backup created: "${res.name}" Â· Old backups pruned to ${backupKeepDays}-day limit.` });
        }
      } else {
        if (setLastNotification) {
          setLastNotification({ type: 'warning', text: res?.error || 'Backup creation failed â€” check Pterodactyl credentials.' });
        }
      }
    } catch (err) {
      if (setLastNotification) {
        setLastNotification({ type: 'warning', text: `Backup error: ${err.message}` });
      }
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
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            <span>{saving ? 'Saving...' : 'Save settings'}</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* â”€â”€ Column 1 â”€â”€ */}
        <div className="space-y-6">

          {/* Card 1: Target Bedrock Server */}
          <SectionCard icon={Radio} title="Target Bedrock Server" description="Live BDS endpoint the Control Center monitors and bots connect to">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputField label="Server IP / Hostname" value={bedrockHost} onChange={e => setBedrockHost(e.target.value)} placeholder="r9.acido.dev" />
              <InputField label="Port" value={bedrockPort} onChange={e => setBedrockPort(e.target.value)} type="number" placeholder="19132" />
            </div>
            <InputField label="World / server name" value={bedrockWorld} onChange={e => setBedrockWorld(e.target.value)} placeholder="CherryVale SMP" />
            <InputField label="Transport protocol" value={bedrockTransport} onChange={e => setBedrockTransport(e.target.value)} placeholder="nethernet" />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={handleTestBedrock} disabled={testingBedrock} className="gap-2">
                <RefreshCw className={`size-3.5 ${testingBedrock ? 'animate-spin' : ''}`} />
                <span>{testingBedrock ? 'Testing...' : 'Test BDS connection'}</span>
              </Button>
              {testBedrockResult && (
                <Badge tone={testBedrockResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testBedrockResult.success ? 'success' : 'danger'} />
                  <span>{testBedrockResult.success ? `Online Â· ${testBedrockResult.latencyMs ?? '?'}ms` : 'Unreachable'}</span>
                </Badge>
              )}
            </div>
          </SectionCard>

          {/* Card 2: Render Bot Service */}
          <SectionCard icon={Globe} title="Render AFK Bot Service" description="AFK bot worker pool hosted on Render">
            <InputField label="Worker service URL" value={renderServiceUrl} onChange={e => setRenderServiceUrl(e.target.value)} placeholder="https://afk-nqeu.onrender.com" />
            <InputField label="Render service ID" value={renderServiceId} onChange={e => setRenderServiceId(e.target.value)} mono placeholder="srv-..." />
            <InputField label="Render API key (optional)" value={renderApiKey} onChange={e => setRenderApiKey(e.target.value)} type="password" placeholder={settings?.render?.isConfigured ? 'rnd_â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' : 'rnd_your_api_key'} />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div>
                <p className="text-xs font-medium text-foreground">Keep-alive guard</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Ping every 10m to prevent sleep</p>
              </div>
              <Switch checked={renderKeepAlive} onCheckedChange={setRenderKeepAlive} aria-label="Keep-alive guard" />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={handleTestRender} disabled={testingRender} className="gap-2">
                <RefreshCw className={`size-3.5 ${testingRender ? 'animate-spin' : ''}`} />
                <span>{testingRender ? 'Pinging...' : 'Ping Render service'}</span>
              </Button>
              {testRenderResult && (
                <Badge tone={testRenderResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testRenderResult.success ? 'success' : 'danger'} />
                  <span>{testRenderResult.success ? 'Render 200 OK' : 'Ping Failed'}</span>
                </Badge>
              )}
            </div>
          </SectionCard>

          {/* Card 3: Daily Automatic Backup */}
          <SectionCard icon={Archive} title="Automatic Daily Backup" description="Scheduled server backups via Pterodactyl Â· keeps last 10 days">
            {/* Enable toggle */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-foreground">Enable daily backups</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Runs automatically every day at the configured time</p>
              </div>
              <Switch checked={backupEnabled} onCheckedChange={setBackupEnabled} aria-label="Enable daily backups" />
            </div>

            {/* Config row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Backup time (IST)
                </label>
                <input
                  type="time"
                  value={backupTime}
                  onChange={e => setBackupTime(e.target.value)}
                  disabled={!backupEnabled}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                />
              </div>
              <InputField
                label="Keep (max backups)"
                value={backupKeepDays}
                onChange={e => setBackupKeepDays(e.target.value)}
                type="number"
                suffix="backups"
                disabled={!backupEnabled}
              />
            </div>

            {/* Status row */}
            {lastBackupAt && (
              <div className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-[11px] ${
                lastBackupStatus === 'success' ? 'border-success/20 bg-success/5 text-success' : 'border-danger/20 bg-danger/5 text-danger'
              }`}>
                {lastBackupStatus === 'success'
                  ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                  : <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />}
                <div>
                  <p className="font-medium">
                    {lastBackupStatus === 'success' ? 'Last backup succeeded' : 'Last backup failed'}
                  </p>
                  {lastBackupName && <p className="mt-0.5 font-mono text-[10px] opacity-80">"{lastBackupName}"</p>}
                  <p className="mt-0.5 text-[10px] opacity-70">
                    {new Date(lastBackupAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-[11px] text-muted-foreground">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p>
                Backups run at <span className="font-semibold text-foreground">{backupTime} IST</span> daily.
                Only <span className="font-semibold text-foreground">Auto-Backup</span> entries are counted â€” manual backups are preserved separately.
                Oldest backups are auto-deleted once the limit is reached.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBackupNow}
                disabled={runningBackup}
                className="gap-2"
              >
                {runningBackup
                  ? <RefreshCw className="size-3.5 animate-spin" />
                  : <Archive className="size-3.5" />}
                <span>{runningBackup ? 'Creating backup...' : 'Run backup now'}</span>
              </Button>
              <p className="flex items-center text-[10px] text-muted-foreground">
                Triggers immediately Â· counts toward retention limit
              </p>
            </div>
          </SectionCard>

        </div>

        {/* â”€â”€ Column 2 â”€â”€ */}
        <div className="space-y-6">

          {/* Card 4: AcidoHost Pterodactyl Panel */}
          <SectionCard icon={Server} title="AcidoHost Pterodactyl" description="Panel access for the Bedrock Dedicated Server instance">
            <InputField label="Panel URL" value={panelUrl} onChange={e => setPanelUrl(e.target.value)} placeholder="https://panel.acido.dev" />
            <InputField label="Server identifier" value={serverId} onChange={e => setServerId(e.target.value)} mono placeholder="5d956acc" />
            <InputField
              label="Client API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              type="password"
              placeholder={settings?.pterodactyl?.isConfigured ? 'ptlc_â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢' : 'ptlc_your_client_api_key'}
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={handleTestPterodactyl} disabled={testing} className="gap-2">
                <RefreshCw className={`size-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test panel connection'}</span>
              </Button>
              {testResult && (
                <Badge tone={testResult.success ? 'success' : 'danger'}>
                  <StatusDot tone={testResult.success ? 'success' : 'danger'} />
                  <span>{testResult.success ? 'API Connected' : 'Connection Failed'}</span>
                </Badge>
              )}
            </div>
          </SectionCard>

          {/* Card 5: Auto-Teleport Restart Guard Engine */}
          <SectionCard icon={Zap} title="Automatic reboot teleport guard" description="Reposition active bots after a BDS restart">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-foreground">Global auto-teleport</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Post-restart relocation for assigned bots</p>
              </div>
              <Switch checked={autoTpEnabled} onCheckedChange={setAutoTpEnabled} aria-label="Enable global auto-teleport" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Post-restart delay" value={delaySeconds} onChange={e => setDelaySeconds(e.target.value)} suffix="sec" type="number" />
              <InputField label="Distance threshold" value={distanceThreshold} onChange={e => setDistanceThreshold(e.target.value)} suffix="blocks" type="number" />
            </div>
            <Badge tone="success">
              <ShieldCheck className="size-3.5" />
              <span>Guard enabled Â· production policy</span>
            </Badge>
          </SectionCard>

          {/* Card 6: Info Note */}
          <div className="rounded-lg border border-warning/25 bg-warning/5 p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                <h3 className="text-xs font-semibold text-foreground">Target Server &amp; Worker Synchronization</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  When you update the Target Bedrock Server IP or Port and click Save, the Control Center immediately switches
                  its live monitoring queries to the new address and synchronizes the change to the Render AFK bot worker pool
                  so running bots reconnect automatically.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

