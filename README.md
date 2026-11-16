# OUR SMP Control Center

> Production-ready, custom-coded web application and Bot Position Manager for **OUR SMP (CherryVale SMP)** on Minecraft Bedrock Dedicated Server (BDS).
> Features a modern SaaS light-theme interface, responsive sidebar navigation, JWT authentication, real-time WebSocket telemetry, and an automated reboot-teleport engine.

---

## The Problem This Solves

When our Minecraft server (`ayx.acido.dev:19132`) goes down or restarts automatically, Bedrock Dedicated Server often respawns AFK bots back at the **World Spawn point** rather than their assigned farms.

When human players are away, this leaves the iron farms unchunked and unproduced until someone manually logs into the server console to type:
```text
tp IronBot 40 108 -13
tp IronBot2 -239 73 -162
```

**OUR SMP Control Center** eliminates this entirely:
1. **Automated Server Restart Detection**: Live status poller constantly checks `http://ayx.acido.dev:19132/v1/join`.
2. **Auto-Teleport Engine**: When a server reboot is detected, it automatically waits for the bots to complete their handshake (default 8s) and then dispatches console `tp` commands to relocate each bot back to its exact farm coordinates!
3. **1-Click Manual Teleport**: Fast action buttons to teleport individual bots or all bots back to their respective farms simultaneously.
4. **Position Tracking**: Visual indicators immediately alert if a bot is `At Farm` (green) or `Misplaced / At Spawn` (amber alert).
5. **Modern Light-Theme UI**: Crisp dashboard aesthetic with a collapsible sidebar, status badges, real-time activity tables, and light/dark theme toggle.
6. **Authentication & Security**: Protected by bcrypt password hashing, 7-day rolling JWT sessions, security audit logs, and an admin password manager.

---

## System Architecture

```text
+-------------------------------------------------------------+
|             OUR SMP Control Center UI (React + Vite)        |
|  - Modern Light Theme SaaS aesthetic with Sidebar           |
|  - Overview, Bot Manager, Farm Loaders, Console, Security    |
+------------------------------+------------------------------+
                               | REST API + WebSockets (/ws/live)
                               v
+-------------------------------------------------------------+
|             Control Center Backend (Node.js + Express)      |
|  - JWT Auth Guard & Security Auditor                        |
|  - Auto-Teleport Restart Engine (8s post-reboot delay)       |
|  - Dual Storage: MongoDB Atlas or zero-config in-memory     |
+---------------+------------------------------+--------------+
                |                              |
                v                              v
+--------------------------------+  +--------------------------------+
| Direct BDS Handshake Poller    |  | AcidoHost Pterodactyl API      |
| GET ayx.acido.dev:19132/v1/join|  | POST /api/client/servers/      |
| (NetherNet WebRTC Protocol)    |  |      {serverId}/command        |
+--------------------------------+  +--------------------------------+
```

---

## Key Features & Dashboard Views

| View | Purpose |
| :--- | :--- |
| **Overview** | High-level server metrics (players, version, latency, uptime, restarts) + bot cards + farm cards + live activity table. |
| **Bot Manager** | Dedicated position manager for `IronBot`, `IronBot2`, and future bots. Shows 3D coordinates, distance from farm, and 1-click teleport buttons. |
| **Farm Loaders** | Manage chunk loader coordinates (`Iron Farm 1`, `Iron Farm 2`), assign bots, and add custom farms (gold, raid, creeper). |
| **Server Console** | Live interactive console for executing BDS commands (`tp`, `list`, `say`, `weather clear`, `time set day`) via Pterodactyl API. |
| **Audit & Activity** | Live event stream tracking bot connects, restarts, security events, and automated teleport dispatches. |
| **Settings** | Configure AcidoHost Pterodactyl API credentials, auto-teleport timings (delay seconds, distance thresholds), and server targets. |
| **Security & Auth** | Manage administrator credentials, change password, inspect active JWT sessions, and audit login attempts. |

---

## Hosting on Render (1-Click Deployment)

The project is structured to deploy to **Render** as a single, unified Web Service that serves both the Node.js backend and the built React frontend on a single port.

### Option 1: Deploy with `render.yaml` (Recommended)
1. Push this repository to your GitHub account (or a private repo).
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your repository. Render will automatically detect `render.yaml`.
5. Enter any custom environment variables (or leave defaults) and click **Apply**.

### Option 2: Manual Web Service Setup on Render
1. Go to [Render Dashboard](https://dashboard.render.com) -> **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name:** `our-smp-control-center`
   - **Environment:** `Node`
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A random secure string)*
   - `BEDROCK_SERVER_HOST`: `ayx.acido.dev`
   - `BEDROCK_SERVER_PORT`: `19132`
   - `BEDROCK_TRANSPORT`: `nethernet`
   - `AUTO_TELEPORT_ENABLED`: `true`
   - `AUTO_TELEPORT_DELAY_SEC`: `8`
   - `AUTO_TELEPORT_DISTANCE_THRESHOLD`: `10`
   - *(Optional)* `ACIDOHOST_PANEL_URL`: `https://panel.acido.dev`
   - *(Optional)* `ACIDOHOST_SERVER_ID`: `<your-8-char-server-id>`
   - *(Optional)* `ACIDOHOST_API_KEY`: `ptlc_...`
5. Click **Create Web Service**.
6. Once deployed, Render will provide a public HTTPS URL (e.g., `https://our-smp-control-center.onrender.com`).

---

## Authentication & Default Credentials

When first opening the control center, you will be prompted to sign in:

- **Default Username:** `admin`
- **Default Password:** `smpadmin2026`

*To change this password at any time, navigate to **Security & Auth** in the sidebar, enter your current password, and set your new password.*

---

## Local Development Quick Start

### 1. Install Dependencies
```powershell
npm run install:all
```

### 2. Run Local Development Server
```powershell
npm run dev
```

- **Frontend (Vite Dev):** [http://localhost:3000](http://localhost:3000)
- **Unified Backend & Production Client:** [http://localhost:5001](http://localhost:5001)

### 3. Build Production Bundle
```powershell
npm run build
```

---

## AcidoHost Pterodactyl API Integration

To enable fully automated console command execution when BDS restarts:
1. Log into your **AcidoHost Pterodactyl Panel**.
2. Click your avatar (top right) -> **Account** -> **API Credentials**.
3. Create a new Client API Key (starts with `ptlc_`).
4. In **OUR SMP Control Center**, click **Settings** in the sidebar.
5. Fill in:
   - **Panel URL:** `https://panel.acido.dev` (or your host's panel URL)
   - **Server Identifier:** The 8-character ID from your panel URL (e.g. `5d956acc`)
   - **Client API Key:** Your `ptlc_...` token
6. Click **Test Panel Connection** and **Save Settings**.
7. All subsequent BDS restarts will automatically dispatch `tp IronBot 40 108 -13` directly into the live server console!
