import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  PageHeader, 
  Badge, 
  CoordinateBadge, 
  SecondaryCard, 
  Button 
} from './ui/Shared';
import { 
  Layers, 
  Cpu, 
  Bot, 
  Plus, 
  MoreVertical, 
  Zap, 
  Pencil 
} from 'lucide-react';

export function FarmManager({ onOpenAddFarm, onOpenEditFarm }) {
  const { farms, bots, teleportBot, setLastNotification } = useControlCenter();
  const [teleportingFarmId, setTeleportingFarmId] = useState(null);

  const handleTeleportBotToFarm = async (farm) => {
    const assignedBot = bots.find(
      b => b.assignedFarm?.toLowerCase() === farm.name?.toLowerCase() ||
           b.farmId === farm.id ||
           b.name?.toLowerCase() === farm.assignedBot?.toLowerCase()
    );

    if (!assignedBot) {
      if (setLastNotification) {
        setLastNotification({ type: 'warning', text: `No bot assigned to ${farm.name}. Assign a bot first.` });
      }
      return;
    }

    setTeleportingFarmId(farm.id);
    try {
      const coords = farm.coordinates || { x: farm.x, y: farm.y, z: farm.z };
      await teleportBot(assignedBot.id, coords);
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Teleport command dispatched: ${assignedBot.name} -> ${farm.name}.` });
      }
    } finally {
      setTimeout(() => setTeleportingFarmId(null), 800);
    }
  };

  const assignedBotsCount = new Set(
    farms.map(f => {
      const b = bots.find(bot => bot.assignedFarm === f.name || bot.farmId === f.id || bot.name === f.assignedBot);
      return b?.id;
    }).filter(Boolean)
  ).size;

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="World / Chunk loading"
        title="Farm loaders"
        detail="Configured destinations and their assigned AFK workers."
        actions={
          <Button size="sm" onClick={onOpenAddFarm} className="gap-2">
            <Plus className="size-4" />
            <span>Add farm</span>
          </Button>
        }
      />

      {/* 3 Top Summary Stat Cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SecondaryCard
          label="Configured farms"
          value={String(farms.length)}
          hint="Overworld destinations"
          icon={Layers}
          tone="success"
        />
        <SecondaryCard
          label="Chunk radius"
          value="2 × 2"
          hint="Estimated loader footprint"
          icon={Cpu}
          tone="primary"
        />
        <SecondaryCard
          label="Assigned bots"
          value={String(assignedBotsCount)}
          hint="Workers mapped to farms"
          icon={Bot}
          tone="warning"
        />
      </div>

      {/* Farm Cards Grid */}
      {farms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Layers className="mx-auto size-10 text-muted-foreground opacity-50" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">No farms configured</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure your iron farm or crop farm coordinates so bots can auto-teleport to them.
          </p>
          <Button size="sm" onClick={onOpenAddFarm} className="mt-4 gap-2">
            <Plus className="size-4" />
            <span>Add farm</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {farms.map((farm) => {
            const assignedBot = bots.find(
              b => b.assignedFarm?.toLowerCase() === farm.name?.toLowerCase() ||
                   b.farmId === farm.id ||
                   b.name?.toLowerCase() === farm.assignedBot?.toLowerCase()
            );

            const coords = farm.coordinates || { x: farm.x ?? 0, y: farm.y ?? 64, z: farm.z ?? 0 };
            const isTeleporting = teleportingFarmId === farm.id;

            return (
              <article key={farm.id} className="rounded-lg border border-border bg-card shadow-sm">
                {/* Farm Card Header */}
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
                      <Layers className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{farm.name}</h3>
                      <p className="mt-1 text-[11px] text-muted-foreground">{farm.type || 'Iron Farm'}</p>
                    </div>
                  </div>

                  {onOpenEditFarm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${farm.name}`}
                      onClick={() => onOpenEditFarm(farm)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </div>

                {/* Target Coordinates Box */}
                <div className="mx-4 rounded-md border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Target coordinates</span>
                    <Badge tone="neutral">{farm.dimension || 'Overworld'}</Badge>
                  </div>
                  <CoordinateBadge x={coords.x} y={coords.y} z={coords.z} />
                </div>

                {/* Assigned Worker Row */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs">
                  <span className="text-muted-foreground">Assigned worker</span>
                  {assignedBot ? (
                    <Badge tone="primary">
                      <Bot className="size-3" />
                      <span>{assignedBot.name}</span>
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Unassigned</Badge>
                  )}
                </div>

                {/* Bottom TP Button */}
                <div className="border-t border-border p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    disabled={!assignedBot || isTeleporting}
                    onClick={() => handleTeleportBotToFarm(farm)}
                  >
                    <Zap className={`size-3.5 ${isTeleporting ? 'animate-pulse' : ''}`} />
                    <span>
                      {isTeleporting 
                        ? 'Teleporting...' 
                        : assignedBot 
                          ? `TP ${assignedBot.name}` 
                          : 'No assigned bot'}
                    </span>
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
