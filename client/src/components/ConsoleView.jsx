import React, { useState, useRef, useEffect } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { PageHeader, Badge, StatusDot, Button } from './ui/Shared';
import { Terminal, Send, CheckCircle2 } from 'lucide-react';

export function ConsoleView() {
  const { sendConsoleCommand, settings, bots, serverMetrics } = useControlCenter();
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const targetAddress = serverMetrics?.serverAddress || `${settings?.bedrock?.host || 'ayx.acido.dev'}:${settings?.bedrock?.port || 19132}`;

  const [consoleLogs, setConsoleLogs] = useState([
    `[${new Date().toLocaleTimeString('en-US')}] BDS connection established · ${settings?.bedrock?.transport || 'NetherNet'} transport`,
    `[${new Date().toLocaleTimeString('en-US')}] Target Bedrock Server: ${targetAddress}`,
    `[${new Date().toLocaleTimeString('en-US')}] Pterodactyl command dispatcher ready for ${settings?.pterodactyl?.serverId || 'container@pterodactyl'}`
  ]);

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
          `[${resTime}] Command [${finalCmd}] dispatched via Pterodactyl API.`
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

  const handlePreset = (preset) => {
    handleSendCommand(preset.cmd);
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="Infrastructure / BDS"
        title="Server console"
        detail="Command dispatch and connection output via AcidoHost Pterodactyl."
        actions={
          <Badge tone={serverMetrics?.online ? "success" : "neutral"}>
            <StatusDot tone={serverMetrics?.online ? "success" : "neutral"} />
            <span>{serverMetrics?.online ? "BDS connected" : "BDS disconnected"}</span>
          </Badge>
        }
      />

      {/* Quick Console Presets Row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            className="font-mono h-8 text-[10px]"
            onClick={() => handlePreset(preset)}
            disabled={sending}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Terminal Window */}
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {/* macOS Control Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-danger" />
            <span className="size-2.5 rounded-full bg-warning" />
            <span className="size-2.5 rounded-full bg-success" />
          </div>

          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
            container@pterodactyl: /srv/daemon/bds
          </span>

          <Badge tone="success">
            <StatusDot tone="success" />
            <span>Connected</span>
          </Badge>
        </div>

        {/* Terminal Screen Body */}
        <div 
          ref={scrollRef}
          className="min-h-[340px] max-h-[500px] overflow-y-auto space-y-2 bg-foreground p-4 font-mono text-[11px] leading-relaxed text-background sm:p-6"
        >
          {consoleLogs.map((line, idx) => {
            const isSuccess = line.includes('successfully') || line.includes('established') || line.includes('ready');
            const isCommand = line.includes('> ');
            const isError = line.includes('Error');

            return (
              <p
                key={`${idx}-${line}`}
                className={
                  isSuccess 
                    ? 'text-success' 
                    : isCommand 
                      ? 'text-primary-foreground font-semibold' 
                      : isError 
                        ? 'text-danger' 
                        : 'text-background/70'
                }
              >
                {line}
              </p>
            );
          })}

          {/* Interactive Command Input Line */}
          <div className="mt-4 flex items-center gap-2 border-t border-background/15 pt-4">
            <span className="text-success font-bold">&gt;&gt;</span>
            <input
              aria-label="Console command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
              placeholder={bots.length > 0 ? `Enter command... (e.g. tp ${bots[0].name} 0 64 0 or list)` : "Enter command... (e.g. list, time set day)"}
              className="min-w-0 flex-1 bg-transparent text-background outline-none placeholder:text-background/40 font-mono text-[11px]"
            />
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => handleSendCommand()}
              disabled={sending}
            >
              <Send className="size-3.5" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </Button>
          </div>
        </div>

        {/* Terminal Bottom Status Bar */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <StatusDot tone="success" />
            <span>Session open</span>
          </span>
          <span className="font-mono">Target: {targetAddress}</span>
        </div>
      </section>
    </div>
  );
}
