import { state, logActivity } from '../models/db.js';

export async function sendConsoleCommand(command) {
  const { panelUrl, apiKey, serverId } = state.settings.pterodactyl;

  if (!panelUrl || !apiKey || !serverId) {
    const errorMsg = 'Pterodactyl integration is not fully configured (missing Panel URL, API Key, or Server ID).';
    logActivity('COMMAND_FAILED', `Failed to send "${command}": ${errorMsg}`, 'warning', 'Pterodactyl');
    return {
      success: false,
      error: errorMsg,
      fallbackCommand: command
    };
  }

  const endpoint = `${panelUrl}/api/client/servers/${serverId}/command`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ command })
    });

    if (res.status === 204 || res.ok) {
      logActivity('COMMAND_EXECUTED', `Console executed: "${command}"`, 'success', 'Pterodactyl');
      return { success: true, command };
    } else {
      const errText = await res.text();
      const errorMsg = `Pterodactyl API returned HTTP ${res.status}: ${errText}`;
      logActivity('COMMAND_FAILED', `Failed command "${command}": ${errorMsg}`, 'error', 'Pterodactyl');
      return { success: false, error: errorMsg, fallbackCommand: command };
    }
  } catch (err) {
    const errorMsg = `Network error reaching Pterodactyl panel: ${err.message}`;
    logActivity('COMMAND_ERROR', `Error executing "${command}": ${errorMsg}`, 'error', 'Pterodactyl');
    return { success: false, error: errorMsg, fallbackCommand: command };
  }
}

export async function teleportBot(botUsername, x, y, z) {
  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const roundedZ = Math.round(z);
  const command = `tp ${botUsername} ${roundedX} ${roundedY} ${roundedZ}`;
  
  console.log(`[Pterodactyl] Teleporting ${botUsername} to (${roundedX}, ${roundedY}, ${roundedZ}) via console command: ${command}`);
  return await sendConsoleCommand(command);
}

export async function fetchServerResources() {
  const { panelUrl, apiKey, serverId } = state.settings.pterodactyl;

  if (!panelUrl || !apiKey || !serverId) {
    return { connected: false, reason: 'Credentials not configured' };
  }

  try {
    const res = await fetch(`${panelUrl}/api/client/servers/${serverId}/resources`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return { connected: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const stats = data.attributes?.resources || {};
    
    // Update live metrics
    state.serverMetrics.cpuUsage = stats.cpu_absolute ? stats.cpu_absolute.toFixed(1) : null;
    state.serverMetrics.ramUsage = stats.memory_bytes ? (stats.memory_bytes / (1024 * 1024)).toFixed(0) : null;
    state.serverMetrics.diskUsage = stats.disk_bytes ? (stats.disk_bytes / (1024 * 1024)).toFixed(0) : null;

    return {
      connected: true,
      resources: stats
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}
