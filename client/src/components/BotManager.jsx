import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  Bot, 
  MapPin, 
  Zap, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair, 
  Trash2, 
  Power, 
  RefreshCw, 
  ExternalLink,
  Cpu
} from 'lucide-react';

export function BotManager({ onOpenAddBot, onOpenEditCoords, onOpenCustomTeleport }) {
  const { bots, teleportBot, updateBot, toggleBot, deleteBot, syncRender, settings } = useControlCenter();
  const [teleportingId, setTeleportingId] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleInstantTeleport = async (bot) => {
    setTeleportingId(bot.id);
    await teleportBot(bot.id);
    setTimeout(() => setTeleportingId(null), 700);
  };

  const handleToggleAutoTp = async (bot) => {
    await updateBot(bot.id, { autoTeleport: !bot.autoTeleport });
  };

  const handleToggleEnabled = async (bot) => {
    await toggleBot(bot.id);
  };

  const handleManualSyncRender = async () => {
    setSyncing(true);
    await syncRender();
    setTimeout(() => setSyncing(false), 800);
  };

  const calculateDistance = (target, current) => {
    if (!target || !current) return 0;
    const dx = (target.x || 0) - (current.x || 0);
    const dy = (target.y || 0) - (current.y || 0);
    const dz = (target.z || 0) - (current.z || 0);
    return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));
  };

  return (
    <div>
      {/* Section Header with Actions */}
      <div className="section-header">
        <div>
          <div className="section-title">
            <Bot size={22} color="var(--primary)" />
            <span>Bot Position Manager &amp; Render Orchestrator</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Create, edit, toggle, and auto-teleport AFK farm bots directly synced with your Render deployment.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Sync to Render Button */}
          <button 
            className="btn btn-sm" 
            onClick={handleManualSyncRender} 
            disabled={syncing}
            title="Push active bot list directly to Render service"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync to Render'}</span>
          </button>

          {/* Add Bot Button */}
          <button className="btn btn-primary btn-sm" onClick={onOpenAddBot}>
            <Plus size={14} />
            <span>Register New Bot</span>
          </button>
        </div>
      </div>

      {/* Render Service Information Strip */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Render Bot Worker:</span>
              <code style={{ fontSize: '0.78rem', background: 'var(--bg-card-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                {settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0'}
              </code>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Connected to Render deployment · Free tier 15m idle sleep guard active
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="status-pill online" style={{ fontSize: '0.74rem' }}>
            <span className="pulse-dot online" />
            Auto-Sync Ready
          </span>

          <a 
            href={`https://dashboard.render.com/web/${settings?.render?.serviceId || 'srv-cba31dh5efls73cocdm0'}`}
            target="_blank" 
            rel="noreferrer"
            className="btn btn-sm"
            style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <ExternalLink size={12} />
            <span>Render Console</span>
          </a>
        </div>
      </div>

      {/* Bot Cards Grid */}
      <div className="bot-grid">
        {bots.map((bot) => {
          const distance = calculateDistance(bot.targetCoordinates, bot.currentCoordinates);
          const isAtFarm = distance <= 10;
          const isTeleporting = teleportingId === bot.id;
          const isEnabled = bot.enabled !== false;

          return (
            <div 
              key={bot.id} 
              className="bot-card"
              style={{ opacity: isEnabled ? 1 : 0.75, borderTop: isEnabled ? '3px solid var(--primary)' : '3px solid var(--border-color)' }}
            >
              <div className="bot-card-top">
                <div className="bot-identity">
                  <div className="bot-avatar" style={{ background: isEnabled ? 'var(--primary)' : 'var(--text-subtle)' }}>
                    <Bot size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="bot-name">{bot.name}</span>
                      <button 
                        onClick={() => onOpenEditCoords(bot)}
                        className="btn btn-sm"
                        style={{ padding: '1px 5px', fontSize: '0.68rem' }}
                        title="Edit bot name or assigned farm"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>
                    <div className="bot-farm-tag">
                      Assigned: <strong style={{ color: 'var(--primary-text)' }}>{bot.assignedFarm || 'None'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`status-pill ${!isEnabled ? 'offline' : bot.status === 'online' ? 'online' : bot.status === 'misplaced' ? 'misplaced' : 'offline'}`}>
                    <span className={`pulse-dot ${!isEnabled ? 'offline' : bot.status === 'online' ? 'online' : 'amber'}`} />
                    {!isEnabled ? 'Paused' : bot.status}
                  </span>
                  
                  {/* Delete option */}
                  <button 
                    onClick={() => {
                      if (confirm(`Remove bot "${bot.name}"? It will be disconnected from BDS and unsynced from Render.`)) {
                        deleteBot(bot.id);
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                    title="Delete bot from Render & Control Center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Coordinates Box */}
              <div className="coords-box">
                {/* Target Farm Coordinates */}
                <div className="coord-row">
                  <span className="coord-label">
                    <MapPin size={13} color="var(--primary)" />
                    Target Farm Coords:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="coord-values">
                      X: {bot.targetCoordinates?.x}, Y: {bot.targetCoordinates?.y}, Z: {bot.targetCoordinates?.z}
                    </span>
                    <button 
                      className="btn btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => onOpenEditCoords(bot)}
                      title="Edit assigned farm coordinates"
                    >
                      <Edit3 size={11} />
                      Edit
                    </button>
                  </div>
                </div>

                {/* Current Coordinates */}
                <div className="coord-row">
                  <span className="coord-label">
                    <Crosshair size={13} color="var(--purple)" />
                    Current Position:
                  </span>
                  <span className="coord-values">
                    X: {bot.currentCoordinates?.x}, Y: {bot.currentCoordinates?.y}, Z: {bot.currentCoordinates?.z}
                  </span>
                </div>

                {/* Distance Badge */}
                <div className={`distance-badge ${!isEnabled ? 'misplaced' : isAtFarm ? 'at-farm' : 'misplaced'}`}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!isEnabled ? <Power size={14} /> : isAtFarm ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {!isEnabled ? 'Bot Paused (Offline)' : isAtFarm ? 'Position: At Farm' : `Misplaced: ${distance} blocks away (At Spawn)`}
                  </span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                    {!isEnabled ? 'Inactive' : isAtFarm ? 'Optimal Chunk Loading' : 'Needs Teleport'}
                  </span>
                </div>
              </div>

              {/* Toggles Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
                {/* Enable/Disable Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="switch-label">
                    <div className="switch">
                      <input 
                        type="checkbox" 
                        checked={isEnabled} 
                        onChange={() => handleToggleEnabled(bot)} 
                      />
                      <span className="slider" />
                    </div>
                    <span style={{ fontWeight: 600 }}>Active in BDS</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: isEnabled ? 'var(--success-text)' : 'var(--text-muted)' }}>
                    {isEnabled ? 'Running on Render' : 'Stopped'}
                  </span>
                </div>

                {/* Auto-Teleport on Restart Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="switch-label">
                    <div className="switch">
                      <input 
                        type="checkbox" 
                        checked={bot.autoTeleport} 
                        onChange={() => handleToggleAutoTp(bot)} 
                      />
                      <span className="slider" />
                    </div>
                    <span>Auto-Teleport on Reboot</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bot-actions-row">
                <button
                  className="btn btn-teleport"
                  style={{ flex: 1 }}
                  onClick={() => handleInstantTeleport(bot)}
                  disabled={isTeleporting || !isEnabled}
                  title={`Teleport ${bot.name} directly to target farm (${bot.targetCoordinates.x}, ${bot.targetCoordinates.y}, ${bot.targetCoordinates.z})`}
                >
                  <Zap size={15} />
                  {isTeleporting ? 'Teleporting...' : 'Teleport to Farm'}
                </button>

                <button
                  className="btn"
                  onClick={() => onOpenCustomTeleport(bot)}
                  disabled={!isEnabled}
                  title="Teleport to custom coordinates or another farm"
                >
                  <MapPin size={14} />
                  Custom TP
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
