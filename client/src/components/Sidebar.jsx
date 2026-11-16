import React from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  LayoutDashboard, 
  Bot, 
  Layers, 
  Terminal, 
  ScrollText, 
  Sliders, 
  ShieldCheck, 
  LogOut, 
  Server,
  Zap,
  ExternalLink
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, user, logout, serverMetrics } = useControlCenter();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bots', label: 'Bot Manager', icon: Bot, badge: serverMetrics?.playerCount ? `${serverMetrics.playerCount} In-Game` : null },
    { id: 'farms', label: 'Farm Loaders', icon: Layers },
    { id: 'console', label: 'Server Console', icon: Terminal },
    { id: 'activity', label: 'Audit & Activity', icon: ScrollText },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Server size={20} />
        </div>
        <div>
          <div className="sidebar-brand-title">OUR SMP</div>
          <div className="sidebar-brand-subtitle">Control Center</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '8px 12px 4px', letterSpacing: '0.05em' }}>
          Management
        </div>

        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span 
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--primary)' : 'var(--bg-card-subtle)',
                    color: isActive ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '16px 12px 4px', letterSpacing: '0.05em' }}>
          Hosting Provider
        </div>

        <a 
          href="https://acido.dev" 
          target="_blank" 
          rel="noreferrer" 
          className="nav-item"
          style={{ textDecoration: 'none' }}
        >
          <ExternalLink size={17} />
          <span>AcidoHost Panel</span>
        </a>
      </nav>

      {/* User & Session Footer */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || user?.username || 'Administrator'}</span>
            <span className="user-role-badge">{user?.role || 'Superadmin'}</span>
          </div>
        </div>

        <button 
          onClick={logout}
          className="btn btn-sm"
          style={{ padding: '6px', background: 'transparent', borderColor: 'transparent', color: 'var(--text-muted)' }}
          title="Sign out of control center"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
