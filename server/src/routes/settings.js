import express from 'express';
import { state, logActivity, saveStateToFile } from '../models/db.js';
import { sendConsoleCommand, fetchServerResources } from '../services/pterodactylService.js';
import { renderService } from '../services/renderService.js';
import { broadcast } from '../websocket/wsServer.js';

export const settingsRouter = express.Router();

// GET current settings
settingsRouter.get('/', (req, res) => {
  const settingsCopy = JSON.parse(JSON.stringify(state.settings || {}));

  // Mask Pterodactyl key
  if (settingsCopy.pterodactyl?.apiKey) {
    const key = settingsCopy.pterodactyl.apiKey;
    settingsCopy.pterodactyl.isConfigured = true;
    settingsCopy.pterodactyl.apiKeyMasked = key.length > 8 ? `${key.substring(0, 5)}...${key.substring(key.length - 3)}` : '******';
    delete settingsCopy.pterodactyl.apiKey;
  } else {
    if (!settingsCopy.pterodactyl) settingsCopy.pterodactyl = {};
    settingsCopy.pterodactyl.isConfigured = false;
  }

  // Mask Render API Key & provide render info
  if (!settingsCopy.render) {
    settingsCopy.render = {
      serviceUrl: process.env.RENDER_BOT_SERVICE_URL || 'https://afk-nqeu.onrender.com',
      serviceId: process.env.RENDER_BOT_SERVICE_ID || 'srv-cba31dh5efls73cocdm0',
      keepAlive: true
    };
  }
  if (settingsCopy.render?.apiKey) {
    const key = settingsCopy.render.apiKey;
    settingsCopy.render.isConfigured = true;
    settingsCopy.render.apiKeyMasked = key.length > 8 ? `${key.substring(0, 5)}...${key.substring(key.length - 3)}` : '******';
    delete settingsCopy.render.apiKey;
  } else {
    settingsCopy.render.isConfigured = false;
  }

  res.json({ success: true, data: settingsCopy });
});

// POST update settings
settingsRouter.post('/', (req, res) => {
  const { pterodactyl, autoTeleport, render } = req.body;

  if (pterodactyl) {
    if (!state.settings.pterodactyl) state.settings.pterodactyl = {};
    if (pterodactyl.panelUrl !== undefined) state.settings.pterodactyl.panelUrl = pterodactyl.panelUrl.replace(/\/$/, '');
    if (pterodactyl.apiKey) state.settings.pterodactyl.apiKey = pterodactyl.apiKey;
    if (pterodactyl.serverId !== undefined) state.settings.pterodactyl.serverId = pterodactyl.serverId;
  }

  if (autoTeleport) {
    if (!state.settings.autoTeleport) state.settings.autoTeleport = {};
    if (autoTeleport.enabled !== undefined) state.settings.autoTeleport.enabled = Boolean(autoTeleport.enabled);
    if (autoTeleport.delaySeconds !== undefined) state.settings.autoTeleport.delaySeconds = Number(autoTeleport.delaySeconds);
    if (autoTeleport.distanceThreshold !== undefined) state.settings.autoTeleport.distanceThreshold = Number(autoTeleport.distanceThreshold);
  }

  if (render) {
    if (!state.settings.render) state.settings.render = {};
    if (render.serviceUrl !== undefined) state.settings.render.serviceUrl = render.serviceUrl.replace(/\/$/, '');
    if (render.serviceId !== undefined) state.settings.render.serviceId = render.serviceId;
    if (render.apiKey) state.settings.render.apiKey = render.apiKey;
    if (render.keepAlive !== undefined) state.settings.render.keepAlive = Boolean(render.keepAlive);
  }

  saveStateToFile();
  logActivity('SETTINGS_UPDATED', 'Control Center settings were updated.', 'info', 'Settings');
  broadcast({ type: 'SETTINGS_UPDATE', payload: state.settings });

  // If render was updated, trigger a ping / test
  if (render?.serviceUrl) {
    renderService.pingRenderService().catch(() => {});
  }

  res.json({ success: true, message: 'Settings saved successfully' });
});

// POST test Pterodactyl connection
settingsRouter.post('/test-pterodactyl', async (req, res) => {
  const result = await fetchServerResources();
  res.json({ success: result.connected, details: result });
});

// POST test Render service connection
settingsRouter.post('/test-render', async (req, res) => {
  const result = await renderService.pingRenderService();
  res.json(result);
});

// POST execute raw console command (Admin control)
settingsRouter.post('/command', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ success: false, error: 'Command string is required' });
  }

  const result = await sendConsoleCommand(command);
  res.json(result);
});
