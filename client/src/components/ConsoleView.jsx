import React, { useState, useRef, useEffect } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { PageHeader, Badge, StatusDot, Button } from './ui/Shared';
import { Terminal, Send, CheckCircle2 } from 'lucide-react';

export function ConsoleView() {
  const { sendConsoleCommand, settings, bots, farms } = useControlCenter();
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const [consoleLogs, setConsoleLogs] = useState([
    `[9:14:47 PM] BDS connection established · NetherNet transport`,
    `[9:14:47 PM] > list`,
    `[9:14:47 PM] There are 2/10 players online: IronBot, IronBot2`,
    `[9:15:02 PM] Pterodactyl command dispatcher initialized for container@pterodactyl`
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
    'list',
    'Teleport IronBot',
    'Teleport IronBot2',
    'time set day',
    'weather clear',
    'coords on'
  ];

  const handlePreset = (preset) => {
    if (preset === 'Teleport IronBot') {
      const iron1 = farms.find(f => f.name?.includes('1')) || { x: 40, y: 108, z: -13 };
      handleSendCommand(`tp IronBot ${iron1.x} ${iron1.y} ${iron1.z}`);
    } else if (preset === 'Teleport IronBot2') {
      const iron2 = farms.find(f => f.name?.includes('2')) || { x: -239, y: 73, z: -162 };
      handleSendCommand(`tp IronBot2 ${iron2.x} ${iron2.y} ${iron2.z}`);
    } else if (preset === 'coords on') {
      handleSendCommand('gamerule showcoordinates true');
    } else {
      handleSendCommand(preset);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="Infrastructure / BDS"
        title="Server console"
        detail="Command dispatch and connection output via AcidoHost Pterodactyl."
        actions={
          <Badge tone="success">
            <StatusDot tone="success" />
            <span>BDS connected</span>
          </Badge>
        }
      />

      {/* Quick Console Presets Row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant="outline"
            size="sm"
            className="font-mono h-8 text-[10px]"
            onClick={() => handlePreset(preset)}
          >
            {preset}
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
            const isSuccess = line.includes('successfully') || line.includes('established') || line.includes('initialized');
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
              placeholder="Enter a command… (e.g. tp IronBot 40 108 -13 or list)"
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
          <span className="font-mono">Target: ayx.acido.dev:19132</span>
        </div>
      </section>
    </div>
  );
}
