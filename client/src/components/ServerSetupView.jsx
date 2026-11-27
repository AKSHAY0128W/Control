import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { api } from '../services/api';
import { Button, Badge, StatusDot } from './ui/Shared';
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
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-[480px]">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Server className="size-5" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">
                {worldName.trim() || 'Bedrock Control Center'}
              </p>
              <p className="text-xs text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user?.name || user?.username}</span>
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-xs text-muted-foreground">
            <LogOut className="size-3.5" />
            <span>Sign out</span>
          </Button>
        </div>

        {/* Setup Card */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <span>Initial Server Setup</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Connect your Bedrock server</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your server details below. Your World Name becomes your panel name.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span>World / Panel Name</span>
              <input
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="e.g. Survival SMP"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px]">
              <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  Server IP / Hostname
                </span>
                <input
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. play.myserver.net"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 font-mono text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>

              <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
                <span>Port</span>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="19132"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 font-mono text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>
            </div>

            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Radio className="size-3.5" />
                Transport Protocol
              </span>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="nethernet">NetherNet (Bedrock Dedicated Server)</option>
                <option value="raknet">RakNet / UDP</option>
              </select>
            </label>

            {/* Test Connection Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing}
                className="gap-2"
              >
                <RefreshCw className={`size-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test connection'}</span>
              </Button>

              {testResult && (
                <Badge tone={testResult.success ? 'success' : 'warning'}>
                  <StatusDot tone={testResult.success ? 'success' : 'warning'} />
                  <span>
                    {testResult.success
                      ? `Online · ${testResult.latencyMs ?? '?'}ms (v${testResult.data?.version || '?'})`
                      : 'Server unreachable (you can still save)'}
                  </span>
                </Badge>
              )}
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-danger">
                {error}
              </p>
            )}

            <Button type="submit" disabled={saving} className="w-full gap-2 mt-2 h-10">
              <span>{saving ? 'Saving configuration...' : 'Launch Control Center'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
