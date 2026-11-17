import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { StatusDot, Badge, Button } from './ui/Shared';
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
    toggleTheme 
  } = useControlCenter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const titles = {
    overview: 'Server Overview & Monitoring',
    bots: 'Bot Manager',
    farms: 'Farm Loaders',
    console: 'Server Console',
    activity: 'Audit & Activity',
    settings: 'Settings',
    security: 'Security & Auth',
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshServer();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex h-[76px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Collapse / Mobile toggle & Titles */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Collapse sidebar"
            className="hidden size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground md:flex cursor-pointer transition-colors"
          >
            <ChevronLeft className={`size-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation menu"
            className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground md:hidden cursor-pointer"
          >
            <Menu className="size-4" />
          </button>

          {/* Page Title & Breadcrumb */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {titles[activeTab] || 'Server Overview & Monitoring'}
            </h2>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              CherryVale SMP <span className="mx-1">/</span> Production
            </p>
          </div>
        </div>

        {/* Right: Badges, Controls, Fast Action */}
        <div className="flex items-center gap-2">
          {/* Desktop Status Badges */}
          <div className="hidden items-center gap-2 lg:flex">
            <Badge tone={serverMetrics?.online ? 'success' : 'danger'}>
              <StatusDot tone={serverMetrics?.online ? 'success' : 'danger'} />
              <span>{serverMetrics?.online ? 'BDS ONLINE' : 'BDS OFFLINE'}</span>
            </Badge>

            <Badge tone={wsConnected ? 'neutral' : 'warning'}>
              <Wifi className="size-3" />
              <span>{wsConnected ? 'WS Live' : 'Reconnecting'}</span>
            </Badge>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
            className="size-9 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Light / Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="size-9 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {/* Primary Action: Teleport all bots */}
          <Button
            onClick={teleportAllBotsToFarms}
            size="sm"
            className="h-9 gap-2 px-3 text-xs shadow-sm"
          >
            <Zap className="size-3.5 fill-current" />
            <span className="hidden sm:inline">Teleport all bots</span>
            <span className="sm:hidden">Teleport all</span>
          </Button>
        </div>
      </div>

      {/* Mobile Sub-strip */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-4 py-2 lg:hidden sm:px-6">
        <Badge tone={serverMetrics?.online ? 'success' : 'danger'}>
          <StatusDot tone={serverMetrics?.online ? 'success' : 'danger'} />
          <span>{serverMetrics?.online ? 'BDS ONLINE' : 'BDS OFFLINE'}</span>
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">ayx.acido.dev:19132</span>
        <Badge tone={wsConnected ? 'neutral' : 'warning'} className="ml-auto">
          <Wifi className="size-3" />
          <span>{wsConnected ? 'WS Live' : 'Reconnecting'}</span>
        </Badge>
      </div>
    </header>
  );
}
