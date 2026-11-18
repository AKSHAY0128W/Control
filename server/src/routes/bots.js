import express from 'express';
import { state, logActivity, saveStateToFile } from '../models/db.js';
import { executeManualTeleport } from '../services/autoTeleportEngine.js';
import { renderService } from '../services/renderService.js';
import { broadcast } from '../websocket/wsServer.js';

export const botsRouter = express.Router();

// GET all bots
botsRouter.get('/', (req, res) => {
  res.json({ success: true, data: state.bots });
});

// GET single bot
botsRouter.get('/:id', (req, res) => {
  const bot = state.bots.find(b => b.id === req.params.id);
  if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });
  res.json({ success: true, data: bot });
});

// POST register new bot
botsRouter.post('/', async (req, res) => {
  const { name, username, assignedFarm, targetCoordinates, autoTeleport, enabled } = req.body;
  if (!name || !username) {
    return res.status(400).json({ success: false, error: 'Name and Username are required' });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (state.bots.some(b => b.id === id)) {
    return res.status(400).json({ success: false, error: 'A bot with this name already exists' });
  }

  const coords = targetCoordinates || { x: 0, y: 64, z: 0 };
  const newBot = {
    id,
    name: name.trim(),
    username: username.trim(),
    serverAddress: `${state.settings?.pterodactyl?.panelUrl || 'ayx.acido.dev'}:19132`,
    assignedFarm: assignedFarm || 'Unassigned',
    targetCoordinates: coords,
    currentCoordinates: coords,
    dimension: 'Overworld',
    status: 'connecting',
    enabled: enabled !== false,
    autoTeleport: autoTeleport !== false,
    lastConnected: new Date().toISOString(),
    lastDisconnected: null,
    reconnectCount: 0,
    uptimeSeconds: 0,
    lastError: null
  };

  state.bots.push(newBot);
  saveStateToFile();
  logActivity('BOT_REGISTERED', `New bot registered: ${newBot.name} (Assigned to: ${newBot.assignedFarm})`, 'info', 'BotManager');
  broadcast({ type: 'BOTS_UPDATE', payload: state.bots });

  // Sync to Render service
  renderService.notifyRenderService(state.bots).catch(() => {});

  res.status(201).json({ success: true, data: newBot });
});

// PATCH update bot
botsRouter.patch('/:id', async (req, res) => {
  const bot = state.bots.find(b => b.id === req.params.id);
  if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

  const { name, username, targetCoordinates, assignedFarm, autoTeleport, status, enabled } = req.body;

  if (name && name.trim()) bot.name = name.trim();
  if (username && username.trim()) bot.username = username.trim();
  if (enabled !== undefined) bot.enabled = Boolean(enabled);

  if (targetCoordinates) {
    bot.targetCoordinates = {
      x: Number(targetCoordinates.x ?? bot.targetCoordinates.x),
      y: Number(targetCoordinates.y ?? bot.targetCoordinates.y),
      z: Number(targetCoordinates.z ?? bot.targetCoordinates.z),
    };
  }
  if (assignedFarm !== undefined) bot.assignedFarm = assignedFarm;
  if (autoTeleport !== undefined) bot.autoTeleport = Boolean(autoTeleport);
  if (status !== undefined) bot.status = status;

  saveStateToFile();
  logActivity('BOT_CONFIG_UPDATED', `Updated configuration for ${bot.name} (Target: ${bot.targetCoordinates.x}, ${bot.targetCoordinates.y}, ${bot.targetCoordinates.z})`, 'info', 'BotManager');
  broadcast({ type: 'BOTS_UPDATE', payload: state.bots });

  // Sync updated bot config to Render
  renderService.notifyRenderService(state.bots).catch(() => {});

  res.json({ success: true, data: bot });
});

// POST toggle bot enabled/disabled (start/stop)
botsRouter.post('/:id/toggle', async (req, res) => {
  const bot = state.bots.find(b => b.id === req.params.id);
  if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

  bot.enabled = bot.enabled === false ? true : false;
  if (!bot.enabled) {
    bot.status = 'offline';
  } else {
    bot.status = 'connecting';
  }

  saveStateToFile();
  logActivity('BOT_TOGGLED', `Bot ${bot.name} ${bot.enabled ? 'started / enabled' : 'paused / stopped'} from control panel`, 'info', 'BotManager');
  broadcast({ type: 'BOTS_UPDATE', payload: state.bots });

  // Sync to Render
  renderService.notifyRenderService(state.bots).catch(() => {});

  res.json({ success: true, data: bot });
});

// POST manual teleport bot to assigned coordinates or custom coordinates
botsRouter.post('/:id/teleport', async (req, res) => {
  const { customCoords } = req.body;
  const result = await executeManualTeleport(req.params.id, customCoords);
  res.json(result);
});

// DELETE remove bot
botsRouter.delete('/:id', async (req, res) => {
  const index = state.bots.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Bot not found' });

  const removed = state.bots.splice(index, 1)[0];
  saveStateToFile();
  logActivity('BOT_REMOVED', `Bot removed: ${removed.name}`, 'warning', 'BotManager');
  broadcast({ type: 'BOTS_UPDATE', payload: state.bots });

  // Sync deletion to Render
  renderService.notifyRenderService(state.bots).catch(() => {});

  res.json({ success: true, message: `Bot ${removed.name} removed successfully` });
});
