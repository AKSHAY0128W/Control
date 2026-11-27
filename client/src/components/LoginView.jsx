import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Button } from './ui/Shared';
import { Server, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export function LoginView() {
  const { login, register, serverMetrics, settings } = useControlCenter();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const panelName = settings?.bedrock?.worldName || serverMetrics?.worldName || 'Bedrock Control Center';
  const targetAddress = serverMetrics?.serverAddress || (settings?.bedrock?.host ? `${settings.bedrock.host}:${settings.bedrock.port || 19132}` : 'Multi-Server Panel');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Complete all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = mode === 'login'
        ? await login(username.trim(), password)
        : await register(username.trim(), password, name.trim());

      if (!res?.success) {
        setError(res?.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('Connection to control center API failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDefaults = () => {
    setMode('login');
    setUsername('admin');
    setPassword('smpadmin2026');
    setError('');
  };

  return (
    <main className="cc-auth-page">
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <div className="cc-brand-icon" style={{ width: 44, height: 44 }}>
            <Server size={20} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{panelName}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bedrock Server &amp; AFK Bot Control</p>
          </div>
        </div>

        {/* Auth Card */}
        <section className="cc-card" style={{ padding: 28 }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              padding: 4,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 22
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`cc-btn cc-btn-sm ${mode === 'login' ? 'cc-btn-primary' : 'cc-btn-ghost'}`}
              style={{ width: '100%' }}
            >
              <LogIn size={14} />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`cc-btn cc-btn-sm ${mode === 'register' ? 'cc-btn-primary' : 'cc-btn-ghost'}`}
              style={{ width: '100%' }}
            >
              <UserPlus size={14} />
              <span>Create account</span>
            </button>
          </div>

          <div style={{ marginBottom: 18 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>
              {mode === 'login' ? 'Welcome back' : 'Create your panel account'}
            </h1>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              {mode === 'login'
                ? 'Sign in to manage your Bedrock server and bots.'
                : 'Register to connect your own Bedrock server IP, port & world.'}
            </p>
          </div>

          {/* Server Target Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              marginBottom: 14
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Server target</span>
            <span className="cc-mono" style={{ fontSize: 12 }}>{targetAddress}</span>
          </div>

          {mode === 'login' && (
            <button
              type="button"
              onClick={handleFillDefaults}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-soft)',
                border: '1px solid var(--accent-border)',
                marginBottom: 16,
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Use default admin</span>
              <span className="cc-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin / •••••••••••</span>
            </button>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <label className="cc-field">
                <span className="cc-field-label">Display name (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="cc-input"
                />
              </label>
            )}

            <label className="cc-field">
              <span className="cc-field-label">Username</span>
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="cc-input"
              />
            </label>

            <label className="cc-field">
              <span className="cc-field-label">Password</span>
              <div className="cc-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Password'}
                  className="cc-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="cc-btn cc-btn-ghost cc-btn-icon"
                  style={{ position: 'absolute', right: 4, width: 30, height: 30 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error && (
              <p role="alert" style={{ fontSize: 12, fontWeight: 500, color: 'var(--danger)' }}>
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              <span>
                {loading
                  ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'login' ? 'Sign in' : 'Create account & continue')}
              </span>
              <ArrowRight size={15} />
            </Button>
          </form>

          <p
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-muted)'
            }}
          >
            Session protected with HMAC SHA-256 JWT authorization.
          </p>
        </section>
      </div>
    </main>
  );
}
