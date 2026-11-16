# OUR SMP - AFK Bot Agent (IronBot & IronBot2)

Enhanced Bedrock Dedicated Server (BDS) AFK Bot with **Auto-Teleport and Live Telemetry**.

## Key Features

1. **Multi-Bot Support**: Runs `IronBot` and `IronBot2` concurrently in a single process.
2. **NetherNet WebRTC**: Fully compatible with NetherNet protocol (`ayx.acido.dev:19132`).
3. **Auto-Teleport Detection**: Automatically calculates distance to target farm coordinates on spawn. If spawned at world spawn (>10 blocks), alerts the Control Center.
4. **Clean Shutdown**: Broadcasts cancellation across all bot instances so both disconnect cleanly.
5. **Render-Friendly Health Probe**:
   - `GET /`: Returns `200 OK` text for Render's zero-downtime health check.
   - `GET /status`: Returns JSON telemetry of all running bots, coordinates, and uptimes.

## Local Testing

```powershell
go run main.go
```
