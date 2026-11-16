# REST API Reference

All routes are versioned under `/api/v1`.

### Server
- `GET /api/v1/server/status` - Returns live server status.
- `POST /api/v1/server/poll` - Triggers an immediate server re-check.

### Bots
- `GET /api/v1/bots` - List all registered bots.
- `POST /api/v1/bots` - Register a new bot.
- `PATCH /api/v1/bots/:id` - Update target coordinates, assigned farm, or auto-teleport toggle.
- `POST /api/v1/bots/:id/teleport` - Execute manual teleport (farm coords or custom coords).
- `DELETE /api/v1/bots/:id` - Remove bot from manager.

### Farms
- `GET /api/v1/farms` - List all farms.
- `POST /api/v1/farms` - Create new farm.
- `PATCH /api/v1/farms/:id` - Update farm coordinates or assigned bot.

### Settings & Console
- `GET /api/v1/settings` - Retrieve settings.
- `POST /api/v1/settings` - Save Pterodactyl & Auto-Teleport configuration.
- `POST /api/v1/settings/test-pterodactyl` - Test Pterodactyl connection.
- `POST /api/v1/settings/command` - Dispatch raw console command.

### Activity
- `GET /api/v1/activity` - Fetch recent audit events.
