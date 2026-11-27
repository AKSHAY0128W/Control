import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { StatusDot, StatusBadge, Button } from './ui/Shared';
import {
  ChevronLeft,
  Menu,
  Wifi,
  RefreshCw,
  Moon,
  Sun,
  Zap
} from 'lucide-react';

export function TopHeader({ isCollapsed, setIsCollapsed, setIsMobileOpen }) {
  const {
    activeTab,
    serverMetrics,
    wsConnected,
    teleportAllBotsToFarms,
    refreshServer,
    theme,
    toggleTheme,
    settings
  } = useControlCenter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const titles = {
    overview: 'Server Overview',
    bots: 'Bot Manager',
    farms: 'Farm Loaders',
    console: 'Server Console',
    activity: 'Audit & Activity',
    settings: 'Settings',
    security: 'Security & Auth',
  };

  const worldName = settings?.bedrock?.worldName || serverMetrics?.worldName || 'Bedrock Server';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshServer();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <header className="cc-header">
      <div className="cc-header-inner">
        {/* Left: Sidebar Toggle & Breadcrumb */}
        <div className="cc-header-left">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
            className="cc-btn cc-btn-outline cc-btn-icon cc-hide-mobile"
          >
            <ChevronLeft
              size={16}
              style={{
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease'
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
            className="cc-btn cc-btn-outline cc-btn-icon cc-hide-desktop"
          >
            <Menu size={16} />
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 className="cc-header-title cc-truncate">
              {titles[activeTab] || 'Server Overview'}
            </h2>
            <p className="cc-header-crumb cc-truncate cc-hide-mobile">
              {worldName} / Production
            </p>
          </div>
        </div>

        {/* Right: Status Badges & Quick Actions */}
        <div className="cc-header-actions">
          <StatusBadge tone={serverMetrics?.online ? 'success' : 'danger'}>
            <StatusDot tone={serverMetrics?.online ? 'success' : 'danger'} />
            <span className="cc-hide-mobile">{serverMetrics?.online ? 'BDS ONLINE' : 'BDS OFFLINE'}</span>
            <span className="cc-hide-desktop">{serverMetrics?.online ? 'ON' : 'OFF'}</span>
          </StatusBadge>

          <StatusBadge tone={wsConnected ? 'neutral' : 'warning'} className="cc-hide-mobile">
            <Wifi size={12} />
            <span>{wsConnected ? 'WS Live' : 'Reconnecting'}</span>
          </StatusBadge>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <RefreshCw
              size={16}
              style={isRefreshing ? { animation: 'spin 1s linear infinite' } : undefined}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <Button
            onClick={teleportAllBotsToFarms}
            size="sm"
          >
            <Zap size={14} />
            <span className="cc-hide-mobile">Teleport all bots</span>
            <span className="cc-hide-desktop">Teleport</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
