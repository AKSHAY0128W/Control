import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { ShieldCheck, Lock, KeyRound, AlertCircle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

export function SecurityView() {
  const { user, changePassword, activityLogs } = useControlCenter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        setMessage({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res?.error || 'Failed to update password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Request failed. Please verify connection.' });
    } finally {
      setLoading(false);
    }
  };

  // Filter security logs
  const securityLogs = activityLogs.filter(
    (log) => log.source === 'Security' || log.event?.startsWith('AUTH_') || log.event?.includes('PASSWORD')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
      {/* Security Overview Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Security &amp; Authentication Control</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage administrative credentials, JWT session security, and access audit records.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-pill online">
            <span className="pulse-dot online" />
            JWT Session Active
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Active Session Info */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <UserCheck size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Current Session</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Signed In User</span>
              <strong style={{ color: 'var(--text-main)' }}>{user?.name || user?.username || 'admin'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Access Role</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary-text)', fontSize: '0.78rem' }}>
                {user?.role || 'SUPERADMIN'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Token Security</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-main)' }}>
                HMAC SHA-256 JWT
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Session Expiry</span>
              <span style={{ color: 'var(--text-main)', fontSize: '0.8rem' }}>7 Days Rolling</span>
            </div>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <KeyRound size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Change Password</h4>
          </div>

          {message && (
            <div className={`alert-toast ${message.type === 'success' ? 'success' : 'danger'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Current admin password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '8px', justifyContent: 'center' }}
            >
              <Lock size={15} />
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Security Audit Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <ShieldAlert size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Authentication &amp; Security Audit History</h4>
        </div>

        {securityLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent security alerts recorded.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Description</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span 
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: log.event === 'AUTH_FAILED' ? 'var(--danger-text)' : 'var(--primary-text)'
                        }}
                      >
                        {log.event}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{log.description}</td>
                    <td>
                      <span 
                        className={`status-pill ${
                          log.severity === 'warning' ? 'misplaced' : log.severity === 'info' ? 'online' : 'online'
                        }`}
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                      >
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
