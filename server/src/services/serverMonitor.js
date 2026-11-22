import { config } from '../config/config.js';
import { state, logActivity } from '../models/db.js';
import { broadcast } from '../websocket/wsServer.js';
import { triggerAutoTeleportOnRestart } from './autoTeleportEngine.js';

let isPolling = false;
let previousOnlineStatus = null;
let onlineSince = null;

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return 'Just started';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export async function pollBedrockServer() {
  const host = state.settings?.bedrock?.host || config.bedrock.host;
  const port = state.settings?.bedrock?.port || config.bedrock.port;
  const url = `http://${host}:${port}/v1/join`;
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

      if (!onlineSince || wasOffline) {
        onlineSince = Date.now();
      }
      const uptimeSeconds = Math.max(1, Math.floor((Date.now() - onlineSince) / 1000));

      state.serverMetrics = {
        ...state.serverMetrics,
        online: true,
        serverAddress: `${host}:${port}`,
        uptimeSeconds,
        uptime: formatUptime(uptimeSeconds),
        motd: data.name || 'OUR SMP',
        version: data.version || '1.26.61',
        protocol: data.protocol || 2225,
        worldName: data.level || state.settings?.bedrock?.worldName || 'CherryVale SMP',
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
  const host = state.settings?.bedrock?.host || config.bedrock.host;
  const port = state.settings?.bedrock?.port || config.bedrock.port;
  const wasOnline = previousOnlineStatus === true;
  previousOnlineStatus = false;
  onlineSince = null;

  state.serverMetrics = {
    ...state.serverMetrics,
    online: false,
    serverAddress: `${host}:${port}`,
    uptimeSeconds: 0,
    uptime: 'Offline',
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

// Test connectivity to any specified BDS host/port
export async function testBedrockTarget(targetHost, targetPort) {
  const host = targetHost || state.settings?.bedrock?.host || config.bedrock.host;
  const port = targetPort || state.settings?.bedrock?.port || config.bedrock.port;
  const url = `http://${host}:${port}/v1/join`;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

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
      return {
        success: true,
        host,
        port,
        latencyMs,
        data: {
          name: data.name || 'OUR SMP',
          version: data.version || '1.26.61',
          level: data.level || 'CherryVale SMP',
          players: data.players ?? 0,
          maxPlayers: data.maxPlayers ?? 10
        }
      };
    } else {
      return {
        success: false,
        host,
        port,
        error: `HTTP ${res.status} ${res.statusText}`
      };
    }
  } catch (err) {
    return {
      success: false,
      host,
      port,
      error: err.name === 'AbortError' ? 'Ping timeout (>5s)' : err.message
    };
  }
}

export function startServerMonitoring() {
  if (isPolling) return;
  isPolling = true;

  const host = state.settings?.bedrock?.host || config.bedrock.host;
  const port = state.settings?.bedrock?.port || config.bedrock.port;
  console.log(`[ServerMonitor] Starting Bedrock BDS status monitor on http://${host}:${port}/v1/join (every ${config.bedrock.pollIntervalMs}ms)`);
  
  // Initial check
  pollBedrockServer();

  // Periodic polling
  setInterval(pollBedrockServer, config.bedrock.pollIntervalMs);
}
