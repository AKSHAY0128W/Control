import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/state.json');

// In-Memory state fallback
export const state = {
  isMongoConnected: false,
  users: [
    {
      id: 'user-admin',
      username: 'admin',
      passwordHash: bcrypt.hashSync('smpadmin2026', 10),
      role: 'admin',
      name: 'Server Administrator',
      createdAt: new Date().toISOString()
    }
  ],
  bots: [
    {
      id: 'ironbot',
      name: 'IronBot',
      username: 'IronBot',
      serverAddress: `${config.bedrock.host}:${config.bedrock.port}`,
      assignedFarm: 'Iron Farm 1',
      targetCoordinates: { x: 40, y: 108, z: -13 },
      currentCoordinates: { x: 0, y: 64, z: 0 },
      dimension: 'Overworld',
      status: 'offline', // 'online' | 'reconnecting' | 'offline' | 'misplaced'
      autoTeleport: true,
      lastConnected: null,
      lastDisconnected: null,
      reconnectCount: 0,
      uptimeSeconds: 0,
      lastError: 'Bot agent not connected'
    },
    {
      id: 'ironbot2',
      name: 'IronBot2',
      username: 'IronBot2',
      serverAddress: `${config.bedrock.host}:${config.bedrock.port}`,
      assignedFarm: 'Iron Farm 2',
      targetCoordinates: { x: -239, y: 73, z: -162 },
      currentCoordinates: { x: 0, y: 64, z: 0 },
      dimension: 'Overworld',
      status: 'offline',
      autoTeleport: true,
      lastConnected: null,
      lastDisconnected: null,
      reconnectCount: 0,
      uptimeSeconds: 0,
      lastError: 'Bot agent not connected'
    }
  ],
  farms: [
    {
      id: 'farm-1',
      name: 'Iron Farm 1',
      type: 'Iron Farm',
      dimension: 'Overworld',
      coordinates: { x: 40, y: 108, z: -13 },
      assignedBot: 'IronBot',
      description: 'Primary iron golem farm chunk loader',
      expectedResources: 'Iron Ingot, Poppy',
      status: 'active',
      lastVerified: new Date().toISOString()
    },
    {
      id: 'farm-2',
      name: 'Iron Farm 2',
      type: 'Iron Farm',
      dimension: 'Overworld',
      coordinates: { x: -239, y: 73, z: -162 },
      assignedBot: 'IronBot2',
      description: 'Secondary outpost iron farm',
      expectedResources: 'Iron Ingot, Poppy',
      status: 'active',
      lastVerified: new Date().toISOString()
    }
  ],
  activityLogs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      event: 'SYSTEM_INIT',
      description: 'OUR SMP Control Center initialized with auto-teleport engine.',
      severity: 'info',
      source: 'ControlCenter'
    }
  ],
  serverMetrics: {
    online: false,
    motd: 'Unknown',
    version: 'Unknown',
    protocol: 0,
    worldName: 'CherryVale SMP',
    playerCount: 0,
    maxPlayers: 10,
    latencyMs: 0,
    lastCheck: null,
    lastRestart: null,
    restartCount: 0,
    cpuUsage: null,
    ramUsage: null,
    diskUsage: null
  },
  settings: {
    pterodactyl: {
      panelUrl: config.pterodactyl.panelUrl,
      apiKey: config.pterodactyl.apiKey,
      serverId: config.pterodactyl.serverId,
    },
    autoTeleport: {
      enabled: config.autoTeleport.enabled,
      delaySeconds: config.autoTeleport.delaySeconds,
      distanceThreshold: config.autoTeleport.distanceThreshold,
    },
    render: {
      serviceUrl: process.env.RENDER_BOT_SERVICE_URL || 'https://afk-nqeu.onrender.com',
      serviceId: process.env.RENDER_SERVICE_ID || 'srv-cba31dh5efls73cocdm0',
      apiKey: process.env.RENDER_API_KEY || '',
      keepAlive: true,
      lastPing: null,
      lastPingStatus: 'idle'
    }
  }
};

export function saveStateToFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const dataToSave = {
      users: state.users,
      bots: state.bots,
      farms: state.farms,
      settings: state.settings
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to save state to file:', err.message);
  }
}

export function loadStateFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      if (Array.isArray(loaded.users)) state.users = loaded.users;
      if (Array.isArray(loaded.bots)) state.bots = loaded.bots;
      if (Array.isArray(loaded.farms)) state.farms = loaded.farms;
      if (loaded.settings) {
        state.settings = {
          ...state.settings,
          ...loaded.settings,
          render: {
            ...state.settings.render,
            ...(loaded.settings.render || {})
          }
        };
      }
      console.log(`[DB] Restored state from ${DATA_FILE} (${state.bots.length} bots, ${state.farms.length} farms)`);
    }
  } catch (err) {
    console.error('[DB] Failed to load state from file:', err.message);
  }
}

export async function initDb() {
  loadStateFromFile();
  if (!config.mongodbUri) {
    console.log('[DB] No MONGODB_URI provided. Running in high-performance memory storage mode with local file persistence.');
    return;
  }
  try {
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 5000 });
    state.isMongoConnected = true;
    console.log('[DB] Connected successfully to MongoDB Atlas.');
  } catch (err) {
    console.warn('[DB] MongoDB connection failed. Continuing in high-performance memory mode:', err.message);
  }
}

export function logActivity(event, description, severity = 'info', source = 'ControlCenter') {
  const log = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    event,
    description,
    severity,
    source
  };
  state.activityLogs.unshift(log);
  if (state.activityLogs.length > 500) {
    state.activityLogs.pop();
  }
  return log;
}
