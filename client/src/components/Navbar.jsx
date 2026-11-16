import React from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Server, Terminal, Settings as SettingsIcon, Zap } from 'lucide-react';

export function Navbar({ onOpenConsole, onOpenSettings }) {
  const { serverMetrics, wsConnected, teleportAllBotsToFarms } = useControlCenter();

  return (
    <header className="top-navbar">
      <div className="brand-section">
        <div className="brand-icon">
          <Server size={24} />
        </div>
        <div>
          <h1 className="brand-title">OUR SMP Control Center</h1>
          <div className="brand-subtitle">Bedrock BDS Bot Manager & Auto-Teleport</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Live WebSocket Status */}
        <div className={`status-pill ${wsConnected ? 'online' : 'offline'}`} title="Live WebSocket connection to Control Center backend">
          <span className={`pulse-dot ${wsConnected ? 'online' : 'offline'}`} />
          {wsConnected ? 'Live Feed' : 'Connecting...'}
        </div>

        {/* Global Fast Action: Teleport All Bots */}
        <button 
          className="btn btn-teleport btn-sm"
          onClick={teleportAllBotsToFarms}
          title="Instantly teleport all farm bots back to their assigned farm coordinates"
        >
          <Zap size={14} />
          Teleport All Bots to Farms
        </button>

        {/* Console Command Terminal */}
        <button className="btn btn-sm" onClick={onOpenConsole} title="Execute server console command">
          <Terminal size={14} />
          Console
        </button>

        {/* Settings */}
        <button className="btn btn-sm" onClick={onOpenSettings} title="Pterodactyl & Auto-Teleport settings">
          <SettingsIcon size={14} />
          Settings
        </button>
      </div>
    </header>
  );
}
