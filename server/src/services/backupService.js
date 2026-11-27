import cron from 'node-cron';
import { state, logActivity, saveStateToFile } from '../models/db.js';
import { broadcast } from '../websocket/wsServer.js';

// ─── Pterodactyl Backup API Calls ────────────────────────────────────────────

/**
 * Create a new backup on Pterodactyl for the configured server.
 * Returns { success, backupUuid, name, error }
 */
async function createPterodactylBackup(label) {
  const { panelUrl, apiKey, serverId } = state.settings.pterodactyl || {};

  if (!panelUrl || !apiKey || !serverId) {
    return { success: false, error: 'Pterodactyl not configured (missing URL, API key, or server ID).' };
  }

  const endpoint = `${panelUrl}/api/client/servers/${serverId}/backups`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name: label || `Auto-Backup ${new Date().toISOString().slice(0, 10)}` })
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.attributes?.uuid) {
      return {
        success: true,
        backupUuid: data.attributes.uuid,
        name: data.attributes.name,
        createdAt: data.attributes.created_at || new Date().toISOString(),
        size: data.attributes.bytes || 0
      };
    }

    const errMsg = data?.errors?.[0]?.detail || data?.message || `HTTP ${res.status}`;
    return { success: false, error: errMsg };
  } catch (err) {
    return { success: false, error: `Network error: ${err.message}` };
  }
}

/**
 * List all backups on Pterodactyl for the configured server.
 * Returns array of { uuid, name, createdAt, size }
 */
async function listPterodactylBackups() {
  const { panelUrl, apiKey, serverId } = state.settings.pterodactyl || {};
  if (!panelUrl || !apiKey || !serverId) return [];

  const endpoint = `${panelUrl}/api/client/servers/${serverId}/backups`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data?.data)) return [];

    return data.data
      .filter(b => b?.attributes)
      .map(b => ({
        uuid: b.attributes.uuid,
        name: b.attributes.name,
        createdAt: b.attributes.created_at,
        completedAt: b.attributes.completed_at,
        size: b.attributes.bytes || 0,
        successful: b.attributes.is_successful
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first
  } catch {
    return [];
  }
}

/**
 * Delete a Pterodactyl backup by UUID.
 */
async function deletePterodactylBackup(uuid) {
  const { panelUrl, apiKey, serverId } = state.settings.pterodactyl || {};
  if (!panelUrl || !apiKey || !serverId || !uuid) return false;

  const endpoint = `${panelUrl}/api/client/servers/${serverId}/backups/${uuid}`;
  try {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });
    return res.status === 204 || res.ok;
  } catch {
    return false;
  }
}

// ─── Core Backup Job ─────────────────────────────────────────────────────────

export async function runBackupJob(manual = false) {
  const cfg = state.settings.backup || {};
  const maxKeep = cfg.keepDays || 10;
  const label = `${manual ? 'Manual' : 'Auto'}-Backup ${new Date().toISOString().slice(0, 10)}`;

  console.log(`[BackupService] Starting ${manual ? 'manual' : 'scheduled'} backup: "${label}"`);

  // 1. Create new backup
  const result = await createPterodactylBackup(label);

  if (!result.success) {
    console.error(`[BackupService] Backup FAILED: ${result.error}`);
    logActivity(
      'BACKUP_FAILED',
      `${manual ? 'Manual' : 'Scheduled'} backup failed: ${result.error}`,
      'error',
      'BackupService'
    );
    // Update state
    if (!state.settings.backup) state.settings.backup = {};
    state.settings.backup.lastBackupStatus = 'failed';
    state.settings.backup.lastBackupError = result.error;
    state.settings.backup.lastAttemptAt = new Date().toISOString();
    saveStateToFile();
    broadcast({ type: 'BACKUP_STATUS', payload: state.settings.backup });
    return { success: false, error: result.error };
  }

  console.log(`[BackupService] Backup created: ${result.name} (${result.backupUuid})`);

  // 2. Update last backup info in state
  if (!state.settings.backup) state.settings.backup = {};
  state.settings.backup.lastBackupAt = new Date().toISOString();
  state.settings.backup.lastBackupName = result.name;
  state.settings.backup.lastBackupUuid = result.backupUuid;
  state.settings.backup.lastBackupStatus = 'success';
  state.settings.backup.lastBackupError = null;
  state.settings.backup.lastAttemptAt = new Date().toISOString();

  logActivity(
    'BACKUP_SUCCESS',
    `${manual ? 'Manual' : 'Scheduled daily'} backup created: "${result.name}"`,
    'success',
    'BackupService'
  );

  // 3. Prune old backups — keep only the newest `maxKeep` auto-backups
  try {
    const allBackups = await listPterodactylBackups();
    // Filter to auto-backup entries (name starts with "Auto-Backup")
    const autoBackups = allBackups.filter(b => b.name && b.name.startsWith('Auto-Backup'));
    const excess = autoBackups.length - maxKeep; // e.g. 11 - 10 = 1 to delete

    if (excess > 0) {
      const toDelete = autoBackups.slice(0, excess); // oldest first → slice from start
      for (const old of toDelete) {
        const deleted = await deletePterodactylBackup(old.uuid);
        if (deleted) {
          console.log(`[BackupService] Deleted old backup: ${old.name} (${old.uuid})`);
          logActivity(
            'BACKUP_PRUNED',
            `Old backup deleted to enforce ${maxKeep}-day retention: "${old.name}"`,
            'info',
            'BackupService'
          );
        }
      }
    }
  } catch (pruneErr) {
    console.warn(`[BackupService] Prune step error: ${pruneErr.message}`);
  }

  saveStateToFile();
  broadcast({ type: 'BACKUP_STATUS', payload: state.settings.backup });

  return { success: true, name: result.name, uuid: result.backupUuid };
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

let scheduledJob = null;

/**
 * Start or restart the backup cron. Called on server start and when settings change.
 * backupTime = "HH:MM" in IST (UTC+5:30). We convert to UTC for cron.
 */
export function startBackupScheduler() {
  const cfg = state.settings.backup || {};

  // Stop existing job
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
  }

  if (cfg.enabled === false) {
    console.log('[BackupService] Automatic backup is disabled — scheduler not started.');
    return;
  }

  // Default: 7:00 AM IST = 1:30 AM UTC
  const timeStr = cfg.time || '07:00';
  const [hStr, mStr] = timeStr.split(':');
  const localHour = parseInt(hStr, 10) || 7;
  const localMin = parseInt(mStr, 10) || 0;

  // Convert IST (UTC+5:30) → UTC  (subtract 5h30m)
  const totalLocalMin = localHour * 60 + localMin;
  const totalUtcMin = ((totalLocalMin - 330) + 1440) % 1440; // +1440 to keep positive
  const utcHour = Math.floor(totalUtcMin / 60);
  const utcMin = totalUtcMin % 60;

  const cronExpr = `${utcMin} ${utcHour} * * *`;
  console.log(`[BackupService] Scheduling daily backup at ${timeStr} IST → cron UTC: "${cronExpr}"`);

  scheduledJob = cron.schedule(cronExpr, () => {
    console.log('[BackupService] Cron triggered — running scheduled backup...');
    runBackupJob(false).catch(err => console.error('[BackupService] Cron job error:', err.message));
  }, { timezone: 'UTC' });

  console.log('[BackupService] Backup scheduler active.');
}
