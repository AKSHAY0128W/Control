import { WebSocketServer, WebSocket } from 'ws';
import { state, logActivity } from '../models/db.js';
import { calculateDistance } from '../services/autoTeleportEngine.js';

let wss = null;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/ws/live' });

  wss.on('connection', (ws, req) => {
    // Send initial snapshot to newly connected client
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      payload: {
        serverMetrics: state.serverMetrics,
        bots: state.bots,
        farms: state.farms,
        activityLogs: state.activityLogs.slice(0, 50),
        settings: state.settings
      }
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // Handle bot agent telemetry push
        if (data.type === 'BOT_TELEMETRY' && data.payload) {
          handleBotTelemetry(data.payload);
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err.message);
      }
    });

    ws.on('error', (err) => {
      console.warn('[WS] Client connection error:', err.message);
    });
  });

  console.log('[WS] WebSocket server initialized on path /ws/live');
}

function handleBotTelemetry(telemetry) {
  const { botName, status, x, y, z, dimension, reconnectCount, error } = telemetry;
  const bot = state.bots.find(b => b.name.toLowerCase() === (botName || '').toLowerCase());

  if (bot) {
    if (x !== undefined && y !== undefined && z !== undefined) {
      bot.currentCoordinates = { x, y, z };
      
      // Check if bot is misplaced relative to target
      const dist = calculateDistance(bot.currentCoordinates, bot.targetCoordinates);
      if (dist > (state.settings.autoTeleport.distanceThreshold || 10)) {
        bot.status = 'misplaced';
      } else {
        bot.status = status || 'online';
      }
    }

    if (dimension) bot.dimension = dimension;
    if (reconnectCount !== undefined) bot.reconnectCount = reconnectCount;
    if (error) bot.lastError = error;

    broadcast({
      type: 'BOTS_UPDATE',
      payload: state.bots
    });
  }
}

export function broadcast(data) {
  if (!wss) return;
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
