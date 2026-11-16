import { config } from '../config/config.js';
import { state, logActivity } from '../models/db.js';
import { broadcast } from '../websocket/wsServer.js';
import { triggerAutoTeleportOnRestart } from './autoTeleportEngine.js';

let isPolling = false;
let previousOnlineStatus = null;

export async function pollBedrockServer() {
  const url = `http://${config.bedrock.host}:${config.bedrock.port}/v1/join`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'libhttpclient/1.0.0.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json();
      
      const wasOffline = previousOnlineStatus === false;
      previousOnlineStatus = true;

      state.serverMetrics = {
        ...state.serverMetrics,
        online: true,
        motd: data.name || 'OUR SMP',
        version: data.version || '1.26.61',
        protocol: data.protocol || 2225,
        worldName: data.level || 'CherryVale SMP',
        playerCount: data.players ?? 0,
        maxPlayers: data.maxPlayers ?? 10,
        gameType: data.gameType ?? 0,
        latencyMs,
        lastCheck: new Date().toISOString()
      };

      if (wasOffline) {
        state.serverMetrics.restartCount += 1;
        state.serverMetrics.lastRestart = new Date().toISOString();

        logActivity(
          'SERVER_RESTARTED',
          `BDS server restarted and came back online! (Version: ${data.version}, World: ${data.level})`,
          'warning',
          'ServerMonitor'
        );

        // Notify auto-teleport engine that the server just restarted
        triggerAutoTeleportOnRestart();
      }

      // Sync bot status when players are active on BDS
      if (data.players >= 2) {
        let changed = false;
        state.bots.forEach(bot => {
          if (bot.status === 'offline') {
            bot.status = 'misplaced';
            changed = true;
          }
        });
        if (changed) {
          broadcast({
            type: 'BOTS_UPDATE',
            payload: state.bots
          });
        }
      }

      broadcast({
        type: 'SERVER_METRICS_UPDATE',
        payload: state.serverMetrics
      });

    } else {
      handleOfflineState(`HTTP status ${res.status}`);
    }

  } catch (err) {
    handleOfflineState(err.name === 'AbortError' ? 'Ping timeout (>6s)' : err.message);
  }
}

function handleOfflineState(reason) {
  const wasOnline = previousOnlineStatus === true;
  previousOnlineStatus = false;

  state.serverMetrics = {
    ...state.serverMetrics,
    online: false,
    latencyMs: 0,
    lastCheck: new Date().toISOString()
  };

  if (wasOnline) {
    logActivity(
      'SERVER_OFFLINE',
      `BDS server is unreachable: ${reason}. Awaiting automatic restart...`,
      'error',
      'ServerMonitor'
    );
  }

  broadcast({
    type: 'SERVER_METRICS_UPDATE',
    payload: state.serverMetrics
  });
}

export function startServerMonitoring() {
  if (isPolling) return;
  isPolling = true;

  console.log(`[ServerMonitor] Starting Bedrock BDS status monitor on http://${config.bedrock.host}:${config.bedrock.port}/v1/join (every ${config.bedrock.pollIntervalMs}ms)`);
  
  // Initial check
  pollBedrockServer();

  // Periodic polling
  setInterval(pollBedrockServer, config.bedrock.pollIntervalMs);
}
