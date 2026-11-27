import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import {
  PageHeader,
  StatusBadge,
  StatusDot,
  MetricCard,
  StatCard,
  ResponsiveTable,
  EmptyState,
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
  ShieldCheck
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

  const targetAddress = serverMetrics?.serverAddress || (settings?.bedrock?.host ? `${settings.bedrock.host}:${settings.bedrock.port || 19132}` : 'Not configured');
  const worldName = settings?.bedrock?.worldName || serverMetrics?.worldName || 'Bedrock Server';
  const transportName = settings?.bedrock?.transport || 'NetherNet';
  const bdsVersion = serverMetrics?.version && serverMetrics.version !== 'Unknown' ? serverMetrics.version : '---';

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
      <PageHeader
        eyebrow="Operations / Overview"
        title="Server overview"
        detail={`Live telemetry and chunk loader health for ${worldName}.`}
        actions={
          <StatusBadge tone={settings?.autoTeleport?.enabled !== false ? 'success' : 'neutral'}>
            <ShieldCheck size={14} />
            <span>Auto-TP restart guard {settings?.autoTeleport?.enabled !== false ? 'active' : 'paused'}</span>
          </StatusBadge>
        }
      />

      {/* Hero Section: BDS Status & Primary Metrics */}
      <section className="cc-card" style={{ marginBottom: 24, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div className={`cc-icon-box ${serverMetrics?.online ? 'is-success' : 'is-danger'}`} style={{ width: 42, height: 42 }}>
              <Server size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>{worldName}</h2>
                <StatusBadge tone={serverMetrics?.online ? 'success' : 'danger'}>
                  <StatusDot tone={serverMetrics?.online ? 'success' : 'danger'} />
                  <span>{serverMetrics?.online ? 'Online' : 'Offline'}</span>
                </StatusBadge>
              </div>
              <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ textTransform: 'capitalize' }}>{transportName}</span> transport · Bedrock Dedicated Server · v{bdsVersion}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge tone="neutral">
              <Radio size={12} />
              <span>Target</span>
            </StatusBadge>
            <span className="cc-mono" style={{ fontSize: 12 }}>{targetAddress}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy server address"
              title="Copy server address"
              onClick={copyAddress}
              style={{ width: 30, height: 30 }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
            </Button>
          </div>
        </div>

        <div className="cc-metrics-strip">
          <MetricCard
            label="Server address"
            value={targetAddress}
            meta="Bedrock · UDP"
            icon={Radio}
          />
          <MetricCard
            label="World & version"
            value={worldName}
            meta={`Bedrock ${bdsVersion}`}
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
            meta={serverMetrics?.online ? 'Telemetry stable' : 'Server offline'}
            icon={Activity}
            trend={serverMetrics?.online ? 'stable' : undefined}
          />
          <MetricCard
            label="Restarts tracked"
            value={String(serverMetrics?.restartCount || 0)}
            meta="Since guard enabled"
            icon={RotateCcw}
          />
        </div>
      </section>

      {/* Secondary Stat Strip */}
      <div className="cc-stat-grid" style={{ marginBottom: 28 }}>
        <StatCard
          label="BDS uptime"
          value={serverMetrics?.online ? (serverMetrics?.uptime || 'Online') : 'Offline'}
          hint={serverMetrics?.online ? 'Since last restart' : 'Awaiting server start'}
          icon={Clock3}
          tone={serverMetrics?.online ? 'success' : 'neutral'}
        />
        <StatCard
          label="Bot workers"
          value={`${activeBotsCount} / ${bots.length}`}
          hint="Active in BDS"
          icon={Bot}
          tone="primary"
        />
        <StatCard
          label="Farm chunks"
          value={String(totalChunksEstimate)}
          hint="2 × 2 chunk radius · estimate"
          icon={Cpu}
          tone="warning"
        />
        <StatCard
          label="WebSocket"
          value={wsConnected ? 'Connected' : 'Reconnecting'}
          hint={wsConnected ? 'Updates streaming · live' : 'Connecting to /ws/live'}
          icon={Wifi}
          tone={wsConnected ? 'success' : 'warning'}
        />
      </div>

      {/* 2-Column Split: Bot Position Manager & Farm Loaders */}
      <div className="cc-overview-split" style={{ marginBottom: 28 }}>
        {/* Bot Position Manager Summary */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Bot position manager</h2>
              <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text-muted)' }}>
                Worker state and distance from assigned farm.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('bots')}>
              <span>Manage bots</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bots.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="No bot workers registered"
                description="Register an AFK bot in Bot Manager to keep farms loaded."
                action={
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('bots')}>
                    Open Bot Manager
                  </Button>
                }
              />
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
                    className="cc-card"
                    style={{ padding: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}
                  >
                    <div className="cc-icon-box">
                      <Bot size={18} />
                    </div>

                    <div style={{ minWidth: 120, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{bot.name}</p>
                        <StatusBadge tone={badgeTone}>
                          {isOnline ? (isOptimal ? 'At farm' : 'Misplaced') : 'Paused'}
                        </StatusBadge>
                      </div>
                      <p className="cc-truncate" style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                        {farm?.name || bot.assignedFarm || 'No farm assigned'} · Current{' '}
                        <span className="cc-mono" style={{ color: 'var(--text-primary)' }}>
                          {botX}, {botY}, {botZ}
                        </span>
                      </p>
                    </div>

                    {isOnline && !isOptimal && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--warning)' }}>
                        {distance} blocks away
                      </span>
                    )}

                    <Button variant="outline" size="sm" onClick={() => teleportBot(bot.id)}>
                      <Zap size={13} />
                      <span>Teleport</span>
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Farm Loaders Summary */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Farm loaders</h2>
              <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text-muted)' }}>
                Configured chunk loading targets.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab('farms')}>
              <span>View farms</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          {farms.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No farm loaders configured"
              description="Add farm coordinates to assign AFK bots."
              action={
                <Button size="sm" variant="outline" onClick={() => setActiveTab('farms')}>
                  Open Farm Loaders
                </Button>
              }
            />
          ) : (
            <div className="cc-card" style={{ overflow: 'hidden' }}>
              {farms.slice(0, 4).map((farm, idx) => {
                const fx = farm.coordinates?.x ?? farm.x ?? 0;
                const fy = farm.coordinates?.y ?? farm.y ?? 64;
                const fz = farm.coordinates?.z ?? farm.z ?? 0;

                return (
                  <div
                    key={farm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '14px 16px',
                      borderTop: idx > 0 ? '1px solid var(--border-subtle)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div className="cc-icon-box is-success">
                        <Layers size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p className="cc-truncate" style={{ fontSize: 13, fontWeight: 600 }}>{farm.name}</p>
                        <p className="cc-mono cc-truncate" style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
                          {fx}, {fy}, {fz}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone="neutral">{farm.type || 'Custom Farm'}</StatusBadge>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Live Activity Feed */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Live activity</h2>
            <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text-muted)' }}>
              Recent server and worker events.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('activity')}>
            <span>Full audit log</span>
            <ArrowRight size={14} />
          </Button>
        </div>

        <ResponsiveTable
          columns={['Time', 'Event', 'Description', 'Source']}
          footer="Latest events · live streaming"
        >
          {activityLogs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                No activity logs recorded yet.
              </td>
            </tr>
          ) : (
            activityLogs.slice(0, 5).map((log) => {
              const eventKind = log.type || (log.event?.includes('TP') ? 'Teleport' : log.event?.includes('BOT') ? 'Bot' : 'Server');
              const badgeTone = eventKind === 'Teleport' ? 'primary' : eventKind === 'Bot' ? 'warning' : 'neutral';
              const timeFormatted = log.timestamp
                ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                : log.time || 'Just now';

              return (
                <tr key={log.id}>
                  <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {timeFormatted}
                  </td>
                  <td>
                    <StatusBadge tone={badgeTone}>
                      {log.event || log.action || 'EVENT'}
                    </StatusBadge>
                  </td>
                  <td style={{ maxWidth: 440 }}>
                    {log.details || log.description || log.message}
                  </td>
                  <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {log.source || 'ControlCenter'}
                  </td>
                </tr>
              );
            })
          )}
        </ResponsiveTable>
      </section>

      <footer
        style={{
          marginTop: 36,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          fontSize: 11,
          color: 'var(--text-muted)'
        }}
      >
        <span>{worldName} Control Center · BDS v{bdsVersion}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusDot tone={serverMetrics?.online ? 'success' : 'muted'} />
          <span>{serverMetrics?.online ? 'Production BDS Online' : 'Production BDS Offline'} · {targetAddress}</span>
        </span>
      </footer>
    </div>
  );
}
