module.exports = {
  apps: [
    {
      name: 'our-smp-control-center',
      script: 'server/src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        BEDROCK_SERVER_HOST: 'ayx.acido.dev',
        BEDROCK_SERVER_PORT: 19132,
        BEDROCK_TRANSPORT: 'nethernet',
        AUTO_TELEPORT_ENABLED: 'true',
        AUTO_TELEPORT_DELAY_SEC: '8',
        AUTO_TELEPORT_DISTANCE_THRESHOLD: '10'
      }
    }
  ]
};
