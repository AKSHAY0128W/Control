import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Button } from './ui/Shared';
import { Server, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export function LoginView() {
  const { login, register, serverMetrics, settings } = useControlCenter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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
    } catch (err) {
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
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Server className="size-5" />
          </span>
          <div>
            <p className="text-lg font-bold text-foreground">{panelName}</p>
            <p className="text-xs text-muted-foreground">Bedrock Server &amp; AFK Bot Control</p>
          </div>
        </div>

        {/* Auth Card */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          {/* Mode Switcher */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="size-3.5" />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex items-center justify-center gap-1.5 rounded py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="size-3.5" />
              <span>Create account</span>
            </button>
          </div>

          <div className="mb-5">
            <h1 className="text-xl font-semibold text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create your panel account'}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to manage your Bedrock server and bots.'
                : 'Register to connect your own Bedrock server IP, port & world.'}
            </p>
          </div>

          {/* Server Target Pill */}
          <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <span className="text-[11px] text-muted-foreground">Server target</span>
            <span className="font-mono text-xs text-foreground">{targetAddress}</span>
          </div>

          {/* 1-Click Default Demo Credentials (Sign In mode only) */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={handleFillDefaults}
              className="mb-4 flex w-full items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10 cursor-pointer"
            >
              <span className="text-[11px] font-medium text-primary">Use default admin</span>
              <span className="font-mono text-[10px] text-muted-foreground">admin / •••••••••••</span>
            </button>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
                <span>Display name (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </label>
            )}

            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span>Username</span>
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>

            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span>Password</span>
              <span className="relative block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Password'}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pr-10 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-0.5 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>

            {error && (
              <p role="alert" className="text-xs text-danger font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 mt-2"
            >
              <span>
                {loading
                  ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                  : (mode === 'login' ? 'Sign in' : 'Create account & continue')}
              </span>
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-5 border-t border-border pt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
            Session protected with HMAC SHA-256 JWT authorization.
          </p>
        </section>
      </div>
    </main>
  );
}
