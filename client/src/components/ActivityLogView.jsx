import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Activity, Clock, ShieldCheck, Filter } from 'lucide-react';

export function ActivityLogView() {
  const { activityLogs } = useControlCenter();
  const [filter, setFilter] = useState('all');

  const filteredLogs = activityLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'teleport') return log.event?.includes('TP') || log.event?.includes('TELEPORT');
    if (filter === 'server') return log.event?.includes('SERVER');
    if (filter === 'bot') return log.event?.includes('BOT');
    return true;
  });

  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <div className="section-header">
        <div>
          <div className="section-title">
            <Activity size={22} color="var(--primary)" />
            <span>Live Activity &amp; Auto-Teleport Audit Feed</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time audit log of server restarts, bot spawn checks, and auto-teleport executions.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'teleport', 'server', 'bot'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
              style={{ padding: '4px 12px', fontSize: '0.76rem', textTransform: 'capitalize' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Time</th>
              <th style={{ width: '190px' }}>Event</th>
              <th>Description</th>
              <th style={{ width: '130px' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  No activity events recorded yet.
                </td>
              </tr>
            ) : (
              filteredLogs.slice(0, 30).map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {formatTime(log.timestamp)}
                  </td>
                  <td>
                    <span 
                      className={`status-pill ${
                        log.severity === 'error' ? 'offline' : log.severity === 'warning' ? 'misplaced' : 'online'
                      }`}
                      style={{ fontSize: '0.72rem', padding: '2px 8px', fontFamily: 'var(--font-mono)' }}
                    >
                      {log.event}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-main)', fontSize: '0.84rem' }}>
                    {log.description}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {log.source || 'System'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
