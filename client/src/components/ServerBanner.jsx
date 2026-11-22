import React from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { RefreshCw, Radio, Users, Compass, Clock, RotateCcw, ShieldCheck } from 'lucide-react';

export function ServerBanner() {
  const { serverMetrics, refreshServer, settings } = useControlCenter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshServer();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Radio size={18} className={serverMetrics.online ? 'pulse-dot online' : ''} />
          <span>Minecraft Bedrock Server Status</span>
          <span className={`status-pill ${serverMetrics.online ? 'online' : 'offline'}`}>
            <span className={`pulse-dot ${serverMetrics.online ? 'online' : 'offline'}`} />
            {serverMetrics.online ? 'Online' : 'Offline / Rebooting'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {settings.autoTeleport?.enabled && (
            <span className="status-pill online" style={{ fontSize: '0.72rem' }}>
              <ShieldCheck size={13} />
              Auto-TP Active (Restart Guard)
            </span>
          )}

          <button className="btn btn-sm" onClick={handleRefresh} disabled={isRefreshing} title="Poll server status now">
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="server-banner-grid">
        <div className="server-stat-box">
          <div className="stat-label">Server Address</div>
          <div className="stat-value highlight mono" style={{ fontSize: '0.98rem' }}>{serverMetrics.serverAddress || 'Target BDS'}</div>
        </div>

        <div className="server-stat-box">
          <div className="stat-label">World & Version</div>
          <div className="stat-value" style={{ fontSize: '0.98rem' }}>
            {serverMetrics.worldName} <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>({serverMetrics.version})</span>
          </div>
        </div>

        <div className="server-stat-box">
          <div className="stat-label">Online Players</div>
          <div className="stat-value green" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={16} />
            {serverMetrics.playerCount} / {serverMetrics.maxPlayers}
          </div>
        </div>

        <div className="server-stat-box">
          <div className="stat-label">Ping / Latency</div>
          <div className="stat-value mono">
            {serverMetrics.online ? `${serverMetrics.latencyMs}ms` : '---'}
          </div>
        </div>

        <div className="server-stat-box">
          <div className="stat-label">Restarts Tracked</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
            <RotateCcw size={16} />
            {serverMetrics.restartCount}
          </div>
        </div>
      </div>
    </div>
  );
}
