import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { X, MapPin, Zap, Terminal, Settings as SettingsIcon, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

// Modal 1: Edit Bot & Coordinates Modal
export function EditCoordinatesModal({ bot, onClose }) {
  const { updateBot } = useControlCenter();
  const [name, setName] = useState(bot?.name || '');
  const [x, setX] = useState(bot?.targetCoordinates?.x ?? 0);
  const [y, setY] = useState(bot?.targetCoordinates?.y ?? 64);
  const [z, setZ] = useState(bot?.targetCoordinates?.z ?? 0);
  const [farmName, setFarmName] = useState(bot?.assignedFarm || '');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateBot(bot.id, {
      name: name.trim(),
      username: name.trim(),
      targetCoordinates: { x: Number(x), y: Number(y), z: Number(z) },
      assignedFarm: farmName
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Edit Bot: {bot.name}</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Bot Player Name (Minecraft Username)</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. IronBot"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Farm Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={farmName} 
              onChange={e => setFarmName(e.target.value)} 
              placeholder="e.g. Iron Farm 1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Farm Coordinates (X, Y, Z)</label>
            <div className="coords-inputs-row">
              <input type="number" className="form-input" value={x} onChange={e => setX(e.target.value)} placeholder="X" required />
              <input type="number" className="form-input" value={y} onChange={e => setY(e.target.value)} placeholder="Y" required />
              <input type="number" className="form-input" value={z} onChange={e => setZ(e.target.value)} placeholder="Z" required />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              When the server restarts, this bot will automatically be teleported to these coordinates.
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Coordinates</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 2: Custom Teleport Modal
export function CustomTeleportModal({ bot, onClose }) {
  const { teleportBot, farms } = useControlCenter();
  const [x, setX] = useState(bot?.currentCoordinates?.x ?? 0);
  const [y, setY] = useState(bot?.currentCoordinates?.y ?? 64);
  const [z, setZ] = useState(bot?.currentCoordinates?.z ?? 0);
  const [isTeleporting, setIsTeleporting] = useState(false);

  const handleTeleport = async (e) => {
    e.preventDefault();
    setIsTeleporting(true);
    await teleportBot(bot.id, { x: Number(x), y: Number(y), z: Number(z) });
    setIsTeleporting(false);
    onClose();
  };

  const handleSelectFarm = (farm) => {
    setX(farm.coordinates.x);
    setY(farm.coordinates.y);
    setZ(farm.coordinates.z);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Teleport {bot.name}</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleTeleport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Quick Select Farm:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {farms.map(f => (
                <button 
                  key={f.id} 
                  type="button" 
                  className="btn btn-sm"
                  onClick={() => handleSelectFarm(f)}
                  style={{ fontSize: '0.75rem' }}
                >
                  <MapPin size={11} /> {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Coordinates (X, Y, Z)</label>
            <div className="coords-inputs-row">
              <input type="number" className="form-input" value={x} onChange={e => setX(e.target.value)} placeholder="X" required />
              <input type="number" className="form-input" value={y} onChange={e => setY(e.target.value)} placeholder="Y" required />
              <input type="number" className="form-input" value={z} onChange={e => setZ(e.target.value)} placeholder="Z" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-teleport btn-sm" disabled={isTeleporting}>
              <Zap size={14} /> {isTeleporting ? 'Sending Command...' : 'Execute Teleport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 3: Add Bot Modal
export function AddBotModal({ onClose }) {
  const { registerBot, farms } = useControlCenter();
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState(farms[0]?.name || 'Iron Farm 1');
  const [x, setX] = useState(0);
  const [y, setY] = useState(64);
  const [z, setZ] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await registerBot({
      name: name.trim(),
      username: name.trim(),
      assignedFarm: farmName,
      targetCoordinates: { x: Number(x), y: Number(y), z: Number(z) },
      autoTeleport: true
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Register New AFK Bot</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Bot Name (Minecraft Username)</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. IronBot3 or GoldBot" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Farm</label>
            <input 
              type="text" 
              className="form-input" 
              value={farmName} 
              onChange={e => setFarmName(e.target.value)} 
              placeholder="e.g. Iron Farm 3 or Gold Farm" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Coordinates (X, Y, Z)</label>
            <div className="coords-inputs-row">
              <input type="number" className="form-input" value={x} onChange={e => setX(e.target.value)} placeholder="X" required />
              <input type="number" className="form-input" value={y} onChange={e => setY(e.target.value)} placeholder="Y" required />
              <input type="number" className="form-input" value={z} onChange={e => setZ(e.target.value)} placeholder="Z" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add Bot</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 4: Settings & Pterodactyl Integration Modal
export function SettingsModal({ onClose }) {
  const { settings, updateSettings } = useControlCenter();
  const [panelUrl, setPanelUrl] = useState(settings.pterodactyl?.panelUrl || '');
  const [serverId, setServerId] = useState(settings.pterodactyl?.serverId || '');
  const [apiKey, setApiKey] = useState('');
  const [autoTpEnabled, setAutoTpEnabled] = useState(settings.autoTeleport?.enabled !== false);
  const [delaySeconds, setDelaySeconds] = useState(settings.autoTeleport?.delaySeconds || 8);
  const [distanceThreshold, setDistanceThreshold] = useState(settings.autoTeleport?.distanceThreshold || 10);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateSettings({
      pterodactyl: {
        panelUrl,
        serverId,
        apiKey: apiKey || undefined // only update if entered
      },
      autoTeleport: {
        enabled: autoTpEnabled,
        delaySeconds: Number(delaySeconds),
        distanceThreshold: Number(distanceThreshold)
      }
    });
    onClose();
  };

  const handleTestPterodactyl = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily save to test
      await updateSettings({
        pterodactyl: { panelUrl, serverId, apiKey: apiKey || undefined }
      });
      const res = await fetch('/api/v1/settings/test-pterodactyl', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    }
    setTesting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-title">Settings & Console Automation</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Auto-Teleport Settings */}
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={15} color="#8b5cf6" /> Auto-Teleport on Server Restart
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="switch-label">
                <div className="switch">
                  <input type="checkbox" checked={autoTpEnabled} onChange={e => setAutoTpEnabled(e.target.checked)} />
                  <span className="slider" />
                </div>
                <span>Enable Global Auto-Teleport on Server Restart</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Delay After Restart (Seconds)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={delaySeconds} 
                    onChange={e => setDelaySeconds(e.target.value)} 
                    min="2" 
                    max="60"
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Allows bot to complete DoSpawn handshake.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Distance Threshold (Blocks)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={distanceThreshold} 
                    onChange={e => setDistanceThreshold(e.target.value)} 
                    min="1"
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Triggers if bot is further than this from farm.</span>
                </div>
              </div>
            </div>
          </div>

          {/* AcidoHost Pterodactyl Integration */}
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={15} color="#3b82f6" /> AcidoHost Pterodactyl Client API
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Allows the Control Center to issue server console commands (`tp IronBot X Y Z`) automatically without needing operator status in-game.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Panel URL</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={panelUrl} 
                  onChange={e => setPanelUrl(e.target.value)} 
                  placeholder="https://panel.acido.dev" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Server ID (8-Char)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={serverId} 
                    onChange={e => setServerId(e.target.value)} 
                    placeholder="e.g. a1b2c3d4" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client API Key (starts with ptlc_)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)} 
                    placeholder={settings.pterodactyl?.isConfigured ? '•••••••• (Configured)' : 'ptlc_...'} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <button type="button" className="btn btn-sm" onClick={handleTestPterodactyl} disabled={testing}>
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>

                {testResult && (
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: testResult.success ? '#34d399' : '#f87171' }}>
                    {testResult.success ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                    {testResult.success ? 'Pterodactyl Connected!' : (testResult.details?.error || 'Connection Failed')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 5: Console Command Terminal
export function ConsoleCommandModal({ onClose }) {
  const { sendConsoleCommand, bots } = useControlCenter();
  const [command, setCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExecute = async (cmdToRun) => {
    const cmd = cmdToRun || command;
    if (!cmd.trim()) return;

    setExecuting(true);
    setResult(null);
    const res = await sendConsoleCommand(cmd.trim());
    setResult(res);
    setExecuting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#3b82f6" />
            Server Console Dispatcher
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Quick Teleport Commands:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {bots.map(b => (
                <button
                  key={b.id}
                  type="button"
                  className="btn btn-sm"
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => {
                    const c = `tp ${b.username} ${b.targetCoordinates.x} ${b.targetCoordinates.y} ${b.targetCoordinates.z}`;
                    setCommand(c);
                    handleExecute(c);
                  }}
                >
                  <Zap size={11} /> TP {b.name}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => {
                  setCommand('list');
                  handleExecute('list');
                }}
              >
                list
              </button>
            </div>
          </div>

          <form onSubmit={e => { e.preventDefault(); handleExecute(); }} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="form-input mono" 
              style={{ flex: 1 }} 
              value={command} 
              onChange={e => setCommand(e.target.value)} 
              placeholder="e.g. tp IronBot 40 108 -13 or list" 
              autoFocus 
            />
            <button type="submit" className="btn btn-primary" disabled={executing}>
              {executing ? 'Sending...' : 'Send'}
            </button>
          </form>

          {result && (
            <div className={`alert-box ${result.success ? 'info' : 'warning'}`}>
              {result.success ? (
                <div>Executed successfully on BDS console: <code>{result.command}</code></div>
              ) : (
                <div>
                  <div>{result.error}</div>
                  {result.fallbackCommand && (
                    <div style={{ marginTop: '4px', fontSize: '0.78rem' }}>
                      Command prepared: <code>{result.fallbackCommand}</code> (Configure AcidoHost Pterodactyl API key in Settings to auto-execute).
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Modal 6: Add Farm Modal
export function AddFarmModal({ onClose }) {
  const { createFarm, bots } = useControlCenter();
  const [name, setName] = useState('');
  const [type, setType] = useState('Iron Farm');
  const [dimension, setDimension] = useState('Overworld');
  const [x, setX] = useState(0);
  const [y, setY] = useState(64);
  const [z, setZ] = useState(0);
  const [assignedBot, setAssignedBot] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createFarm({
      name: name.trim(),
      type,
      dimension,
      coordinates: { x: Number(x), y: Number(y), z: Number(z) },
      assignedBot: assignedBot || undefined
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add New Farm / Chunk Loader</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Farm Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Gold Farm or Creeper Farm" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Farm Type</label>
              <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Iron Farm">Iron Farm</option>
                <option value="Gold Farm">Gold Farm</option>
                <option value="Creeper Farm">Creeper Farm</option>
                <option value="Raid Farm">Raid Farm</option>
                <option value="Slime Farm">Slime Farm</option>
                <option value="General Mob Farm">General Mob Farm</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned AFK Bot</label>
              <select className="form-input" value={assignedBot} onChange={e => setAssignedBot(e.target.value)}>
                <option value="">-- None --</option>
                {bots.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Coordinates (X, Y, Z)</label>
            <div className="coords-inputs-row">
              <input type="number" className="form-input" value={x} onChange={e => setX(e.target.value)} placeholder="X" required />
              <input type="number" className="form-input" value={y} onChange={e => setY(e.target.value)} placeholder="Y" required />
              <input type="number" className="form-input" value={z} onChange={e => setZ(e.target.value)} placeholder="Z" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Create Farm</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal 7: Edit Farm Modal
export function EditFarmModal({ farm, onClose }) {
  const { updateFarm, bots } = useControlCenter();
  const [name, setName] = useState(farm?.name || '');
  const [type, setType] = useState(farm?.type || 'Iron Farm');
  const [x, setX] = useState(farm?.coordinates?.x ?? 0);
  const [y, setY] = useState(farm?.coordinates?.y ?? 64);
  const [z, setZ] = useState(farm?.coordinates?.z ?? 0);
  const [assignedBot, setAssignedBot] = useState(farm?.assignedBot || '');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateFarm(farm.id, {
      name,
      type,
      coordinates: { x: Number(x), y: Number(y), z: Number(z) },
      assignedBot
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Edit Farm: {farm.name}</div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Farm Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Farm Type</label>
              <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Iron Farm">Iron Farm</option>
                <option value="Gold Farm">Gold Farm</option>
                <option value="Creeper Farm">Creeper Farm</option>
                <option value="Raid Farm">Raid Farm</option>
                <option value="Slime Farm">Slime Farm</option>
                <option value="General Mob Farm">General Mob Farm</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Bot</label>
              <select className="form-input" value={assignedBot} onChange={e => setAssignedBot(e.target.value)}>
                <option value="">-- None --</option>
                {bots.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Coordinates (X, Y, Z)</label>
            <div className="coords-inputs-row">
              <input type="number" className="form-input" value={x} onChange={e => setX(e.target.value)} placeholder="X" required />
              <input type="number" className="form-input" value={y} onChange={e => setY(e.target.value)} placeholder="Y" required />
              <input type="number" className="form-input" value={z} onChange={e => setZ(e.target.value)} placeholder="Z" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
