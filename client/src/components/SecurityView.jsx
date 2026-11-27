import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import {
  PageHeader,
  SectionCard,
  InputField,
  StatusBadge,
  StatusDot,
  ResponsiveTable,
  Button
} from './ui/Shared';
import { ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export function SecurityView() {
  const { user, changePassword, activityLogs, setLastNotification } = useControlCenter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Complete all three fields.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Use at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (setLastNotification) {
          setLastNotification({ type: 'success', text: 'Operator password updated successfully!' });
        }
      } else {
        setErrorMsg(res?.error || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const securityLogs = activityLogs.filter(
    (log) => log.source === 'Security' || log.source === 'SecurityAudit' || log.event?.includes('AUTH') || log.event?.includes('PASSWORD')
  );

  return (
    <div>
      <PageHeader
        eyebrow="Access / Account"
        title="Security & authentication"
        detail="Operator session details and account credentials."
      />

      <div className="cc-grid-2" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard
            icon={UserCheck}
            title="Active session"
            description="Current operator authentication state"
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { label: 'Signed in as', value: user?.name || user?.username || 'Administrator', bold: true },
                { label: 'Access role', value: user?.role || 'ADMIN', accent: true },
                { label: 'Token security', value: 'HMAC SHA-256 JWT', mono: true }
              ].map((row, idx) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderTop: idx > 0 ? '1px solid var(--border-subtle)' : undefined,
                    fontSize: 12
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span
                    className={row.mono ? 'cc-mono' : undefined}
                    style={{
                      fontWeight: row.bold || row.accent ? 600 : 400,
                      color: row.accent ? 'var(--accent)' : 'var(--text-primary)'
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 12
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Session status</span>
                <StatusBadge tone="success">
                  <StatusDot tone="success" />
                  <span>Verified session</span>
                </StatusBadge>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={KeyRound}
            title="Change password"
            description="Update the master operator password"
          >
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InputField
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                placeholder="Current password"
              />
              <InputField
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="At least 8 characters"
              />
              <InputField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Re-enter new password"
              />

              {errorMsg && (
                <p role="alert" style={{ fontSize: 12, fontWeight: 500, color: 'var(--danger)' }}>
                  {errorMsg}
                </p>
              )}

              <div>
                <Button type="submit" variant="outline" size="sm" disabled={loading}>
                  {loading ? 'Updating...' : 'Update password'}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <SectionCard
          icon={ShieldCheck}
          title="Security audit"
          description="Recent sign-in, token, and account security events"
        >
          <ResponsiveTable columns={['Time', 'Event', 'Source']}>
            {securityLogs.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
                  No security audit logs recorded yet.
                </td>
              </tr>
            ) : (
              securityLogs.map((log) => (
                <tr key={log.id}>
                  <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                      : log.time || 'Just now'}
                  </td>
                  <td>
                    <StatusBadge tone="neutral">{log.event || 'SECURITY_EVENT'}</StatusBadge>
                  </td>
                  <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {log.source || 'AuthService'}
                  </td>
                </tr>
              ))
            )}
          </ResponsiveTable>
        </SectionCard>
      </div>
    </div>
  );
}
