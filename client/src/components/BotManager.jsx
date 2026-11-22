import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  PageHeader, 
  Badge, 
  StatusDot, 
  CoordinateBadge, 
  Switch, 
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
      {/* Page Header with Action Buttons */}
      <PageHeader
        eyebrow="Workers / Render orchestrator"
        title="Bot manager"
        detail="Review worker location, farm targets, and restart behavior."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSyncRender}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync to Render'}</span>
            </Button>
            <Button
              size="sm"
              onClick={onOpenAddBot}
              className="gap-2"
            >
              <Plus className="size-4" />
              <span>Register new bot</span>
            </Button>
          </>
        }
      />

      {/* Render Service Information Strip */}
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Cpu className="size-4" />
          </span>
          <span className="font-semibold text-foreground">Render worker service</span>
        </div>

        <span className="font-mono text-[11px] text-muted-foreground">
          {settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0'}
        </span>

        <Badge tone="success">
          <CheckCircle2 className="size-3" />
          <span>Auto-sync ready</span>
        </Badge>

        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-warning">
          <Clock className="size-3.5" />
          <span>10m keep-alive guard active</span>
        </span>
      </div>

      {/* Bot Cards Grid */}
      {bots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Bot className="mx-auto size-10 text-muted-foreground opacity-50" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No bots registered</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Register your first AFK bot worker to keep your Bedrock farms chunk-loaded.
          </p>
          <Button size="sm" onClick={onOpenAddBot} className="mt-4 gap-2">
            <Plus className="size-4" />
            <span>Register new bot</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {bots.map((bot) => {
            const isEnabled = bot.enabled !== false && (bot.status === 'online' || bot.status === 'connecting' || bot.status === 'reconnecting');
            const autoTp = bot.autoTeleport ?? bot.autoTp ?? true;

            // Target coordinates from assigned farm or bot object
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
              <article key={bot.id} className="rounded-lg border border-border bg-card shadow-sm">
                {/* Bot Card Header */}
                <div className="flex flex-wrap items-start gap-3 border-b border-border p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{bot.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${bot.name}`}
                        onClick={() => onOpenEditCoords(bot)}
                      >
                        <Pencil className="size-3" />
                      </Button>
                      <Badge tone="neutral">
                        {farm?.name || bot.assignedFarm || 'Unassigned'}
                      </Badge>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <StatusDot tone={isEnabled ? 'success' : 'muted'} />
                      <span>
                        {bot.status === 'online' ? 'Connected · in game' 
                          : bot.status === 'connecting' ? 'Connecting...'
                          : bot.status === 'reconnecting' ? 'Reconnecting...'
                          : 'Paused · not in game'}
                      </span>
                    </div>
                  </div>

                  <Badge tone={statusTone}>
                    {bot.status === 'online' 
                      ? (isAtFarm ? 'Online · at farm' : 'Misplaced') 
                      : bot.status === 'connecting' ? 'Connecting...'
                      : bot.status === 'reconnecting' ? 'Reconnecting...'
                      : 'Paused'}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                    aria-label={`Delete ${bot.name}`}
                    onClick={() => {
                      if (confirm(`Remove bot "${bot.name}"? This will pause it and remove it from Render synchronization.`)) {
                        deleteBot(bot.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Sub-Boxes: Target Farm vs Current Position */}
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  {/* Target Coordinates Box */}
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Target farm
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[10px]"
                        onClick={() => onOpenEditCoords(bot)}
                      >
                        Edit
                      </Button>
                    </div>
                    <CoordinateBadge
                      x={targetCoords.x}
                      y={targetCoords.y}
                      z={targetCoords.z}
                    />
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      Overworld <span className="mx-1">·</span> {farm?.name || bot.assignedFarm || 'No farm'}
                    </p>
                  </div>

                  {/* Current Position Box */}
                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Current position
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-success font-medium">
                        <Radio className="size-3" />
                        Live packet
                      </span>
                    </div>
                    <CoordinateBadge
                      x={currentCoords.x}
                      y={currentCoords.y}
                      z={currentCoords.z}
                    />
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      <span className="capitalize">{settings?.bedrock?.transport || 'NetherNet'}</span> <span className="mx-1">·</span> BDS
                    </p>
                  </div>
                </div>

                {/* Distance Status Strip */}
                <div className={`mx-4 mb-2 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-[11px] ${
                  isAtFarm 
                    ? 'border-success/20 bg-success/5 text-success' 
                    : 'border-warning/25 bg-warning/5 text-warning'
                }`}>
                  {isAtFarm ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : (
                    <AlertTriangle className="size-3.5" />
                  )}
                  <span className="font-medium">
                    {isAtFarm 
                      ? 'Position: At Farm · Optimal chunk loading' 
                      : `Misplaced: ${distance} blocks away · Needs teleport`}
                  </span>
                </div>

                {/* Divided Switches Row */}
                <div className="grid grid-cols-1 divide-y divide-border border-t border-border px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <label className="flex items-center justify-between gap-3 py-3 pr-0 sm:pr-4 cursor-pointer">
                    <span>
                      <span className="block text-xs font-medium text-foreground">Active in BDS</span>
                      <span className="text-[10px] text-muted-foreground">Worker runs on Render</span>
                    </span>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggleActive(bot)}
                      aria-label={`Active in BDS for ${bot.name}`}
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 py-3 sm:pl-4 cursor-pointer">
                    <span>
                      <span className="block text-xs font-medium text-foreground">Auto-teleport on reboot</span>
                      <span className="text-[10px] text-muted-foreground">Relocate after server restart</span>
                    </span>
                    <Switch
                      checked={autoTp}
                      onCheckedChange={() => handleToggleAutoTp(bot)}
                      aria-label={`Auto-teleport on reboot for ${bot.name}`}
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 border-t border-border p-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={isTeleporting}
                    onClick={() => handleInstantTeleport(bot)}
                  >
                    <Zap className={`size-3.5 ${isTeleporting ? 'animate-pulse' : ''}`} />
                    <span>{isTeleporting ? 'Teleporting...' : 'Teleport to farm'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onOpenCustomTeleport(bot)}
                  >
                    Custom TP
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
