import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import {
  PageHeader,
  StatusBadge,
  CoordinateBadge,
  StatCard,
  EmptyState,
  ConfirmDialog,
  Button
} from './ui/Shared';
import {
  Layers,
  Cpu,
  Bot,
  Plus,
  Zap,
  Pencil,
  Trash2
} from 'lucide-react';

export function FarmManager({ onOpenAddFarm, onOpenEditFarm }) {
  const { farms, bots, teleportBot, deleteFarm, setLastNotification } = useControlCenter();
  const [teleportingFarmId, setTeleportingFarmId] = useState(null);
  const [confirmFarm, setConfirmFarm] = useState(null);

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
      <PageHeader
        eyebrow="World / Chunk loading"
        title="Farm loaders"
        detail="Configured destinations and their assigned AFK workers."
        actions={
          <Button size="sm" onClick={onOpenAddFarm}>
            <Plus size={15} />
            <span>Add farm</span>
          </Button>
        }
      />

      <div className="cc-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
        <StatCard
          label="Configured farms"
          value={String(farms.length)}
          hint="Overworld destinations"
          icon={Layers}
          tone="success"
        />
        <StatCard
          label="Chunk radius"
          value="2 × 2"
          hint="Estimated loader footprint"
          icon={Cpu}
          tone="primary"
        />
        <StatCard
          label="Assigned bots"
          value={String(assignedBotsCount)}
          hint="Workers mapped to farms"
          icon={Bot}
          tone="warning"
        />
      </div>

      {farms.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No farms configured"
          description="Configure your iron farm or crop farm coordinates so bots can auto-teleport to them."
          action={
            <Button size="sm" onClick={onOpenAddFarm}>
              <Plus size={15} />
              <span>Add farm</span>
            </Button>
          }
        />
      ) : (
        <div className="cc-grid-3">
          {farms.map((farm) => {
            const assignedBot = bots.find(
              b => b.assignedFarm?.toLowerCase() === farm.name?.toLowerCase() ||
                   b.farmId === farm.id ||
                   b.name?.toLowerCase() === farm.assignedBot?.toLowerCase()
            );

            const coords = farm.coordinates || { x: farm.x ?? 0, y: farm.y ?? 64, z: farm.z ?? 0 };
            const isTeleporting = teleportingFarmId === farm.id;

            return (
              <article key={farm.id} className="cc-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div className="cc-icon-box is-success" style={{ width: 40, height: 40 }}>
                      <Layers size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="cc-truncate" style={{ fontSize: 14, fontWeight: 600 }}>{farm.name}</h3>
                      <p style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>{farm.type || 'Custom Farm'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {onOpenEditFarm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${farm.name}`}
                        onClick={() => onOpenEditFarm(farm)}
                        style={{ width: 30, height: 30 }}
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${farm.name}`}
                      onClick={() => setConfirmFarm(farm)}
                      style={{ width: 30, height: 30, color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    margin: '0 16px',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-alt)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                      Target coordinates
                    </span>
                    <StatusBadge tone="neutral">{farm.dimension || 'Overworld'}</StatusBadge>
                  </div>
                  <CoordinateBadge x={coords.x} y={coords.y} z={coords.z} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '12px 16px', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned worker</span>
                  {assignedBot ? (
                    <StatusBadge tone="primary">
                      <Bot size={12} />
                      <span>{assignedBot.name}</span>
                    </StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Unassigned</StatusBadge>
                  )}
                </div>

                <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ width: '100%' }}
                    disabled={!assignedBot || isTeleporting}
                    onClick={() => handleTeleportBotToFarm(farm)}
                  >
                    <Zap size={14} />
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

      <ConfirmDialog
        open={Boolean(confirmFarm)}
        title={`Remove farm "${confirmFarm?.name}"?`}
        message="This will remove the farm loader configuration from the dashboard."
        confirmLabel="Remove farm"
        onCancel={() => setConfirmFarm(null)}
        onConfirm={async () => {
          const id = confirmFarm?.id;
          setConfirmFarm(null);
          if (id) await deleteFarm(id);
        }}
      />
    </div>
  );
}
