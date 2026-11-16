import express from 'express';
import { state, logActivity } from '../models/db.js';
import { calculateDistance } from '../services/autoTeleportEngine.js';
import { renderService } from '../services/renderService.js';
import { broadcast } from '../websocket/wsServer.js';

export const agentRouter = express.Router();

// GET /api/v1/agent/bots
// Polled by the Go AFK bot agent on Render to get the authoritative list of bots to run
agentRouter.get('/bots', (req, res) => {
  const activeBots = state.bots.map(b => ({
    name: b.name,
    username: b.username || b.name,
    enabled: b.enabled !== false,
    assignedFarm: b.assignedFarm,
    targetCoordinates: b.targetCoordinates,
    autoTeleport: b.autoTeleport !== false
  }));

  res.json({
    success: true,
    server: {
      host: state.settings?.bedrock?.host || 'ayx.acido.dev',
      port: state.settings?.bedrock?.port || 19132,
      transport: state.settings?.bedrock?.transport || 'nethernet',
      version: '1.26.61'
    },
    pollIntervalSeconds: 15,
    bots: activeBots
  });
});

// POST /api/v1/agent/telemetry
// Reported by the Go bot agent on Render with live packet coordinates & connection status
agentRouter.post('/telemetry', (req, res) => {
  const { botName, status, x, y, z, dimension, reconnectCount, error } = req.body;
  if (!botName) {
    return res.status(400).json({ success: false, error: 'botName is required' });
  }

  let bot = state.bots.find(b => b.name.toLowerCase() === botName.toLowerCase());
  if (bot) {
    bot.lastConnected = new Date().toISOString();
    if (status) bot.status = status;
    if (reconnectCount !== undefined) bot.reconnectCount = reconnectCount;
    if (error !== undefined) bot.lastError = error;

    if (x !== undefined && y !== undefined && z !== undefined) {
      bot.currentCoordinates = {
        x: parseFloat(Number(x).toFixed(1)),
        y: parseFloat(Number(y).toFixed(1)),
        z: parseFloat(Number(z).toFixed(1))
      };

      const dist = calculateDistance(bot.currentCoordinates, bot.targetCoordinates);
      const threshold = state.settings.autoTeleport?.distanceThreshold || 10;
      if (dist > threshold) {
        bot.status = 'misplaced';
      } else if (status === 'online' || !status) {
        bot.status = 'online';
      }
    }

    if (dimension !== undefined) {
      bot.dimension = dimension === 1 ? 'Nether' : dimension === 2 ? 'End' : 'Overworld';
    }

    broadcast({ type: 'BOTS_UPDATE', payload: state.bots });
  }

  res.json({ success: true });
});

// POST /api/v1/agent/render/sync
// Manually triggers sync between Control Center and Render bot container
agentRouter.post('/render/sync', async (req, res) => {
  const result = await renderService.notifyRenderService();
  res.json({ success: true, result });
});

// POST /api/v1/agent/render/ping
// Pings the Render service to verify connectivity and keep it awake
agentRouter.post('/render/ping', async (req, res) => {
  const result = await renderService.pingRenderService();
  res.json(result);
});

// POST /api/v1/agent/render/deploy
// Triggers a fresh deployment on Render via official API
agentRouter.post('/render/deploy', async (req, res) => {
  const result = await renderService.triggerRenderDeploy();
  res.json(result);
});
