import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import {
  PageHeader,
  StatusBadge,
  StatusDot,
  CoordinateBadge,
  Switch,
  EmptyState,
  ConfirmDialog,
  Button
} from './ui/Shared';
import {
  Bot,
  Cpu,
  Clock,
  Pencil,
  Trash2,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';

export function BotManager({ onOpenAddBot, onOpenEditCoords, onOpenCustomTeleport }) {
  const {
    bots,
    farms,
    teleportBot,
    updateBot,
    toggleBot,
    deleteBot,
    syncRender,
    settings,
    setLastNotification
  } = useControlCenter();

  const [teleportingId, setTeleportingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleInstantTeleport = async (bot) => {
    setTeleportingId(bot.id);
    try {
      await teleportBot(bot.id);
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Dispatched teleport command for ${bot.name} to farm.` });
      }
    } finally {
      setTimeout(() => setTeleportingId(null), 800);
    }
  };

  const handleToggleActive = async (bot) => {
    await toggleBot(bot.id);
  };

  const handleToggleAutoTp = async (bot) => {
    await updateBot(bot.id, {
      autoTeleport: !(bot.autoTeleport ?? bot.autoTp ?? true),
      autoTp: !(bot.autoTeleport ?? bot.autoTp ?? true)
    });
  };

  const handleManualSyncRender = async () => {
    setSyncing(true);
    try {
      await syncRender();
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: 'Render worker pool synchronized successfully.' });
      }
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  const calculateDistance = (target, current) => {
    if (!target || !current) return 0;
    const dx = (target.x || 0) - (current.x || 0);
    const dy = (target.y || 0) - (current.y || 0);
    const dz = (target.z || 0) - (current.z || 0);
    return Math.round(Math.hypot(dx, dy, dz));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Workers / Render orchestrator"
        title="Bot manager"
        detail="Review worker location, farm targets, and restart behavior."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleManualSyncRender} disabled={syncing}>
              <RefreshCw
                size={14}
                style={syncing ? { animation: 'spin 1s linear infinite' } : undefined}
              />
              <span>{syncing ? 'Syncing...' : 'Sync to Render'}</span>
            </Button>
            <Button size="sm" onClick={onOpenAddBot}>
              <Plus size={15} />
              <span>Register new bot</span>
            </Button>
          </>
        }
      />

      {/* Render Worker Strip */}
      <div
        className="cc-card"
        style={{
          marginBottom: 20,
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="cc-icon-box" style={{ width: 32, height: 32 }}>
            <Cpu size={15} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Render worker service</span>
        </div>

        <span className="cc-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0'}
        </span>

        <StatusBadge tone="success">
          <CheckCircle2 size={12} />
          <span>Auto-sync ready</span>
        </StatusBadge>

        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--warning)' }}>
          <Clock size={13} />
          <span>10m keep-alive guard active</span>
        </span>
      </div>

      {/* Bot Cards Grid */}
      {bots.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No bots registered"
          description="Register your first AFK bot worker to keep your Bedrock farms chunk-loaded."
          action={
            <Button size="sm" onClick={onOpenAddBot}>
              <Plus size={15} />
              <span>Register new bot</span>
            </Button>
          }
        />
      ) : (
        <div className="cc-grid-2">
          {bots.map((bot) => {
            const isEnabled = bot.enabled !== false && (bot.status === 'online' || bot.status === 'connecting' || bot.status === 'reconnecting');
            const autoTp = bot.autoTeleport ?? bot.autoTp ?? true;

            const farm = farms.find(f => f.id === bot.farmId || f.name === bot.assignedFarm || f.name === bot.targetFarm);
            const targetCoords = bot.targetCoordinates || (farm ? { x: farm.coordinates?.x ?? farm.x ?? 0, y: farm.coordinates?.y ?? farm.y ?? 64, z: farm.coordinates?.z ?? farm.z ?? 0 } : { x: bot.x ?? 0, y: bot.y ?? 64, z: bot.z ?? 0 });
            const currentCoords = bot.currentCoordinates || { x: bot.x ?? 0, y: bot.y ?? 64, z: bot.z ?? 0 };

            const distance = calculateDistance(targetCoords, currentCoords);
            const isAtFarm = distance <= 10;
            const statusTone = bot.status === 'online' ? (isAtFarm ? 'success' : 'warning')
              : bot.status === 'connecting' || bot.status === 'reconnecting' ? 'warning'
                : 'neutral';
            const isTeleporting = teleportingId === bot.id;

            return (
              <article key={bot.id} className="cc-card" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 16,
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="cc-icon-box" style={{ width: 40, height: 40 }}>
                    <Bot size={19} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600 }}>{bot.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${bot.name}`}
                        onClick={() => onOpenEditCoords(bot)}
                        style={{ width: 26, height: 26 }}
                      >
                        <Pencil size={13} />
                      </Button>
                      <StatusBadge tone="neutral">
                        {farm?.name || bot.assignedFarm || 'Unassigned'}
                      </StatusBadge>
                    </div>

                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <StatusDot tone={isEnabled ? 'success' : 'muted'} />
                      <span>
                        {bot.status === 'online' ? 'Connected · in game'
                          : bot.status === 'connecting' ? 'Connecting...'
                            : bot.status === 'reconnecting' ? 'Reconnecting...'
                              : 'Paused · not in game'}
                      </span>
                    </div>
                  </div>

                  <StatusBadge tone={statusTone}>
                    {bot.status === 'online'
                      ? (isAtFarm ? 'Online · at farm' : 'Misplaced')
                      : bot.status === 'connecting' ? 'Connecting...'
                        : bot.status === 'reconnecting' ? 'Reconnecting...'
                          : 'Paused'}
                  </StatusBadge>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${bot.name}`}
                    onClick={() => setConfirmTarget(bot)}
                    style={{ width: 32, height: 32, color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>

                {/* Coordinates Split */}
                <div className="cc-grid-2" style={{ gap: 12, padding: 16 }}>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-alt)'
                    }}
                  >
                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
                      Target farm
                    </p>
                    <CoordinateBadge x={targetCoords.x} y={targetCoords.y} z={targetCoords.z} />
                    <p className="cc-mono" style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      Overworld · {farm?.name || bot.assignedFarm || 'No farm'}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-alt)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        Current position
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'var(--success)' }}>
                        <Radio size={11} />
                        <span>Live packet</span>
                      </span>
                    </div>
                    <CoordinateBadge x={currentCoords.x} y={currentCoords.y} z={currentCoords.z} />
                    <p className="cc-mono" style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{settings?.bedrock?.transport || 'NetherNet'}</span> · BDS
                    </p>
                  </div>
                </div>

                {/* Distance Strip */}
                <div
                  style={{
                    margin: '0 16px 12px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isAtFarm ? 'var(--success-border)' : 'var(--warning-border)'}`,
                    background: isAtFarm ? 'var(--success-soft)' : 'var(--warning-soft)',
                    color: isAtFarm ? 'var(--success)' : 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                >
                  {isAtFarm ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>
                    {isAtFarm
                      ? 'Position: At Farm · Optimal chunk loading'
                      : `Misplaced: ${distance} blocks away · Needs teleport`}
                  </span>
                </div>

                {/* Switches */}
                <div
                  className="cc-grid-2"
                  style={{
                    gap: 0,
                    borderTop: '1px solid var(--border-subtle)',
                    padding: '0 16px'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 500 }}>Active in BDS</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Worker runs on Render</span>
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggleActive(bot)}
                      aria-label={`Active in BDS for ${bot.name}`}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', cursor: 'pointer' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 500 }}>Auto-teleport on reboot</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Relocate after server restart</span>
                    </span>
                    <Switch
                      checked={autoTp}
                      onCheckedChange={() => handleToggleAutoTp(bot)}
                      aria-label={`Auto-teleport on reboot for ${bot.name}`}
                    />
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <Button size="sm" style={{ flex: 1 }} disabled={isTeleporting} onClick={() => handleInstantTeleport(bot)}>
                    <Zap size={14} />
                    <span>{isTeleporting ? 'Teleporting...' : 'Teleport to farm'}</span>
                  </Button>
                  <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => onOpenCustomTeleport(bot)}>
                    Custom TP
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={`Remove bot "${confirmTarget?.name}"?`}
        message="This will stop the worker and remove it from Render synchronization."
        confirmLabel="Remove bot"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={async () => {
          const id = confirmTarget?.id;
          setConfirmTarget(null);
          if (id) await deleteBot(id);
        }}
      />
    </div>
  );
}
