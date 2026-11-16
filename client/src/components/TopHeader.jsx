import React from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  Zap, 
  RotateCw, 
  Sun, 
  Moon, 
  Radio, 
  Server
} from 'lucide-react';

export function TopHeader({ onOpenConsole }) {
  const { 
    activeTab, 
    serverMetrics, 
    wsConnected, 
    teleportAllBotsToFarms, 
    refreshServer,
    theme,
    toggleTheme 
  } = useControlCenter();

  const titles = {
    overview: 'Server Overview & Monitoring',
    bots: 'Bot Position Manager & Auto-Teleport',
    farms: 'Farm Management & Chunk Loaders',
    console: 'AcidoHost Bedrock BDS Console',
    activity: 'Audit Logs & Auto-Teleport History',
    settings: 'Control Center & Pterodactyl Settings',
    security: 'Security, Sessions & Password',
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <h2 className="page-title">{titles[activeTab] || 'OUR SMP Control Center'}</h2>
      </div>

      <div className="header-right">
        {/* BDS Live Status */}
        <div 
          className={`status-pill ${serverMetrics?.online ? 'online' : 'offline'}`}
          title="Direct NetherNet status check from ayx.acido.dev:19132"
        >
          <span className={`pulse-dot ${serverMetrics?.online ? 'online' : 'offline'}`} />
          <span>{serverMetrics?.online ? 'BDS ONLINE' : 'BDS OFFLINE'}</span>
        </div>

        {/* WebSocket Real-time Feed */}
        <div 
          className={`status-pill ${wsConnected ? 'online' : 'offline'}`}
          title="WebSocket live event feed connection"
        >
          <Radio size={12} />
          <span>{wsConnected ? 'WS Live' : 'Reconnecting'}</span>
        </div>

        {/* Global Fast Action: Teleport All Bots to Farms */}
        <button
          className="btn btn-teleport btn-sm"
          onClick={teleportAllBotsToFarms}
          title="Instantly dispatch console tp commands to send all bots back to their assigned farm coordinates"
        >
          <Zap size={14} />
          <span>Teleport All Bots</span>
        </button>

        {/* Refresh Server Polling */}
        <button
          className="btn btn-sm"
          onClick={refreshServer}
          title="Query NetherNet handshake endpoint"
          style={{ padding: '8px' }}
        >
          <RotateCw size={14} />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          className="btn btn-sm"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ padding: '8px' }}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </header>
  );
}
