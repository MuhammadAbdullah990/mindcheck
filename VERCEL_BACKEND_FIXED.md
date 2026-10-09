# 🚀 Vercel Backend Deployment - CORRECTED

## The Fix

In Vercel project settings, use these commands:

**Install Command:**
```
npm install && npx prisma generate
```

**Build Command:**
```
npm run build
```

---

## Step-by-Step Deployment

### Step 1: Go to Vercel
https://vercel.com/new

### Step 2: Import Repository
1. Click "Add New..." → "Project"
2. Select: **mindcheck**
3. Click "Import"

### Step 3: Configure Project Settings

**Project Name:** `mindcheck-api`

**Framework Preset:** Other

**Root Directory:** 
- Click "Edit" 
- Select **`server`** folder ✅

**Build and Output Settings:**

| Setting | Value |
|---------|-------|
| Install Command | `npm install && npx prisma generate` |
| Build Command | `npm run build` |
| Output Directory | *(leave empty)* |
| Development Command | *(leave empty)* |

### Step 4: Deploy First Time
Click **"Deploy"** - it will fail (missing environment variables)

### Step 5: Add Environment Variables

Go to: **Settings** → **Environment Variables**

Add these:

```
NODE_ENV=production
DATABASE_URL=<your-neon-pooled-connection-string>
JWT_SECRET=e2304d8044b63fcf532593145bec77e37146f9b4ad6d7dbef4face405b8b256dbafc82ffbee4b0c911257397d89a7c8b
JWT_EXPIRES_IN=7d
CORS_ORIGIN=<your-frontend-vercel-url>
CLIENT_URL=<your-frontend-vercel-url>
```

**Important:** 
- For CORS_ORIGIN and CLIENT_URL, use your **frontend** Vercel URL
- DATABASE_URL must be the **POOLED** connection from Neon

### Step 6: Redeploy

1. Go to **"Deployments"** tab
2. Click **⋯** menu on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

### Step 7: Test Your API

Your backend will be at: `https://mindcheck-api.vercel.app`

Test the health endpoint:
```
https://mindcheck-api.vercel.app/api/health
```

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

### Step 8: Update Frontend

1. Go to your **frontend** project in Vercel
2. **Settings** → **Environment Variables**
3. Add or update:
   ```
   VITE_API_URL=https://mindcheck-api.vercel.app/api
   ```
4. Go to **Deployments** → Redeploy

---

## ✅ Done!

Both your frontend and backend are now on Vercel!

Test the full app:
1. Visit your frontend URL
2. Register a new account
3. Complete an assessment
4. Check results

---

## 🔧 Troubleshooting

### Build Still Fails

**Error:** "Cannot find module 'express'" or similar
**Fix:** Make sure Root Directory is set to `server` folder

### Database Connection Error

**Symptoms:** Health check returns 503 or "Database unreachable"
**Fix:**
- Verify DATABASE_URL in environment variables
- Must use **POOLED** connection (contains `-pooler`)
- Include `?sslmode=require` at the end
- Check Neon database is running

### CORS Errors in Browser

**Symptoms:** Frontend can't reach API, CORS errors in console
**Fix:**
- CORS_ORIGIN must **exactly** match your frontend URL
- Include `https://` protocol
- No trailing slashes: ✅ `https://mindcheck.vercel.app` ❌ `https://mindcheck.vercel.app/`

### Prisma Generate Fails

**Error:** "Cannot find Prisma schema"
**Fix:** 
- Verify `prisma/schema.prisma` exists in server folder
- Check Install Command is correct: `npm install && npx prisma generate`

---

## 💡 Pro Tips

- Vercel serverless functions have a **10-second timeout** on free tier
- Each request is handled independently (no persistent state)
- All data must be in the database
- Cold starts add ~1-2 seconds to first request

---

## 📊 What Gets Deployed

```
server/
├── api/
│   └── index.ts        ← Serverless function entry point
├── src/
│   ├── app.ts          ← Express app
│   ├── routes/         ← API routes
│   ├── controllers/    ← Request handlers
│   └── ...
└── prisma/
    └── schema.prisma   ← Database schema
```

Vercel automatically:
1. Installs dependencies
2. Generates Prisma Client
3. Builds TypeScript to JavaScript
4. Creates serverless function from api/index.ts

---

## 🎉 You're All Set!

Your MindCheck backend is now live on Vercel alongside your frontend.

Everything on one platform = simpler management! 🚀
