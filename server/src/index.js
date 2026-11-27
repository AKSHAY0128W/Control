import http from 'http';
import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { initDb, logActivity } from './models/db.js';
import { initWebSocketServer } from './websocket/wsServer.js';
import { startServerMonitoring } from './services/serverMonitor.js';
import { renderService } from './services/renderService.js';
import { startBackupScheduler } from './services/backupService.js';

import { botsRouter } from './routes/bots.js';
import { farmsRouter } from './routes/farms.js';
import { serverStatusRouter } from './routes/serverStatus.js';
import { settingsRouter } from './routes/settings.js';
import { activityRouter } from './routes/activity.js';
import { authRouter } from './routes/auth.js';
import { agentRouter } from './routes/agent.js';
import { state } from './models/db.js';
import { calculateDistance } from './services/autoTeleportEngine.js';
import { broadcast } from './websocket/wsServer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend build
app.use(express.static(clientDistPath));

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/bots', botsRouter);
app.use('/api/v1/farms', farmsRouter);
app.use('/api/v1/server', serverStatusRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/agent', agentRouter);

// Fallback to React index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Backward-compatible telemetry endpoint for Go Bot Agent
app.post('/api/v1/telemetry/bot', (req, res) => {
  const { botName, status, x, y, z, dimension, reconnectCount, error } = req.body;
  const bot = state.bots.find(b => b.name.toLowerCase() === (botName || '').toLowerCase());
  if (bot) {
    if (x !== undefined && y !== undefined && z !== undefined) {
      bot.currentCoordinates = { x, y, z };
      const dist = calculateDistance(bot.currentCoordinates, bot.targetCoordinates);
      bot.status = dist > (state.settings.autoTeleport?.distanceThreshold || 10) ? 'misplaced' : (status || 'online');
    }
    if (dimension) bot.dimension = dimension === 1 ? 'Nether' : dimension === 2 ? 'End' : 'Overworld';
    if (reconnectCount !== undefined) bot.reconnectCount = reconnectCount;
    if (error) bot.lastError = error;

    broadcast({ type: 'BOTS_UPDATE', payload: state.bots });
  }
  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Initialize WebSocket server
initWebSocketServer(server);

// Start server
server.listen(config.port, async () => {
  console.log(`====================================================`);
  console.log(`  OUR SMP Control Center - Backend Server Running   `);
  console.log(`  HTTP API: http://localhost:${config.port}`);
  console.log(`  WebSocket: ws://localhost:${config.port}/ws/live  `);
  console.log(`====================================================`);

  await initDb();
  startServerMonitoring();
  renderService.initKeepAlive();
  startBackupScheduler();
  logActivity('SYSTEM_START', `OUR SMP Control Center backend started on port ${config.port}`, 'info', 'Server');
});
