import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { 
  PageHeader, 
  SectionCard, 
  InputField, 
  Badge, 
  StatusDot, 
  Button 
} from './ui/Shared';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Lock, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

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
      {/* Page Header */}
      <PageHeader
        eyebrow="Access / Account"
        title="Security & authentication"
        detail="Operator session details and account credentials."
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          {/* Active Session Card */}
          <SectionCard
            icon={UserCheck}
            title="Active session"
            description="Current operator authentication state"
          >
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-muted-foreground">Signed in as</span>
                <span className="font-semibold text-foreground">
                  {user?.name || user?.username || 'Server Administrator'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-muted-foreground">Access role</span>
                <span className="font-bold text-primary">{user?.role || 'SUPERADMIN'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-muted-foreground">Token security</span>
                <span className="font-mono text-[11px] text-foreground">HMAC SHA-256 JWT</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-muted-foreground">Session status</span>
                <Badge tone="success">
                  <StatusDot tone="success" />
                  <span>Verified session</span>
                </Badge>
              </div>
            </div>
          </SectionCard>

          {/* Change Password Card */}
          <SectionCard
            icon={KeyRound}
            title="Change password"
            description="Update the master operator password"
          >
            <form onSubmit={handleChangePassword} className="space-y-4">
              <InputField
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type="password"
                placeholder="Current master password"
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
                <p role="alert" className="text-xs text-danger font-medium">
                  {errorMsg}
                </p>
              )}

              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          </SectionCard>
        </div>

        {/* Column 2: Security Audit Log */}
        <div>
          <SectionCard
            icon={ShieldCheck}
            title="Security audit"
            description="Recent sign-in, token, and account security events"
          >
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5">Time</th>
                    <th className="px-3 py-2.5">Event</th>
                    <th className="px-3 py-2.5">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    securityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20">
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted-foreground">
                          {log.timestamp 
                            ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                            : log.time || 'Just now'}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge tone="neutral">
                            {log.event || 'SECURITY_EVENT'}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted-foreground">
                          {log.source || 'AuthService'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
