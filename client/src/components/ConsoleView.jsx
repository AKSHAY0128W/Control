import React, { useState, useRef, useEffect } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { PageHeader, StatusBadge, StatusDot, Button } from './ui/Shared';
import { Send } from 'lucide-react';

export function ConsoleView() {
  const { sendConsoleCommand, settings, bots, serverMetrics } = useControlCenter();
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const [initDone, setInitDone] = useState(false);

  const targetAddress = serverMetrics?.serverAddress || (settings?.bedrock?.host ? `${settings.bedrock.host}:${settings.bedrock.port || 19132}` : 'Not configured');

  const [consoleLogs, setConsoleLogs] = useState([
    `[${new Date().toLocaleTimeString('en-US')}] BDS connection established · NetherNet transport`,
    `[${new Date().toLocaleTimeString('en-US')}] Pterodactyl command dispatcher ready`,
  ]);

  useEffect(() => {
    if (initDone || !settings?.bedrock?.host) return;
    setInitDone(true);
    const time = new Date().toLocaleTimeString('en-US');
    const transport = settings?.bedrock?.transport || 'NetherNet';
    const addr = serverMetrics?.serverAddress || `${settings.bedrock.host}:${settings.bedrock.port || 19132}`;
    const ptero = settings?.pterodactyl?.serverId || 'container@pterodactyl';
    setConsoleLogs([
      `[${time}] BDS connection established · ${transport} transport`,
      `[${time}] Target Bedrock Server: ${addr}`,
      `[${time}] Pterodactyl command dispatcher ready for ${ptero}`,
    ]);
  }, [settings, serverMetrics, initDone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const handleSendCommand = async (cmdToSend) => {
    const finalCmd = (cmdToSend || command).trim();
    if (!finalCmd) return;

    setSending(true);
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    setConsoleLogs(prev => [...prev, `[${time}] > ${finalCmd}`]);
    setCommand('');

    try {
      const res = await sendConsoleCommand(finalCmd);
      const resTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      if (res?.success) {
        setConsoleLogs(prev => [
          ...prev,
          `[${resTime}] Command [${finalCmd}] dispatched successfully to Bedrock Dedicated Server.`
        ]);
      } else {
        setConsoleLogs(prev => [
          ...prev,
          `[${resTime}] Command [${finalCmd}] failed: ${res?.error || 'Check Pterodactyl API settings.'}`
        ]);
      }
    } catch (err) {
      const errTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      setConsoleLogs(prev => [...prev, `[${errTime}] Error: ${err.message}`]);
    } finally {
      setSending(false);
    }
  };

  const presets = [
    { label: 'list', cmd: 'list' },
    ...bots.map(b => ({
      label: `TP ${b.name}`,
      cmd: `tp ${b.name} ${b.targetCoordinates?.x ?? 0} ${b.targetCoordinates?.y ?? 64} ${b.targetCoordinates?.z ?? 0}`
    })),
    { label: 'time day', cmd: 'time set day' },
    { label: 'weather clear', cmd: 'weather clear' },
    { label: 'coords on', cmd: 'gamerule showcoordinates true' }
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Infrastructure / BDS"
        title="Server console"
        detail="Command dispatch and connection output via Pterodactyl API."
        actions={
          <StatusBadge tone={serverMetrics?.online ? 'success' : 'neutral'}>
            <StatusDot tone={serverMetrics?.online ? 'success' : 'neutral'} />
            <span>{serverMetrics?.online ? 'BDS connected' : 'BDS disconnected'}</span>
          </StatusBadge>
        }
      />

      {/* Quick Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className="cc-mono"
            onClick={() => handleSendCommand(preset.cmd)}
            disabled={sending}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Always-Dark Terminal Window */}
      <section className="cc-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--warning)' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
          </div>

          <span className="cc-mono cc-truncate" style={{ flex: 1, minWidth: 0, fontSize: 12, color: 'var(--text-muted)' }}>
            container@pterodactyl: /srv/daemon/bds
          </span>

          <StatusBadge tone="success">
            <StatusDot tone="success" />
            <span>Connected</span>
          </StatusBadge>
        </div>

        <div ref={scrollRef} className="cc-terminal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {consoleLogs.map((line, idx) => {
              const isSuccess = line.includes('successfully') || line.includes('established') || line.includes('ready');
              const isCommand = line.includes('> ');
              const isError = line.includes('Error') || line.includes('failed');

              const color = isSuccess
                ? '#4ade80'
                : isCommand
                  ? '#93c5fd'
                  : isError
                    ? '#f87171'
                    : '#cbd5e1';

              return (
                <p key={`${idx}-${line}`} style={{ color, wordBreak: 'break-word' }}>
                  {line}
                </p>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <span style={{ color: '#4ade80', fontWeight: 700 }}>&gt;&gt;</span>
            <input
              aria-label="Console command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
              placeholder={bots.length > 0 ? `Enter command... (e.g. tp ${bots[0].name} 0 64 0 or list)` : 'Enter command... (e.g. list, time set day)'}
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontFamily: 'inherit',
                fontSize: 12
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendCommand()}
              disabled={sending}
              style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            >
              <Send size={13} />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </Button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 11,
            color: 'var(--text-muted)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot tone="success" />
            <span>Session open</span>
          </span>
          <span className="cc-mono">Target: {targetAddress}</span>
        </div>
      </section>
    </div>
  );
}
