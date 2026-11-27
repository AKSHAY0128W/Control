import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Button, InputField } from './ui/Shared';
import { X, Bot, Layers, Zap } from 'lucide-react';

function ModalWrapper({ children, onClose }) {
  return (
    <div className="cc-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon: Icon, iconTone = 'primary', title, onClose }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className={`cc-icon-box ${iconTone === 'success' ? 'is-success' : ''}`} style={{ width: 32, height: 32 }}>
          <Icon size={16} />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog" style={{ width: 30, height: 30 }}>
        <X size={15} />
      </Button>
    </div>
  );
}

export function AddBotModal({ onClose }) {
  const { addBot, farms, setLastNotification } = useControlCenter();
  const [name, setName] = useState('');
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [farmName, setFarmName] = useState(farms[0]?.name || '');
  const [x, setX] = useState(farms[0]?.coordinates?.x ?? farms[0]?.x ?? 0);
  const [y, setY] = useState(farms[0]?.coordinates?.y ?? farms[0]?.y ?? 64);
  const [z, setZ] = useState(farms[0]?.coordinates?.z ?? farms[0]?.z ?? 0);
  const [submitting, setSubmitting] = useState(false);

  const handleFarmSelect = (id) => {
    setFarmId(id);
    const selected = farms.find(f => f.id === id);
    if (selected) {
      setFarmName(selected.name);
      setX(selected.coordinates?.x ?? selected.x ?? 0);
      setY(selected.coordinates?.y ?? selected.y ?? 64);
      setZ(selected.coordinates?.z ?? selected.z ?? 0);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await addBot({
        name: name.trim(),
        username: name.trim(),
        farmId: farmId || undefined,
        assignedFarm: farmName || 'Custom Target',
        targetCoordinates: { x: Number(x), y: Number(y), z: Number(z) },
        x: Number(x),
        y: Number(y),
        z: Number(z),
        active: true,
        autoTeleport: true
      });
      setLastNotification?.({ type: 'success', text: `Bot ${name.trim()} registered and queued for deployment.` });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader icon={Bot} title="Register new bot" onClose={onClose} />
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <InputField
          label="Bot Player Name (Minecraft Username)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. IronBot3"
        />

        {farms.length > 0 && (
          <label className="cc-field">
            <span className="cc-field-label">Assign to Target Farm</span>
            <select value={farmId} onChange={(e) => handleFarmSelect(e.target.value)} className="cc-select">
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.coordinates?.x ?? f.x}, {f.coordinates?.y ?? f.y}, {f.coordinates?.z ?? f.z})
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="cc-grid-3" style={{ gap: 10 }}>
          <InputField label="X" value={x} onChange={(e) => setX(e.target.value)} type="number" mono />
          <InputField label="Y" value={y} onChange={(e) => setY(e.target.value)} type="number" mono />
          <InputField label="Z" value={z} onChange={(e) => setZ(e.target.value)} type="number" mono />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
          <Button size="sm" type="submit" disabled={submitting}>{submitting ? 'Registering...' : 'Register bot'}</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function EditCoordinatesModal({ bot, onClose }) {
  const { updateBot, farms, setLastNotification } = useControlCenter();
  const [name, setName] = useState(bot?.name || '');
  const [farmName, setFarmName] = useState(bot?.assignedFarm || '');
  const [x, setX] = useState(bot?.targetCoordinates?.x ?? bot?.x ?? 0);
  const [y, setY] = useState(bot?.targetCoordinates?.y ?? bot?.y ?? 64);
  const [z, setZ] = useState(bot?.targetCoordinates?.z ?? bot?.z ?? 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateBot(bot.id, {
        name: name.trim(),
        username: name.trim(),
        assignedFarm: farmName,
        targetCoordinates: { x: Number(x), y: Number(y), z: Number(z) }
      });
      setLastNotification?.({ type: 'success', text: `Bot ${name.trim()} settings updated.` });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader icon={Bot} title={`Edit bot: ${bot?.name}`} onClose={onClose} />
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <InputField label="Bot Name" value={name} onChange={(e) => setName(e.target.value)} />
        <InputField label="Assigned Farm Label" value={farmName} onChange={(e) => setFarmName(e.target.value)} />

        {farms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {farms.map(f => (
              <Button
                key={f.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFarmName(f.name);
                  setX(f.coordinates?.x ?? f.x ?? 0);
                  setY(f.coordinates?.y ?? f.y ?? 64);
                  setZ(f.coordinates?.z ?? f.z ?? 0);
                }}
              >
                {f.name}
              </Button>
            ))}
          </div>
        )}

        <div className="cc-grid-3" style={{ gap: 10 }}>
          <InputField label="X" value={x} onChange={(e) => setX(e.target.value)} type="number" mono />
          <InputField label="Y" value={y} onChange={(e) => setY(e.target.value)} type="number" mono />
          <InputField label="Z" value={z} onChange={(e) => setZ(e.target.value)} type="number" mono />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
          <Button size="sm" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save coordinates'}</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function CustomTeleportModal({ bot, onClose }) {
  const { teleportBot, farms, setLastNotification } = useControlCenter();
  const [x, setX] = useState(bot?.targetCoordinates?.x ?? bot?.x ?? 0);
  const [y, setY] = useState(bot?.targetCoordinates?.y ?? bot?.y ?? 64);
  const [z, setZ] = useState(bot?.targetCoordinates?.z ?? bot?.z ?? 0);
  const [submitting, setSubmitting] = useState(false);

  const handleTeleport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await teleportBot(bot.id, { x: Number(x), y: Number(y), z: Number(z) });
      setLastNotification?.({ type: 'success', text: `Dispatched custom TP for ${bot.name} to (${x}, ${y}, ${z}).` });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader icon={Zap} title={`Custom TP: ${bot?.name}`} onClose={onClose} />
      <form onSubmit={handleTeleport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Dispatch an immediate <code className="cc-mono">tp {bot?.name} X Y Z</code> command to Bedrock Dedicated Server.
        </p>

        {farms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {farms.map(f => (
              <Button
                key={f.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setX(f.coordinates?.x ?? f.x ?? 0);
                  setY(f.coordinates?.y ?? f.y ?? 64);
                  setZ(f.coordinates?.z ?? f.z ?? 0);
                }}
              >
                {f.name}
              </Button>
            ))}
          </div>
        )}

        <div className="cc-grid-3" style={{ gap: 10 }}>
          <InputField label="X" value={x} onChange={(e) => setX(e.target.value)} type="number" mono />
          <InputField label="Y" value={y} onChange={(e) => setY(e.target.value)} type="number" mono />
          <InputField label="Z" value={z} onChange={(e) => setZ(e.target.value)} type="number" mono />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
          <Button size="sm" type="submit" disabled={submitting}>{submitting ? 'Teleporting...' : 'Teleport now'}</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

const PRESET_TYPES = ['Iron Farm', 'Gold Farm', 'Raid Farm', 'Crop Farm', 'Mob Farm'];

export function AddFarmModal({ onClose }) {
  const { addFarm, setLastNotification } = useControlCenter();
  const [name, setName] = useState('');
  const [type, setType] = useState('Iron Farm');
  const [customType, setCustomType] = useState('');
  const [dimension, setDimension] = useState('Overworld');
  const [x, setX] = useState(0);
  const [y, setY] = useState(64);
  const [z, setZ] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalType = type === 'Custom Farm' ? (customType.trim() || 'Custom Farm') : type;

    setSubmitting(true);
    try {
      await addFarm({
        name: name.trim(),
        type: finalType,
        dimension,
        coordinates: { x: Number(x), y: Number(y), z: Number(z) }
      });
      setLastNotification?.({ type: 'success', text: `Farm "${name.trim()}" (${finalType}) created.` });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader icon={Layers} iconTone="success" title="Add farm loader" onClose={onClose} />
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <InputField label="Farm Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Raid Farm" />

        <div className="cc-grid-2" style={{ gap: 12 }}>
          <label className="cc-field">
            <span className="cc-field-label">Farm Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="cc-select">
              {PRESET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="Custom Farm">Custom Farm (Specify below)</option>
            </select>
          </label>

          <label className="cc-field">
            <span className="cc-field-label">Dimension</span>
            <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="cc-select">
              <option value="Overworld">Overworld</option>
              <option value="Nether">Nether</option>
              <option value="The End">The End</option>
            </select>
          </label>
        </div>

        {type === 'Custom Farm' && (
          <InputField label="Custom Farm Type" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="e.g. Copper Farm, Witch Hut" />
        )}

        <div className="cc-grid-3" style={{ gap: 10 }}>
          <InputField label="X" value={x} onChange={(e) => setX(e.target.value)} type="number" mono />
          <InputField label="Y" value={y} onChange={(e) => setY(e.target.value)} type="number" mono />
          <InputField label="Z" value={z} onChange={(e) => setZ(e.target.value)} type="number" mono />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
          <Button size="sm" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create farm'}</Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function EditFarmModal({ farm, onClose }) {
  const { updateFarm, deleteFarm, setLastNotification } = useControlCenter();
  const isPreset = PRESET_TYPES.includes(farm?.type);
  const [name, setName] = useState(farm?.name || '');
  const [type, setType] = useState(isPreset ? farm.type : 'Custom Farm');
  const [customType, setCustomType] = useState(isPreset ? '' : (farm?.type || ''));
  const [dimension, setDimension] = useState(farm?.dimension || 'Overworld');
  const [x, setX] = useState(farm?.coordinates?.x ?? farm?.x ?? 0);
  const [y, setY] = useState(farm?.coordinates?.y ?? farm?.y ?? 64);
  const [z, setZ] = useState(farm?.coordinates?.z ?? farm?.z ?? 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const finalType = type === 'Custom Farm' ? (customType.trim() || 'Custom Farm') : type;
    setSubmitting(true);
    try {
      await updateFarm(farm.id, {
        name: name.trim(),
        type: finalType,
        dimension,
        coordinates: { x: Number(x), y: Number(y), z: Number(z) }
      });
      setLastNotification?.({ type: 'success', text: `Farm "${name.trim()}" updated.` });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <ModalHeader icon={Layers} iconTone="success" title={`Edit farm: ${farm?.name}`} onClose={onClose} />
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <InputField label="Farm Name" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="cc-grid-2" style={{ gap: 12 }}>
          <label className="cc-field">
            <span className="cc-field-label">Farm Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="cc-select">
              {PRESET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              <option value="Custom Farm">Custom Farm (Specify below)</option>
            </select>
          </label>

          <label className="cc-field">
            <span className="cc-field-label">Dimension</span>
            <select value={dimension} onChange={(e) => setDimension(e.target.value)} className="cc-select">
              <option value="Overworld">Overworld</option>
              <option value="Nether">Nether</option>
              <option value="The End">The End</option>
            </select>
          </label>
        </div>

        {type === 'Custom Farm' && (
          <InputField label="Custom Farm Type" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="e.g. Copper Farm, Witch Hut" />
        )}

        <div className="cc-grid-3" style={{ gap: 10 }}>
          <InputField label="X" value={x} onChange={(e) => setX(e.target.value)} type="number" mono />
          <InputField label="Y" value={y} onChange={(e) => setY(e.target.value)} type="number" mono />
          <InputField label="Z" value={z} onChange={(e) => setZ(e.target.value)} type="number" mono />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={async () => {
              await deleteFarm(farm.id);
              onClose();
            }}
          >
            Delete farm
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button size="sm" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
