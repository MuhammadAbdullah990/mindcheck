# 🚀 Railway Deployment - Quick Start

## Step-by-Step Instructions

### 1. Generate Your JWT Secret First
Run this locally and **save the output** (you'll need it for Railway):
```bash
node scripts/deploy-helper.js
```
Copy the generated JWT_SECRET somewhere safe (don't commit it!).

---

### 2. Get Your Neon Database URL
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. **Important:** Choose "Pooled connection"
5. Copy the full connection string (should contain `-pooler`)

---

### 3. Deploy to Railway

#### A. Sign Up & Connect
1. Go to **https://railway.app**
2. Click "Login" → Sign in with GitHub
3. Authorize Railway

#### B. Create Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: **mindcheck**
4. Railway starts building automatically

#### C. Add Environment Variables
1. Click on your service (mindcheck)
2. Go to "Variables" tab
3. Add these variables:

```
NODE_ENV=production
DATABASE_URL=<your-neon-pooled-url>
JWT_SECRET=<from-deploy-helper-script>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-url.vercel.app
CLIENT_URL=https://your-vercel-url.vercel.app
PORT=3001
```

#### D. Generate Public Domain
1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy your Railway URL (e.g., `https://mindcheck-production-xxxx.up.railway.app`)

---

### 4. Update Vercel Frontend

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://your-railway-url.up.railway.app/api`
4. Redeploy the frontend

---

### 5. Test Your API

Visit: `https://your-railway-url.up.railway.app/api/health`

Should return:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "up"
  }
}
```

---

## ✅ That's It!

Your backend is now live on Railway with:
- ✅ Automatic deployments from GitHub
- ✅ Free tier ($5/month credit)
- ✅ Auto-scaling
- ✅ HTTPS included

For detailed troubleshooting, see `RAILWAY_DEPLOYMENT.md`
