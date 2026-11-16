import { state, logActivity } from '../models/db.js';
import { teleportBot } from './pterodactylService.js';
import { broadcast } from '../websocket/wsServer.js';

let restartTimeout = null;

export function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  const dx = (p1.x || 0) - (p2.x || 0);
  const dy = (p1.y || 0) - (p2.y || 0);
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function triggerAutoTeleportOnRestart() {
  if (!state.settings.autoTeleport.enabled) {
    logActivity(
      'AUTO_TP_SKIPPED',
      'Server restarted, but Auto-Teleport is currently disabled in settings.',
      'info',
      'AutoTeleportEngine'
    );
    return;
  }

  const delaySec = state.settings.autoTeleport.delaySeconds || 8;
  logActivity(
    'AUTO_TP_SCHEDULED',
    `Server restart detected. Scheduling auto-teleport for all farm bots in ${delaySec} seconds (waiting for bot spawn)...`,
    'warning',
    'AutoTeleportEngine'
  );

  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }

  restartTimeout = setTimeout(async () => {
    console.log('[AutoTeleportEngine] Executing scheduled post-restart bot teleportation...');
    
    for (const bot of state.bots) {
      if (!bot.autoTeleport) {
        console.log(`[AutoTeleportEngine] Skipping ${bot.name} (autoTeleport disabled for this bot).`);
        continue;
      }

      const { x, y, z } = bot.targetCoordinates;
      const farmName = bot.assignedFarm || 'assigned coordinates';

      logActivity(
        'AUTO_TP_TRIGGERED',
        `Auto-teleporting ${bot.name} to ${farmName} (${x}, ${y}, ${z})...`,
        'info',
        'AutoTeleportEngine'
      );

      const result = await teleportBot(bot.username, x, y, z);
      
      // Update bot current coordinates
      bot.currentCoordinates = { ...bot.targetCoordinates };
      bot.status = 'online';

      if (result.success) {
        logActivity(
          'AUTO_TP_SUCCESS',
          `Successfully teleported ${bot.name} to ${farmName} (${x}, ${y}, ${z}) via server console!`,
          'success',
          'AutoTeleportEngine'
        );
      } else {
        logActivity(
          'AUTO_TP_FALLBACK',
          `Automated console teleport command ready: "${result.fallbackCommand}". Configure AcidoHost Pterodactyl API key to auto-execute without manual input.`,
          'warning',
          'AutoTeleportEngine'
        );
      }
    }

    broadcast({
      type: 'BOTS_UPDATE',
      payload: state.bots
    });

  }, delaySec * 1000);
}

export async function executeManualTeleport(botId, customCoords = null) {
  const bot = state.bots.find(b => b.id === botId);
  if (!bot) {
    return { success: false, error: 'Bot not found' };
  }

  const target = customCoords || bot.targetCoordinates;
  const result = await teleportBot(bot.username, target.x, target.y, target.z);

  // Update current coordinates
  bot.currentCoordinates = { ...target };
  
  logActivity(
    'MANUAL_TP',
    `Manual teleport requested for ${bot.name} to (${target.x}, ${target.y}, ${target.z})`,
    result.success ? 'success' : 'warning',
    'ControlCenter'
  );

  broadcast({
    type: 'BOTS_UPDATE',
    payload: state.bots
  });

  return result;
}
