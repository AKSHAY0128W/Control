import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'our-smp-super-secret-jwt-key-2026',
  botAgentSecret: process.env.BOT_AGENT_SECRET || 'our-smp-bot-agent-secret-token',
  
  // Bedrock Server connection details
  bedrock: {
    host: process.env.BEDROCK_SERVER_HOST || 'ayx.acido.dev',
    port: parseInt(process.env.BEDROCK_SERVER_PORT || '19132', 10),
    transport: process.env.BEDROCK_TRANSPORT || 'nethernet',
    pollIntervalMs: parseInt(process.env.SERVER_POLL_INTERVAL_MS || '5000', 10),
  },

  // AcidoHost / Pterodactyl Panel integration
  pterodactyl: {
    panelUrl: (process.env.ACIDOHOST_PANEL_URL || '').replace(/\/$/, ''),
    apiKey: process.env.ACIDOHOST_API_KEY || '',
    serverId: process.env.ACIDOHOST_SERVER_ID || '',
  },

  // Auto-Teleport Settings
  autoTeleport: {
    enabled: process.env.AUTO_TELEPORT_ENABLED !== 'false',
    delaySeconds: parseInt(process.env.AUTO_TELEPORT_DELAY_SEC || '8', 10),
    distanceThreshold: parseFloat(process.env.AUTO_TELEPORT_DISTANCE_THRESHOLD || '10'),
  },

  // Discord Notifications
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  }
};
