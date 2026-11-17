import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { PageHeader, Badge, Button } from './ui/Shared';
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `our-smp-activity-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (setLastNotification) {
      setLastNotification({ type: 'success', text: 'Activity log exported successfully.' });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="Observability / Events"
        title="Audit & activity"
        detail="A chronological record of server, bot, and teleport events."
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="size-3.5" />
            <span>Export log</span>
          </Button>
        }
      />

      {/* Filter Buttons & Total Count */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['All', 'Teleport', 'Server', 'Bot'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredLogs.length} events
        </span>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No matching activity yet.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const eventKind = log.type || (
                  log.event?.includes('TP') || log.event?.includes('TELEPORT') 
                    ? 'Teleport' 
                    : log.event?.includes('BOT') 
                      ? 'Bot' 
                      : 'Server'
                );
                const badgeTone = eventKind === 'Teleport' ? 'primary' : eventKind === 'Bot' ? 'warning' : 'neutral';
                const timeFormatted = log.timestamp 
                  ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                  : log.time || 'Just now';

                return (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                      {timeFormatted}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={badgeTone}>
                        {log.event || log.action || 'EVENT'}
                      </Badge>
                    </td>
                    <td className="max-w-[440px] px-4 py-3 text-foreground">
                      {log.details || log.description || log.message}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                      {log.source || 'ControlCenter'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
