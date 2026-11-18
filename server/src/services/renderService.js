import { state, logActivity } from '../models/db.js';
import { broadcast } from '../websocket/wsServer.js';

let keepAliveInterval = null;

export const renderService = {
  getConfig() {
    return {
      serviceUrl: (state.settings?.render?.serviceUrl || process.env.RENDER_BOT_SERVICE_URL || 'https://afk-nqeu.onrender.com').replace(/\/$/, ''),
      serviceId: state.settings?.render?.serviceId || process.env.RENDER_BOT_SERVICE_ID || 'srv-cba31dh5efls73cocdm0',
      apiKey: state.settings?.render?.apiKey || process.env.RENDER_API_KEY || '',
      keepAlive: state.settings?.render?.keepAlive !== false,
      lastPing: state.settings?.render?.lastPing || null,
      lastPingStatus: state.settings?.render?.lastPingStatus || 'idle'
    };
  },

  // Notify the running Render bot service about changes in the bot list
  async notifyRenderService(customBots = null) {
    const config = this.getConfig();
    const botsList = customBots || state.bots;
    // Filter active/enabled bots
    const enabledBots = botsList.filter(b => b.enabled !== false).map(b => b.name || b.username);
    const botNamesString = enabledBots.join(',');

    const results = {
      directSync: null,
      envVarSync: null
    };

    // 1. Direct HTTP Sync to running container
    if (config.serviceUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${config.serviceUrl}/api/bots/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bots: enabledBots,
            targetFarms: botsList.map(b => ({
              name: b.name,
              x: b.targetCoordinates?.x,
              y: b.targetCoordinates?.y,
              z: b.targetCoordinates?.z
            }))
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          results.directSync = { success: true, data };
          logActivity('RENDER_BOTS_SYNCED', `Synchronized ${enabledBots.length} bots to live Render service: ${botNamesString}`, 'success', 'RenderSync');
        } else {
          results.directSync = { success: false, status: res.status, statusText: res.statusText };
        }
      } catch (err) {
        results.directSync = { success: false, error: err.message };
        // Container might be asleep or spinning up
        logActivity('RENDER_SYNC_WAITING', `Direct sync to Render service (${config.serviceUrl}) timed out. Instance may be spinning up.`, 'info', 'RenderSync');
      }
    }

    // 2. Render PaaS API sync (Update BOT_NAME env var on Render dashboard)
    if (config.apiKey && config.serviceId) {
      try {
        const res = await fetch(`https://api.render.com/v1/services/${config.serviceId}/env-vars`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            { key: 'BOT_NAME', value: botNamesString }
          ])
        });

        if (res.ok) {
          results.envVarSync = { success: true };
          logActivity('RENDER_ENV_UPDATED', `Updated Render BOT_NAME env variable to: "${botNamesString}"`, 'success', 'RenderSync');
        } else {
          const errData = await res.json().catch(() => ({}));
          results.envVarSync = { success: false, error: errData.message || res.statusText };
        }
      } catch (err) {
        results.envVarSync = { success: false, error: err.message };
      }
    }

    return results;
  },

  // Keep-Alive Pinger to prevent Render's free tier from sleeping after 15m inactivity
  async pingRenderService() {
    const config = this.getConfig();
    if (!config.serviceUrl) return { success: false, error: 'No Render Service URL configured' };

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${config.serviceUrl}/`, { signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Date.now() - startTime;

      if (state.settings.render) {
        state.settings.render.lastPing = new Date().toISOString();
        state.settings.render.lastPingStatus = res.ok ? 'awake' : 'error';
        state.settings.render.lastLatencyMs = latencyMs;
      }

      broadcast({ type: 'RENDER_STATUS_UPDATE', payload: { status: 'awake', latencyMs } });

      return {
        success: res.ok,
        status: res.status,
        latencyMs,
        message: 'Render bot service is awake and responding'
      };
    } catch (err) {
      if (state.settings.render) {
        state.settings.render.lastPing = new Date().toISOString();
        state.settings.render.lastPingStatus = 'sleeping';
      }
      return {
        success: false,
        error: `Render bot service unreachable (${err.message}). May be spinning up from cold sleep.`
      };
    }
  },

  // Trigger manual deployment / restart on Render via API
  async triggerRenderDeploy() {
    const config = this.getConfig();
    if (!config.apiKey || !config.serviceId) {
      return {
        success: false,
        error: 'Render API Key and Service ID are required to trigger deployments.'
      };
    }

    try {
      const res = await fetch(`https://api.render.com/v1/services/${config.serviceId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clearCache: 'do_not_clear' })
      });

      const data = await res.json();
      if (res.ok) {
        logActivity('RENDER_DEPLOY_TRIGGERED', `Triggered Render deployment for service ${config.serviceId}`, 'info', 'RenderSync');
        return { success: true, deploy: data };
      } else {
        return { success: false, error: data.message || res.statusText };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Initialize automated 10-minute keep-alive timer
  initKeepAlive() {
    if (keepAliveInterval) clearInterval(keepAliveInterval);

    // Initial ping after 3 seconds
    setTimeout(() => {
      if (this.getConfig().serviceUrl && this.getConfig().keepAlive) {
        this.pingRenderService().catch(() => {});
      }
    }, 3000);

    // Recurring ping every 10 minutes (600,000 ms) to beat Render's 15-minute sleep timer
    keepAliveInterval = setInterval(() => {
      const config = this.getConfig();
      if (config.serviceUrl && config.keepAlive) {
        this.pingRenderService().then(res => {
          if (res.success) {
            logActivity('KEEP_ALIVE_PING', `Render keep-alive ping succeeded (${res.latencyMs}ms). 15-min idle sleep prevented.`, 'info', 'RenderKeepAlive');
          }
        }).catch(() => {});
      }
    }, 10 * 60 * 1000);
  }
};
