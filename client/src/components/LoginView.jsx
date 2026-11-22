import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Button } from './ui/Shared';
import { Server, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginView() {
  const { login, serverMetrics, settings } = useControlCenter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('smpadmin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetAddress = serverMetrics?.serverAddress || (settings?.bedrock?.host ? `${settings.bedrock.host}:${settings.bedrock.port || 19132}` : 'BDS 1.26.61');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setError('Complete all credentials fields.');
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

  const handleFillDefaults = () => {
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
            <p className="text-lg font-bold text-foreground">OUR SMP</p>
            <p className="text-xs text-muted-foreground">Control Center · BDS 1.26.61</p>
          </div>
        </div>

        {/* Login Card */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your server control center.
            </p>
          </div>

          {/* Server Target Pill */}
          <div className="mb-5 flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5">
            <span className="text-[11px] text-muted-foreground">Server target</span>
            <span className="font-mono text-xs text-foreground">{targetAddress}</span>
          </div>

          {/* 1-Click Default Demo Credentials */}
          <button
            type="button"
            onClick={handleFillDefaults}
            className="mb-4 flex w-full items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition-colors hover:bg-primary/10 cursor-pointer"
          >
            <span className="text-[11px] font-medium text-primary">Default credentials</span>
            <span className="font-mono text-[10px] text-muted-foreground">admin / smp•••••••••••</span>
          </button>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-5 border-t border-border pt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
            Production session with HMAC SHA-256 JWT authorization.
          </p>
        </section>
      </div>
    </main>
  );
}
