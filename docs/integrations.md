# Integrations Guide

## 1. NetherNet BDS Status Endpoint
- **URL**: `http://ayx.acido.dev:19132/v1/join`
- **Method**: `GET`
- **Headers**: `User-Agent: libhttpclient/1.0.0.0`
- **Purpose**: Provides real-time BDS status and server restart detection.

## 2. AcidoHost Pterodactyl Client API
- **Endpoint**: `POST https://<panel>/api/client/servers/<id>/command`
- **Headers**:
  - `Authorization: Bearer ptlc_...`
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Body**: `{"command": "tp IronBot 40 108 -13"}`
- **Purpose**: Server console commands for instant and post-restart bot teleportation.

## 3. Go Bot Agent Telemetry
- **Endpoint**: `POST /api/v1/telemetry/bot`
- **Body**:
  ```json
  {
    "botName": "IronBot",
    "status": "online",
    "x": 40.0,
    "y": 108.0,
    "z": -13.0,
    "dimension": 0
  }
  ```
