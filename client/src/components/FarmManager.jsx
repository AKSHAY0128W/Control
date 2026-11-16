import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Layers, MapPin, Zap, Plus, Edit2 } from 'lucide-react';

export function FarmManager({ onOpenAddFarm, onOpenEditFarm }) {
  const { farms, bots, teleportBot } = useControlCenter();
  const [teleportingFarmId, setTeleportingFarmId] = useState(null);

  const handleTeleportBotToFarm = async (farm) => {
    // Find bot assigned to this farm
    const assigned = bots.find(b => b.assignedFarm?.toLowerCase() === farm.name.toLowerCase() || b.name.toLowerCase() === farm.assignedBot?.toLowerCase());
    if (!assigned) {
      alert(`No active bot is assigned to ${farm.name}. Assign a bot first.`);
      return;
    }

    setTeleportingFarmId(farm.id);
    await teleportBot(assigned.id, farm.coordinates);
    setTimeout(() => setTeleportingFarmId(null), 700);
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <div className="section-header">
        <div>
          <div className="section-title">
            <Layers size={22} color="#10b981" />
            <span>Farm Management & Chunk Loader Coordinates</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Configured AFK farm locations. Teleport assigned bots here to keep golem spawners and crops loaded.
          </div>
        </div>

        <button className="btn btn-sm" onClick={onOpenAddFarm}>
          <Plus size={14} />
          Add Farm
        </button>
      </div>

      <div className="farm-grid">
        {farms.map((farm) => {
          const isTeleporting = teleportingFarmId === farm.id;

          return (
            <div key={farm.id} className="farm-card">
              <div className="farm-title-row">
                <span className="farm-name">{farm.name}</span>
                <span className="farm-type-badge">{farm.type}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {farm.description || 'Production chunk loader location.'}
              </div>

              <div className="coords-box" style={{ padding: '10px 14px' }}>
                <div className="coord-row">
                  <span className="coord-label">
                    <MapPin size={13} color="var(--primary)" />
                    Coords ({farm.dimension}):
                  </span>
                  <span className="coord-values" style={{ fontSize: '0.85rem' }}>
                    {farm.coordinates?.x}, {farm.coordinates?.y}, {farm.coordinates?.z}
                  </span>
                </div>

                <div className="coord-row">
                  <span className="coord-label">Assigned Bot:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-text)', fontSize: '0.85rem' }}>
                    {farm.assignedBot || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  className="btn btn-teleport btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleTeleportBotToFarm(farm)}
                  disabled={isTeleporting}
                  title={`Teleport ${farm.assignedBot} to ${farm.name}`}
                >
                  <Zap size={13} />
                  {isTeleporting ? 'Teleporting...' : `TP ${farm.assignedBot || 'Bot'}`}
                </button>

                <button
                  className="btn btn-sm"
                  onClick={() => onOpenEditFarm(farm)}
                  title="Edit farm coordinates"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
