import React from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  Server, 
  LayoutDashboard, 
  Bot, 
  Layers, 
  Terminal, 
  FileClock, 
  Settings2, 
  ShieldCheck, 
  ExternalLink, 
  LogOut,
  X
} from 'lucide-react';

export function Sidebar({ isMobileOpen, setIsMobileOpen, isCollapsed }) {
  const { activeTab, setActiveTab, user, logout, bots, settings, serverMetrics } = useControlCenter();

  const panelName = settings?.bedrock?.worldName || serverMetrics?.worldName || 'Control Center';
  const bdsVersion = serverMetrics?.version && serverMetrics.version !== 'Unknown'
    ? `BDS ${serverMetrics.version}`
    : 'Control Center';

  const activeBotsCount = Array.isArray(bots) ? bots.filter(b => b.enabled !== false && b.status === 'online').length : 0;
  const totalBotsCount = Array.isArray(bots) ? bots.length : 0;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'bots', 
      label: 'Bot Manager', 
      icon: Bot, 
      count: totalBotsCount > 0 ? (activeBotsCount > 0 ? `${activeBotsCount} online` : `${totalBotsCount} registered`) : null 
    },
    { id: 'farms', label: 'Farm Loaders', icon: Layers },
    { id: 'console', label: 'Server Console', icon: Terminal },
    { id: 'activity', label: 'Audit & Activity', icon: FileClock },
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`${isCollapsed ? 'w-[72px]' : 'w-[256px]'} ${
          isMobileOpen ? 'fixed inset-y-0 left-0 z-40 flex shadow-xl' : 'hidden md:flex'
        } sticky top-0 h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 select-none`}
      >
        {/* Brand / Logo Header */}
        <div className={`flex min-h-[68px] items-center gap-3 border-b border-border px-4 py-3 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Server className="size-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold tracking-wide text-foreground">{panelName}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Control Center <span className="font-mono">· {bdsVersion}</span>
              </p>
            </div>
          )}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Workspace Navigation */}
        <div className="flex-1 overflow-y-auto px-3 pt-5">
          <p className={`${isCollapsed ? 'sr-only' : ''} mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground`}>
            Workspace
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-[13px] transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-primary/10 font-semibold text-primary' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-[17px] shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.count && (
                        <span className="ml-auto rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Infrastructure Section */}
          <div className="mt-6 border-t border-border pt-4">
            <p className={`${isCollapsed ? 'sr-only' : ''} mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground`}>
              Infrastructure
            </p>
            <nav className="space-y-1">
              <a
                href="https://panel.acido.dev"
                target="_blank"
                rel="noreferrer"
                title={isCollapsed ? 'AcidoHost Panel' : undefined}
                className="group flex h-10 w-full items-center gap-3 rounded-md px-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-[17px] shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">AcidoHost Panel</span>
                    <span className="text-muted-foreground group-hover:text-foreground">↗</span>
                  </>
                )}
              </a>
            </nav>
          </div>
        </div>

        {/* User Profile Card & Footer */}
        <div className="mt-auto border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md bg-muted/60 p-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'SE'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || user?.username || 'Server Administrator'}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  <span className="font-semibold text-primary">SUPERADMIN</span>
                </p>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out of control center"
              aria-label="Sign out"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
