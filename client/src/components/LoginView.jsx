import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Server } from 'lucide-react';

export function LoginView() {
  const { login } = useControlCenter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('smpadmin2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (!res?.success) {
        setError(res?.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('Connection to control center API failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('smpadmin2026');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Header with SMP Branding */}
        <div className="login-header">
          <div className="login-icon-box">
            <Server size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            OUR SMP Control Center
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Bedrock Dedicated Server &amp; AFK Bot Management
          </p>
        </div>

        {/* Server Target Badge */}
        <div 
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem'
          }}
        >
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot online" />
            BDS Target:
          </span>
          <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
            ayx.acido.dev:19132
          </strong>
        </div>

        {/* Error notification */}
        {error && (
          <div className="alert-toast danger" style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Administrator Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-subtle)' }} 
              />
              <input
                id="login-username"
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-subtle)' }} 
              />
              <input
                id="login-password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper & Security Note */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Default credentials:</span>
            <button 
              type="button" 
              onClick={handleQuickDemo}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}
            >
              Fill admin / smpadmin2026
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)', fontSize: '0.72rem', justifyContent: 'center' }}>
            <ShieldCheck size={13} color="var(--success)" />
            <span>Secured with JWT &amp; Role-Based Authorization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
