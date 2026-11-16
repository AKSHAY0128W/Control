# =========================================================================
# OUR SMP Control Center - Production Dockerfile
# Builds React frontend and serves via unified Node.js Express + WebSockets
# =========================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server application source
COPY server/ ./server/

# Copy compiled frontend from Stage 1 into server-accessible client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Expose control center port
EXPOSE 5001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Start server
CMD ["node", "server/src/index.js"]
