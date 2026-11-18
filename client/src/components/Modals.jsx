import React, { useState } from 'react';
import { useControlCenter } from '../context/ControlCenterContext';
import { Button, InputField } from './ui/Shared';
import { X, Bot, Layers, Zap } from 'lucide-react';

// Modal Base Wrapper matching Lovable Dialog
function ModalWrapper({ children, onClose, maxWidth = 'max-w-md' }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0"
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidth} rounded-lg border border-border bg-card p-6 shadow-xl transition-all space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// 1. Add / Register Bot Modal
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
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Bot ${name.trim()} registered and queued for deployment.` });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Register new bot</h2>
        </div>
        <button 
          onClick={onClose} 
          className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pt-1">
        <InputField
          label="Bot Player Name (Minecraft Username)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. IronBot3"
          required
        />

        {farms.length > 0 && (
          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Assign to Target Farm</span>
            <select
              value={farmId}
              onChange={(e) => handleFarmSelect(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.coordinates?.x ?? f.x}, {f.coordinates?.y ?? f.y}, {f.coordinates?.z ?? f.z})
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Target Coordinates</span>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              label="X"
              value={x}
              onChange={(e) => setX(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Y"
              value={y}
              onChange={(e) => setY(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Z"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              type="number"
              mono={true}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register bot'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// 2. Edit Bot Coordinates Modal
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
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Bot ${name.trim()} settings updated.` });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Edit bot: {bot?.name}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pt-1">
        <InputField
          label="Bot Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <InputField
          label="Assigned Farm Label"
          value={farmName}
          onChange={(e) => setFarmName(e.target.value)}
        />

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Target Farm Coordinates</span>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              label="X"
              value={x}
              onChange={(e) => setX(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Y"
              value={y}
              onChange={(e) => setY(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Z"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              type="number"
              mono={true}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// 3. Custom Teleport Modal
export function CustomTeleportModal({ bot, onClose }) {
  const { teleportBot, farms, setLastNotification } = useControlCenter();
  const [x, setX] = useState(bot?.currentCoordinates?.x ?? bot?.x ?? 0);
  const [y, setY] = useState(bot?.currentCoordinates?.y ?? bot?.y ?? 64);
  const [z, setZ] = useState(bot?.currentCoordinates?.z ?? bot?.z ?? 0);
  const [teleporting, setTeleporting] = useState(false);

  const handleTeleport = async (e) => {
    e.preventDefault();
    setTeleporting(true);
    try {
      await teleportBot(bot.id, { x: Number(x), y: Number(y), z: Number(z) });
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Dispatched teleport for ${bot.name} to [${x}, ${y}, ${z}].` });
      }
      onClose();
    } finally {
      setTeleporting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Zap className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">Custom teleport</h2>
            <p className="text-xs text-muted-foreground">Move {bot?.name || 'bot'} to specified coordinates.</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleTeleport} className="space-y-4 pt-1">
        {farms.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Quick Presets</span>
            <div className="flex flex-wrap gap-1.5">
              {farms.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => {
                    setX(f.coordinates?.x ?? f.x);
                    setY(f.coordinates?.y ?? f.y);
                    setZ(f.coordinates?.z ?? f.z);
                  }}
                  className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <InputField
            label="X"
            value={x}
            onChange={(e) => setX(e.target.value)}
            type="number"
            mono={true}
            required
          />
          <InputField
            label="Y"
            value={y}
            onChange={(e) => setY(e.target.value)}
            type="number"
            mono={true}
            required
          />
          <InputField
            label="Z"
            value={z}
            onChange={(e) => setZ(e.target.value)}
            type="number"
            mono={true}
            required
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={teleporting}>
            {teleporting ? 'Teleporting...' : 'Teleport bot'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// 4. Add Farm Modal
export function AddFarmModal({ onClose }) {
  const { addFarm, bots, setLastNotification } = useControlCenter();
  const [name, setName] = useState('');
  const [type, setType] = useState('Iron Farm');
  const [customType, setCustomType] = useState('');
  const [dimension, setDimension] = useState('Overworld');
  const [x, setX] = useState(0);
  const [y, setY] = useState(64);
  const [z, setZ] = useState(0);
  const [assignedBot, setAssignedBot] = useState(bots[0]?.name || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resolvedType = type === 'Custom Farm' ? (customType.trim() || 'Custom Farm') : type;

    setSubmitting(true);
    try {
      await addFarm({
        name: name.trim(),
        type: resolvedType,
        dimension,
        coordinates: { x: Number(x), y: Number(y), z: Number(z) },
        x: Number(x),
        y: Number(y),
        z: Number(z),
        assignedBot
      });
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Farm "${name.trim()}" added successfully.` });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success">
            <Layers className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Add farm loader</h2>
        </div>
        <button 
          onClick={onClose} 
          className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pt-1">
        <InputField
          label="Farm Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Outpost Slime Farm"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Farm Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Iron Farm">Iron Farm</option>
              <option value="Gold Farm">Gold Farm</option>
              <option value="Raid Farm">Raid Farm</option>
              <option value="Crop Farm">Crop Farm</option>
              <option value="Mob Farm">Mob Farm</option>
              <option value="Custom Farm">Custom Farm (Specify below)</option>
            </select>
          </label>

          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Dimension</span>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Overworld">Overworld</option>
              <option value="Nether">Nether</option>
              <option value="The End">The End</option>
            </select>
          </label>
        </div>

        {type === 'Custom Farm' && (
          <InputField
            label="Custom Farm Type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="e.g. Copper Farm, Slime Farm, Witch Hut"
            required
          />
        )}

        {bots.length > 0 && (
          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Assign Worker Bot</span>
            <select
              value={assignedBot}
              onChange={(e) => setAssignedBot(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Unassigned</option>
              {bots.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Coordinates</span>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              label="X"
              value={x}
              onChange={(e) => setX(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Y"
              value={y}
              onChange={(e) => setY(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Z"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              type="number"
              mono={true}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Save farm'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// 5. Edit Farm Modal
export function EditFarmModal({ farm, onClose }) {
  const { updateFarm, deleteFarm, bots, setLastNotification } = useControlCenter();
  const [name, setName] = useState(farm?.name || '');
  
  const standardTypes = ['Iron Farm', 'Gold Farm', 'Raid Farm', 'Crop Farm', 'Mob Farm'];
  const isCustomType = farm?.type && !standardTypes.includes(farm.type);
  const [type, setType] = useState(isCustomType ? 'Custom Farm' : (farm?.type || 'Iron Farm'));
  const [customType, setCustomType] = useState(isCustomType ? farm.type : '');
  
  const [dimension, setDimension] = useState(farm?.dimension || 'Overworld');
  const [x, setX] = useState(farm?.coordinates?.x ?? farm?.x ?? 0);
  const [y, setY] = useState(farm?.coordinates?.y ?? farm?.y ?? 64);
  const [z, setZ] = useState(farm?.coordinates?.z ?? farm?.z ?? 0);
  const [assignedBot, setAssignedBot] = useState(farm?.assignedBot || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const resolvedType = type === 'Custom Farm' ? (customType.trim() || 'Custom Farm') : type;
    try {
      await updateFarm(farm.id, {
        name: name.trim(),
        type: resolvedType,
        dimension,
        coordinates: { x: Number(x), y: Number(y), z: Number(z) },
        assignedBot
      });
      if (setLastNotification) {
        setLastNotification({ type: 'success', text: `Farm "${name.trim()}" updated.` });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success">
            <Layers className="size-4" />
          </span>
          <h2 className="text-base font-semibold text-foreground">Edit farm: {farm?.name}</h2>
        </div>
        <button 
          onClick={onClose} 
          className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pt-1">
        <InputField
          label="Farm Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Farm Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Iron Farm">Iron Farm</option>
              <option value="Gold Farm">Gold Farm</option>
              <option value="Raid Farm">Raid Farm</option>
              <option value="Crop Farm">Crop Farm</option>
              <option value="Mob Farm">Mob Farm</option>
              <option value="Custom Farm">Custom Farm (Specify below)</option>
            </select>
          </label>

          <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
            <span>Dimension</span>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Overworld">Overworld</option>
              <option value="Nether">Nether</option>
              <option value="The End">The End</option>
            </select>
          </label>
        </div>

        {type === 'Custom Farm' && (
          <InputField
            label="Custom Farm Type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="e.g. Copper Farm, Slime Farm, Witch Hut"
            required
          />
        )}

        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Coordinates</span>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              label="X"
              value={x}
              onChange={(e) => setX(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Y"
              value={y}
              onChange={(e) => setY(e.target.value)}
              type="number"
              mono={true}
              required
            />
            <InputField
              label="Z"
              value={z}
              onChange={(e) => setZ(e.target.value)}
              type="number"
              mono={true}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            type="button" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            onClick={async () => {
              if (window.confirm(`Delete farm "${farm?.name}"?`)) {
                await deleteFarm(farm.id);
                onClose();
              }
            }}
          >
            Delete farm
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
}
