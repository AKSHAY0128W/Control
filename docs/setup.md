# Setup & Installation Guide

## Requirements
- Node.js `v18+` or `v22+`
- npm `v9+` or `v10+`
- (Optional) Go `v1.24+` for local bot execution

## Step 1: Install Dependencies
```powershell
cd c:\Users\HP\Downloads\Control
npm run install:all
```

## Step 2: Environment Configuration
Copy `.env.example` to `server/.env`:
```powershell
cp .env.example server\.env
```

## Step 3: Run the Application
```powershell
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).
