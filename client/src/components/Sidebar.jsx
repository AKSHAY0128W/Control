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

  const operationsNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'bots',
      label: 'Bot Manager',
      icon: Bot,
      badge: totalBotsCount > 0 ? (activeBotsCount > 0 ? `${activeBotsCount} online` : `${totalBotsCount}`) : null,
      isOnline: activeBotsCount > 0
    },
    { id: 'farms', label: 'Farm Loaders', icon: Layers },
    { id: 'console', label: 'Server Console', icon: Terminal },
  ];

  const systemNav = [
    { id: 'activity', label: 'Audit & Activity', icon: FileClock },
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const panelUrl = settings?.pterodactyl?.panelUrl || 'https://panel.acido.dev';
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD';

  return (
    <>
      {isMobileOpen && (
        <div
          className="cc-sidebar-backdrop cc-hide-desktop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cc-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobileOpen ? 'is-mobile-open' : ''}`}
        aria-label="Primary navigation"
      >
        {/* Brand Header */}
        <div className="cc-sidebar-brand">
          <div className="cc-brand-icon">
            <Server size={18} />
          </div>
          {!isCollapsed && (
            <div className="cc-brand-text">
              <p className="cc-brand-title cc-truncate">{panelName}</p>
              <p className="cc-brand-sub cc-truncate">
                <span className="cc-mono">{bdsVersion}</span>
              </p>
            </div>
          )}
          {isMobileOpen && (
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
              className="cc-btn cc-btn-ghost cc-btn-icon cc-hide-desktop"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="cc-sidebar-nav-area">
          {!isCollapsed && <p className="cc-nav-group-label">Operations</p>}
          <nav className="cc-nav-list" style={{ marginBottom: 20 }}>
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`cc-nav-item ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!isCollapsed && (
                    <>
                      <span className="cc-truncate" style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span className={`cc-nav-badge ${item.isOnline ? 'is-online' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {!isCollapsed && <p className="cc-nav-group-label">System</p>}
          <nav className="cc-nav-list" style={{ marginBottom: 20 }}>
            {systemNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`cc-nav-item ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span className="cc-truncate" style={{ flex: 1 }}>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {!isCollapsed && <p className="cc-nav-group-label">Infrastructure</p>}
          <nav className="cc-nav-list">
            <a
              href={panelUrl}
              target="_blank"
              rel="noreferrer"
              title={isCollapsed ? 'Game Panel' : undefined}
              className="cc-nav-item"
            >
              <ExternalLink size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span className="cc-truncate" style={{ flex: 1 }}>Game Panel</span>}
            </a>
          </nav>
        </div>

        {/* Footer / User Card */}
        <div className="cc-sidebar-footer">
          <div className="cc-user-card">
            <div className="cc-avatar">{initials}</div>
            {!isCollapsed && (
              <>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="cc-truncate" style={{ fontSize: 12, fontWeight: 600 }}>
                    {user?.name || user?.username || 'Administrator'}
                  </p>
                  <p className="cc-truncate" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {user?.role || 'Admin'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  aria-label="Sign out"
                  className="cc-btn cc-btn-ghost cc-btn-icon"
                  style={{ width: 30, height: 30 }}
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
