# Architecture Document

## System Overview

**OUR SMP Control Center** is a full-stack server management and bot positioning system designed specifically for Minecraft Bedrock Dedicated Server (BDS) operating over the **NetherNet** transport layer on **AcidoHost**.

### Core Subsystems

1. **Server Poller & Restart Detector (`server/src/services/serverMonitor.js`)**:
   - Queries `http://ayx.acido.dev:19132/v1/join` every 5 seconds.
   - Extracts server metadata (`version`, `protocol`, `level`, `players`, `maxPlayers`).
   - Tracks transition from offline to online.
   - Upon restart detection, triggers the Auto-Teleport engine.

2. **Auto-Teleport Engine (`server/src/services/autoTeleportEngine.js`)**:
   - Maintains farm target coordinates for each registered bot.
   - Calculates 3D Euclidean distance between bot position and target farm coordinates.
   - Automatically executes post-restart teleport commands with configurable delay (default 8s) to allow bots to finish spawn sequence.

3. **Pterodactyl Console Adapter (`server/src/services/pterodactylService.js`)**:
   - Interfaces with AcidoHost Pterodactyl Client API (`POST /api/client/servers/{id}/command`).
   - Executes commands as server root without requiring bots to hold OP privileges.

4. **Web UI (`client/src/`)**:
   - React + Vite application with custom CSS variable design system.
   - Real-time WebSocket synchronization (`/ws/live`).
   - Bot Manager, Farm Chunk Loaders, Console Dispatcher, and Audit Feed.
