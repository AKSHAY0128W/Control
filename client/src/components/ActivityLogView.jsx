import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { PageHeader, StatusBadge, ResponsiveTable, Button } from './ui/Shared';
import { Download } from 'lucide-react';

export function ActivityLogView() {
  const { activityLogs, setLastNotification } = useControlCenter();
  const [filter, setFilter] = useState('All');

  const filteredLogs = activityLogs.filter(log => {
    if (filter === 'All') return true;
    const eventKind = log.type || (
      log.event?.includes('TP') || log.event?.includes('TELEPORT')
        ? 'Teleport'
        : log.event?.includes('BOT')
          ? 'Bot'
          : 'Server'
    );
    return eventKind.toLowerCase() === filter.toLowerCase();
  });

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `control-center-activity-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (setLastNotification) {
      setLastNotification({ type: 'success', text: 'Activity log exported successfully.' });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Observability / Events"
        title="Audit & activity"
        detail="A chronological record of server, bot, and teleport events."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} />
            <span>Export log</span>
          </Button>
        }
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {['All', 'Teleport', 'Server', 'Bot'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          {filteredLogs.length} events
        </span>
      </div>

      <ResponsiveTable columns={['Time', 'Event', 'Description', 'Source']}>
        {filteredLogs.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              No matching events recorded.
            </td>
          </tr>
        ) : (
          filteredLogs.map((log) => {
            const eventKind = log.type || (log.event?.includes('TP') ? 'Teleport' : log.event?.includes('BOT') ? 'Bot' : 'Server');
            const badgeTone = eventKind === 'Teleport' ? 'primary' : eventKind === 'Bot' ? 'warning' : 'neutral';
            const timeFormatted = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
              : log.time || 'Just now';

            return (
              <tr key={log.id}>
                <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                  {timeFormatted}
                </td>
                <td>
                  <StatusBadge tone={badgeTone}>
                    {log.event || log.action || 'EVENT'}
                  </StatusBadge>
                </td>
                <td style={{ maxWidth: 460 }}>
                  {log.details || log.description || log.message}
                </td>
                <td className="cc-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                  {log.source || 'ControlCenter'}
                </td>
              </tr>
            );
          })
        )}
      </ResponsiveTable>
    </div>
  );
}
