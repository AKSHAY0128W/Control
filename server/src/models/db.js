import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';

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
    }
  }
};

export async function initDb() {
  if (!config.mongodbUri) {
    console.log('[DB] No MONGODB_URI provided. Running in high-performance memory storage mode.');
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
