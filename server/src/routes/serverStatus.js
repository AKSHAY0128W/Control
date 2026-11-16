import express from 'express';
import { state } from '../models/db.js';
import { pollBedrockServer } from '../services/serverMonitor.js';
import { fetchServerResources } from '../services/pterodactylService.js';

export const serverStatusRouter = express.Router();

// GET live server status
serverStatusRouter.get('/status', (req, res) => {
  res.json({ success: true, data: state.serverMetrics });
});

// POST trigger an immediate status re-check
serverStatusRouter.post('/poll', async (req, res) => {
  await pollBedrockServer();
  await fetchServerResources();
  res.json({ success: true, data: state.serverMetrics });
});
