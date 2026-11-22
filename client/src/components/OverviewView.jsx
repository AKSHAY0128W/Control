import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  PageHeader, 
  Badge, 
  StatusDot, 
  MetricCard, 
  SecondaryCard, 
  Button 
} from './ui/Shared';
import { 
  Server, 
  Radio, 
  Copy, 
  Check, 
  Gamepad2, 
  Users, 
  Activity, 
  RotateCcw, 
  Clock3, 
  Bot, 
  Cpu, 
  Wifi, 
  Layers, 
  Zap, 
  ArrowRight, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export function OverviewView() {
  const { 
    serverMetrics, 
    bots, 
    farms, 
    activityLogs, 
    setActiveTab, 
    teleportBot,
    wsConnected,
    settings,
    setLastNotification
  } = useControlCenter();

  const [copied, setCopied] = useState(false);

  const targetAddress = serverMetrics?.serverAddress || `${settings?.bedrock?.host || 'ayx.acido.dev'}:${settings?.bedrock?.port || 19132}`;
  const worldName = serverMetrics?.worldName || settings?.bedrock?.worldName || 'CherryVale SMP';
  const transportName = settings?.bedrock?.transport || 'NetherNet';

  const copyAddress = () => {
    navigator.clipboard?.writeText(targetAddress);
    setCopied(true);
    if (setLastNotification) {
      setLastNotification({ type: 'success', text: `Target address (${targetAddress}) copied to clipboard.` });
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const activeBotsCount = bots.filter(b => b.enabled !== false && (b.status === 'online' || b.status === 'connecting')).length;
  const totalChunksEstimate = farms.length * 4;

  return (
    <div>
      {/* Top Page Header */}
      <PageHeader
        eyebrow="Operations / Overview"
        title="Server overview"
        detail={`Live telemetry and chunk loader health for ${worldName}.`}
        actions={
          <Badge tone={settings?.autoTeleport?.enabled !== false ? "success" : "neutral"}>
            <ShieldCheck className="size-3.5" />
            <span>Auto-TP restart guard active</span>
          </Badge>
        }
      />

      {/* Hero Section: BDS Status */}
      <section className="mb-6 rounded-lg border border-border bg-card shadow-sm">
        {/* Top Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg ${serverMetrics?.online ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              <Server className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-foreground">{worldName}</h2>
                <Badge tone={serverMetrics?.online ? "success" : "danger"}>
                  <StatusDot tone={serverMetrics?.online ? "success" : "danger"} />
                  <span>{serverMetrics?.online ? "Online" : "Offline"}</span>
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="capitalize">{transportName}</span> transport <span className="mx-1">·</span> Bedrock Dedicated Server <span className="mx-1">·</span> v{serverMetrics?.version || '1.26.61'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone="neutral">
              <Radio className="size-3" />
              <span>Target</span>
            </Badge>
            <span className="font-mono text-xs text-foreground">{targetAddress}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Copy server address"
              title="Copy server address"
              onClick={copyAddress}
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        </div>

        {/* 5-Column Metrics Strip */}
        <div className="grid grid-cols-2 divide-y divide-border px-4 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5">
          <MetricCard
            label="Server address"
            value={targetAddress}
            meta="Bedrock · UDP"
            icon={Radio}
          />
          <MetricCard
            label="World & version"
            value={worldName}
            meta={`Bedrock ${serverMetrics?.version || '1.26.61'}`}
            icon={Gamepad2}
          />
          <MetricCard
            label="Online players"
            value={`${serverMetrics?.playerCount || 0} / ${serverMetrics?.maxPlayers || 10}`}
            meta={`${bots.length} bot${bots.length !== 1 ? 's' : ''} registered`}
            icon={Users}
            accent={true}
          />
          <MetricCard
            label="Ping / latency"
            value={serverMetrics?.online ? `${serverMetrics?.latencyMs || 0} ms` : '---'}
            meta={serverMetrics?.online ? "Telemetry stable" : "Server offline"}
            icon={Activity}
            trend={serverMetrics?.online ? "stable" : undefined}
          />
          <MetricCard
            label="Restarts tracked"
            value={String(serverMetrics?.restartCount || 0)}
            meta="Since guard enabled"
            icon={RotateCcw}
          />
        </div>
      </section>

      {/* 4-Metric Secondary Row */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SecondaryCard
          label="BDS uptime"
          value={serverMetrics?.online ? (serverMetrics?.uptime || 'Online') : 'Offline'}
          hint={serverMetrics?.online ? "Since last restart" : "Awaiting server start"}
          icon={Clock3}
          tone={serverMetrics?.online ? "success" : "neutral"}
        />
        <SecondaryCard
          label="Bot workers"
          value={`${activeBotsCount} / ${bots.length}`}
          hint="Active in BDS"
          icon={Bot}
          tone="primary"
        />
        <SecondaryCard
          label="Farm chunks"
          value={String(totalChunksEstimate)}
          hint="2 × 2 chunk radius · estimate"
          icon={Cpu}
          tone="warning"
        />
        <SecondaryCard
          label="WebSocket"
          value={wsConnected ? "Connected" : "Reconnecting"}
          hint={wsConnected ? "Updates streaming · live" : "Connecting to /ws/live"}
          icon={Wifi}
          tone={wsConnected ? "success" : "warning"}
        />
      </div>

      {/* 2-Column Split: Bot Position Manager & Farm Loaders */}
      <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left: Bot Position Manager Summary */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Bot position manager</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Worker state and distance from assigned farm.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={() => setActiveTab('bots')}
            >
              <span>Manage bots</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="space-y-3">
            {bots.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-4 text-center text-xs text-muted-foreground">
                No bot workers registered yet.
              </div>
            ) : (
              bots.slice(0, 3).map((bot) => {
                const farm = farms.find(f => f.id === bot.farmId || f.name === bot.assignedFarm);
                const botX = bot.currentCoordinates?.x ?? bot.targetCoordinates?.x ?? 0;
                const botY = bot.currentCoordinates?.y ?? bot.targetCoordinates?.y ?? 64;
                const botZ = bot.currentCoordinates?.z ?? bot.targetCoordinates?.z ?? 0;
                const farmX = farm?.coordinates?.x ?? farm?.x;
                const farmY = farm?.coordinates?.y ?? farm?.y ?? 64;
                const farmZ = farm?.coordinates?.z ?? farm?.z;

                const distance = farm && farmX != null && farmZ != null
                  ? Math.round(Math.hypot(botX - farmX, botY - farmY, botZ - farmZ))
                  : 0;
                const isOptimal = distance <= 10;
                const isOnline = bot.enabled !== false && (bot.status === 'online' || bot.status === 'connecting');
                const badgeTone = isOnline ? (isOptimal ? 'success' : 'warning') : 'neutral';

                return (
                  <div
                    key={bot.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Bot className="size-[18px]" />
                    </div>

                    <div className="min-w-[100px] flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{bot.name}</p>
                        <Badge tone={badgeTone}>
                          {isOnline ? (isOptimal ? 'At farm' : 'Misplaced') : 'Paused'}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">
                        {farm?.name || bot.assignedFarm || 'No farm assigned'}{' '}
                        <span className="mx-1">·</span> Current{' '}
                        <span className="font-mono text-foreground">
                          {botX}, {botY}, {botZ}
                        </span>
                      </p>
                    </div>

                    {isOnline && !isOptimal && (
                      <span className="text-[10px] font-medium text-warning">
                        {distance} blocks away
                      </span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[11px]"
                      onClick={() => teleportBot(bot.id)}
                    >
                      <Zap className="size-3.5" />
                      <span>Teleport</span>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Farm Loaders Summary */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Farm loaders</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Configured chunk loading targets.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={() => setActiveTab('farms')}
            >
              <span>View farms</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {farms.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No farm loaders configured yet.
              </div>
            ) : (
              farms.slice(0, 3).map((farm) => {
                const fx = farm.coordinates?.x ?? farm.x ?? 0;
                const fy = farm.coordinates?.y ?? farm.y ?? 64;
                const fz = farm.coordinates?.z ?? farm.z ?? 0;

                return (
                  <div key={farm.id} className="flex items-center justify-between gap-3 p-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                        <Layers className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">{farm.name}</p>
                        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                          {fx}, {fy}, {fz}
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral">{farm.type || 'Custom Farm'}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Full-Width Section: Live Activity Feed */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Live activity</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Recent server and worker events.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs cursor-pointer"
            onClick={() => setActiveTab('activity')}
          >
            <span>Full audit log</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>

        {/* Compact Activity Table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Event</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activityLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                activityLogs.slice(0, 4).map((log) => {
                  const eventKind = log.type || (log.event?.includes('TP') ? 'Teleport' : log.event?.includes('BOT') ? 'Bot' : 'Server');
                  const badgeTone = eventKind === 'Teleport' ? 'primary' : eventKind === 'Bot' ? 'warning' : 'neutral';
                  const timeFormatted = log.timestamp 
                    ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                    : log.time || 'Just now';

                  return (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                        {timeFormatted}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={badgeTone}>
                          {log.event || log.action || 'EVENT'}
                        </Badge>
                      </td>
                      <td className="max-w-[440px] px-4 py-3 text-foreground">
                        {log.details || log.description || log.message}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                        {log.source || 'ControlCenter'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
            Latest events <span className="mx-1">·</span> live streaming
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border py-4 text-[10px] text-muted-foreground">
        <span>OUR SMP Control Center <span className="mx-1">·</span> BDS v{serverMetrics?.version || '1.26.61'}</span>
        <span className="flex items-center gap-1.5">
          <StatusDot tone={serverMetrics?.online ? "success" : "neutral"} />
          <span>{serverMetrics?.online ? "Production BDS Online" : "Production BDS Offline"}</span>
          <span className="mx-1">·</span>
          <span>{targetAddress}</span>
        </span>
      </footer>
    </div>
  );
}
