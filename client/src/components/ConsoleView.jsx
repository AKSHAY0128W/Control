import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Terminal, Send, CheckCircle2, AlertTriangle, Shield, CornerDownLeft, Play } from 'lucide-react';

export function ConsoleView() {
  const { sendConsoleCommand, settings, bots } = useControlCenter();
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([
    {
      time: new Date().toLocaleTimeString(),
      type: 'system',
      text: 'Connected to BDS Command Pipeline (Dispatches commands directly to server console)'
    },
    {
      time: new Date().toLocaleTimeString(),
      type: 'info',
      text: settings?.pterodactyl?.isConfigured 
        ? `Pterodactyl Panel API connected to Server ID: ${settings.pterodactyl.serverId}` 
        : 'Note: Pterodactyl API key not configured yet. Set API Key in Settings to execute live BDS console commands.'
    }
  ]);

  const handleSendCommand = async (cmdToSend) => {
    const finalCmd = (cmdToSend || command).trim();
    if (!finalCmd) return;

    setSending(true);
    const timestamp = new Date().toLocaleTimeString();

    // Append command to console log
    setConsoleOutput(prev => [
      ...prev,
      { time: timestamp, type: 'command', text: `> ${finalCmd}` }
    ]);

    try {
      const res = await sendConsoleCommand(finalCmd);
      if (res?.success) {
        setConsoleOutput(prev => [
          ...prev,
          { 
            time: new Date().toLocaleTimeString(), 
            type: 'success', 
            text: res.message || `Command [${finalCmd}] dispatched successfully to Bedrock Dedicated Server.` 
          }
        ]);
      } else {
        setConsoleOutput(prev => [
          ...prev,
          { 
            time: new Date().toLocaleTimeString(), 
            type: 'error', 
            text: `Console Error: ${res?.error || 'Failed to dispatch command'}` 
          }
        ]);
      }
    } catch (err) {
      setConsoleOutput(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), type: 'error', text: `Network error: ${err.message}` }
      ]);
    } finally {
      setSending(false);
      setCommand('');
    }
  };

  const quickCommands = [
    { label: 'list', cmd: 'list', desc: 'List players currently in the world' },
    { label: 'Teleport IronBot', cmd: 'tp IronBot 40 108 -13', desc: 'Send IronBot to Iron Farm 1' },
    { label: 'Teleport IronBot2', cmd: 'tp IronBot2 -239 73 -162', desc: 'Send IronBot2 to Iron Farm 2' },
    { label: 'time set day', cmd: 'time set day', desc: 'Set world time to day' },
    { label: 'weather clear', cmd: 'weather clear', desc: 'Clear rain and thunder' },
    { label: 'coords on', cmd: 'gamerule showcoordinates true', desc: 'Show coordinates on HUD' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Console Top Header Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Bedrock BDS Interactive Console</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Direct command execution channel via AcidoHost Pterodactyl API
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`status-pill ${settings?.pterodactyl?.isConfigured ? 'online' : 'offline'}`}>
            <span className={`pulse-dot ${settings?.pterodactyl?.isConfigured ? 'online' : 'amber'}`} />
            {settings?.pterodactyl?.isConfigured ? 'Pterodactyl Linked' : 'Pterodactyl Not Configured'}
          </span>
        </div>
      </div>

      {/* Quick Command Shortcuts */}
      <div className="card">
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Play size={14} color="var(--primary)" />
          Quick Console Presets:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickCommands.map((q, idx) => (
            <button
              key={idx}
              className="btn btn-sm"
              onClick={() => handleSendCommand(q.cmd)}
              disabled={sending}
              title={q.desc}
              style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
            >
              <span>{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Display */}
      <div 
        style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: 'var(--radius-lg)',
          padding: '18px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '380px',
          maxHeight: '520px'
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              container@pterodactyl: /srv/daemon/bds
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Target: ayx.acido.dev:19132
          </span>
        </div>

        {/* Terminal Output Body */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.84rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            paddingRight: '6px'
          }}
        >
          {consoleOutput.map((line, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', lineHeight: 1.4 }}>
              <span style={{ color: '#475569', fontSize: '0.75rem', minWidth: '65px' }}>[{line.time}]</span>
              <span 
                style={{
                  color: line.type === 'command' ? '#38bdf8' 
                       : line.type === 'success' ? '#4ade80' 
                       : line.type === 'error' ? '#f87171' 
                       : '#cbd5e1'
                }}
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>

        {/* Command Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendCommand(); }}
          style={{ 
            marginTop: '14px', 
            borderTop: '1px solid #1e293b', 
            paddingTop: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}
        >
          <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>&gt;&gt;</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type server command (e.g. tp IronBot 40 108 -13 or list)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              outline: 'none'
            }}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={sending || !command.trim()}
            style={{ padding: '6px 14px' }}
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
