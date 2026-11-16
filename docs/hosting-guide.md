# OUR SMP Control Center - Complete Server Hosting Guide

This guide covers all methods to deploy and host **OUR SMP Control Center** on the cloud or your own server so it runs 24/7.

---

## Architecture Summary
The Control Center is packaged as a **single unified service**:
- The Node.js backend serves the REST API (`/api/v1/*`), live WebSockets (`/ws/live`), and the pre-built React frontend (`client/dist`) on a single port (`PORT`, default `5001`).
- You only need to host **one** process/container.

---

## Method 1: Deploying on Render (Recommended & Free Cloud Hosting)

Render provides free hosting with automatic HTTPS certificates and zero server maintenance.

### Step 1: Push Code to GitHub
Create a GitHub repository (e.g. `OUR-SMP-Control-Center`) and push your `Control` folder:
```powershell
cd c:\Users\HP\Downloads\Control
git init
git add .
git commit -m "feat: initial control center deployment"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Open the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository (`OUR-SMP-Control-Center`).
4. Configure the settings:
   - **Name:** `our-smp-control-center`
   - **Region:** Any region near your players (e.g. Frankfurt, Oregon, Singapore)
   - **Branch:** `main`
   - **Root Directory:** *(Leave blank)*
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | (Or Render default) |
   | `JWT_SECRET` | `smp_super_secret_jwt_key_2026` | Any secure random string |
   | `BEDROCK_SERVER_HOST` | `ayx.acido.dev` | BDS server address |
   | `BEDROCK_SERVER_PORT` | `19132` | BDS server port |
   | `BEDROCK_TRANSPORT` | `nethernet` | Network transport |
   | `AUTO_TELEPORT_ENABLED`| `true` | Automated reboot teleport |
   | `AUTO_TELEPORT_DELAY_SEC` | `8` | Wait 8s for bot spawn before tp |
   | `AUTO_TELEPORT_DISTANCE_THRESHOLD` | `10` | Misplaced distance threshold |
   | `RENDER_SERVICE_ID` | `srv-cba31dh5efls73cocdm0` | Your existing Render bot service ID |

6. Click **Create Web Service**.
7. In ~2 minutes, Render will build and provide a public URL like:
   `https://our-smp-control-center.onrender.com`

---

## Method 2: Deploying on a Linux VPS / Dedicated Server (Docker)

If you have a Linux VPS (Ubuntu 22.04 / 24.04, Debian 12, or AlmaLinux):

### Step 1: Install Docker on the Server
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### Step 2: Clone & Launch
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git /opt/control-center
cd /opt/control-center

# Launch container in detached background mode
sudo docker compose up -d --build
```

### Step 3: Verify Running Status
```bash
sudo docker ps
sudo docker logs -f our-smp-control-center
```
The dashboard is now running at `http://<YOUR_SERVER_IP>:5001`.

---

## Method 3: Deploying with PM2 on a Linux VPS

If you prefer running Node.js directly on the host without Docker:

### Step 1: Install Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 2: Clone and Build
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git /opt/control-center
cd /opt/control-center

# Install dependencies and compile frontend
npm run build
```

### Step 3: Start with PM2 (Auto-Restart on Reboot)
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## Setting Up Nginx Reverse Proxy & Free SSL (HTTPS)

To access your Control Center using a custom domain (e.g., `smp.yourdomain.com`) with HTTPS:

### 1. Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx (`/etc/nginx/sites-available/smp.conf`)
```nginx
server {
    server_name smp.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site & Request SSL
```bash
sudo ln -s /etc/nginx/sites-available/smp.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d smp.yourdomain.com
```

---

## Connecting the Control Center with Your Render Bot Service

Once your Control Center is live on Render or your VPS:
1. In your **Render AFK Service Dashboard** (`srv-cba31dh5efls73cocdm0`):
   - Add environment variable `CONTROL_CENTER_URL` = `https://your-control-center-url`
2. In the **Control Center Settings Page**:
   - Set **Render Service Public URL** = `https://afk-bot-service.onrender.com`
   - Enable **10-Minute Keep-Alive Pinger** (keeps your bot container active 24/7).
