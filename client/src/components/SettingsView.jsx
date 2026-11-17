import React, { useState } from 'react';
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
  Info
} from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, setLastNotification } = useControlCenter();

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

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [testingRender, setTestingRender] = useState(false);
  const [testRenderResult, setTestRenderResult] = useState(null);

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
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

    try {
      const res = await updateSettings(payload);
      if (res?.success) {
        setApiKey('');
        setRenderApiKey('');
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: 'Settings updated and saved successfully!' });
        }
      }
    } finally {
      setSaving(false);
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
      if (res?.success) {
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: `Render Service active! Response: ${res.data?.message || '200 OK'}` });
        }
      } else {
        if (setLastNotification) {
          setLastNotification({ type: 'warning', text: res?.error || 'Render service ping failed' });
        }
      }
    } catch (err) {
      setTestRenderResult({ success: false, error: err.message });
    } finally {
      setTestingRender(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="Configuration / Integrations"
        title="Settings"
        detail="Connection details and automatic recovery behavior."
        actions={
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            <CheckCircle2 className="size-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        }
      />

      {/* 2-Column Settings Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Column 1: Integrations */}
        <div className="space-y-6">
          {/* Card 1: Render Bot Service */}
          <SectionCard
            icon={Cpu}
            title="Render bot service"
            description="Worker service endpoint and keep-alive behavior"
          >
            <InputField
              label="Service public URL"
              value={renderServiceUrl}
              onChange={(e) => setRenderServiceUrl(e.target.value)}
              placeholder="https://afk-nqeu.onrender.com"
            />
            <InputField
              label="Render service ID"
              value={renderServiceId}
              onChange={(e) => setRenderServiceId(e.target.value)}
              mono={true}
              placeholder="srv-cba31dh5efls73cocdm0"
            />
            <InputField
              label="Render API key"
              value={renderApiKey}
              onChange={(e) => setRenderApiKey(e.target.value)}
              type="password"
              placeholder={settings?.render?.hasApiKey ? "rnd_••••••••••••" : "rnd_your_render_api_key"}
            />

            {/* Keep-Alive Switch */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-xs font-medium text-foreground">10-minute keep-alive pinger</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Prevents free-tier idle sleep so bots stay in-world 24/7
                </p>
              </div>
              <Switch
                checked={renderKeepAlive}
                onCheckedChange={setRenderKeepAlive}
                aria-label="Enable keep-alive pinger"
              />
            </div>

            {/* Ping Button & Status */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestRender}
                disabled={testingRender}
                className="gap-2"
              >
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

          {/* Card 2: AcidoHost Pterodactyl Panel */}
          <SectionCard
            icon={Server}
            title="AcidoHost Pterodactyl"
            description="Panel access for the Bedrock Dedicated Server instance"
          >
            <InputField
              label="Panel URL"
              value={panelUrl}
              onChange={(e) => setPanelUrl(e.target.value)}
              placeholder="https://panel.acido.dev"
            />
            <InputField
              label="Server identifier"
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              mono={true}
              placeholder="5d956acc"
            />
            <InputField
              label="Client API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder={settings?.pterodactyl?.isConfigured ? "ptlc_••••••••••••" : "ptlc_your_client_api_key"}
            />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestPterodactyl}
                disabled={testing}
                className="gap-2"
              >
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
        </div>

        {/* Column 2: Recovery & Security Info */}
        <div className="space-y-6">
          {/* Card 3: Auto-Teleport Restart Guard Engine */}
          <SectionCard
            icon={Zap}
            title="Automatic reboot teleport guard"
            description="Reposition active bots after a BDS restart"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-foreground">Global auto-teleport</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Post-restart relocation for assigned bots
                </p>
              </div>
              <Switch
                checked={autoTpEnabled}
                onCheckedChange={setAutoTpEnabled}
                aria-label="Enable global auto-teleport"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Post-restart delay"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(e.target.value)}
                suffix="sec"
                type="number"
              />
              <InputField
                label="Distance threshold"
                value={distanceThreshold}
                onChange={(e) => setDistanceThreshold(e.target.value)}
                suffix="blocks"
                type="number"
              />
            </div>

            <Badge tone="success">
              <ShieldCheck className="size-3.5" />
              <span>Guard enabled · production policy</span>
            </Badge>
          </SectionCard>

          {/* Card 4: Information Note */}
          <div className="rounded-lg border border-warning/25 bg-warning/5 p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  Production Credentials &amp; Integrations
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Credentials configured here are encrypted and used by the Control Center to issue live Pterodactyl console commands and maintain 24/7 worker uptime on Render.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
