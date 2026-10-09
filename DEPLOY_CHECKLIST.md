# 🚀 Backend Deployment Checklist

Use this checklist to deploy your MindCheck backend to Render.

## ✅ Pre-Deployment (Completed)

- [x] Code pushed to GitHub
- [x] `render.yaml` configured
- [x] Health check endpoint ready at `/api/health`
- [x] Build and start commands verified
- [x] JWT secret generated

## 📋 Deployment Steps

### Step 1: Gather Required Information

You'll need these three things before starting:

1. **Neon Database URL** (Pooled connection)
   - Go to: https://console.neon.tech
   - Select your project
   - Click "Connection Details"
   - **Important:** Choose "Pooled connection" (URL should contain `-pooler`)
   - Copy the full connection string

2. **JWT Secret** (Generate your own):
   ```bash
   # Run this command to generate a secure JWT secret:
   node scripts/deploy-helper.js
   
   # Or generate manually:
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

3. **Vercel Frontend URL**
   - Get your Vercel URL (e.g., `https://mindcheck.vercel.app`)
   - Remove any trailing slashes

---

### Step 2: Create Web Service on Render

1. Go to **https://dashboard.render.com**
2. Sign in with GitHub (if not already signed in)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect account"** to link GitHub (if needed)
5. Find and select: **`MuhammadAbdullah990/mindcheck`**
6. Click **"Connect"**

---

### Step 3: Configure the Service

Render will auto-detect `render.yaml`. Review these settings:

**Basic Settings:**
- **Name:** `mindcheck-api` (auto-filled)
- **Region:** Oregon (auto-filled)
- **Branch:** `main`
- **Runtime:** Node
- **Build Command:** `npm ci && npm run db:generate && npm run build --workspace server`
- **Start Command:** `npm run db:deploy --workspace server && npm run start --workspace server`

**Advanced Settings:**
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** Yes (recommended)

---

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Auto-filled |
| `DATABASE_URL` | `<your-neon-pooled-url>` | **Paste from Neon** |
| `JWT_SECRET` | `<run-deploy-helper.js>` | **Generate with helper script** |
| `JWT_EXPIRES_IN` | `7d` | Auto-filled |
| `CORS_ORIGIN` | `<your-vercel-url>` | **Your Vercel URL** |
| `CLIENT_URL` | `<your-vercel-url>` | **Same as CORS_ORIGIN** |

**Example:**
```
DATABASE_URL=postgresql://user:pass@ep-cool-morning-123456-pooler.us-east-2.aws.neon.tech/mindcheck?sslmode=require
CORS_ORIGIN=https://mindcheck.vercel.app
CLIENT_URL=https://mindcheck.vercel.app
```

---

### Step 5: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Wait for the deployment (5-10 minutes first time)
3. Watch the logs - you should see:
   ```
   ✓ Generated Prisma Client
   ✓ Build succeeded
   ✓ Running migrations
   ✓ MindCheck API listening on...
   ```

4. Your API will be live at: **`https://mindcheck-api.onrender.com`**

---

### Step 6: Verify Deployment

Test these endpoints in your browser or with curl:

**1. Health Check:**
```
https://mindcheck-api.onrender.com/api/health
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

**2. Get Assessments:**
```
https://mindcheck-api.onrender.com/api/assessments
```

**3. Get Resources:**
```
https://mindcheck-api.onrender.com/api/resources
```

---

### Step 7: Update Frontend

Now update your Vercel frontend to use the production API:

**Option A: Vercel Dashboard (Recommended)**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://mindcheck-api.onrender.com/api`
   - **Environment:** Production
4. Redeploy: Deployments → Latest → ⋯ → Redeploy

**Option B: Add to repository**
Create `client/.env.production`:
```env
VITE_API_URL=https://mindcheck-api.onrender.com/api
```
Then commit and push.

---

### Step 8: Final Test

1. Visit your Vercel frontend
2. Register a new account
3. Complete an assessment (e.g., PHQ-9)
4. View results
5. Check dashboard

If everything works: **🎉 Deployment Complete!**

---

## 🔍 Troubleshooting

### Build Fails
- Check Render logs for specific errors
- Verify `package.json` has all dependencies
- Try running `npm ci && npm run build --workspace server` locally

### Database Connection Error
- Ensure you used the **POOLED** connection string (contains `-pooler`)
- Check that `?sslmode=require` is in the URL
- Verify database exists in Neon

### CORS Errors
- Verify `CORS_ORIGIN` exactly matches your Vercel URL
- Include `https://` protocol
- No trailing slashes
- Check browser console for specific CORS errors

### 503 Service Unavailable
- Render free tier spins down after 15 min of inactivity
- First request after sleep takes 30-60 seconds (cold start)
- Subsequent requests will be fast

### Migration Fails
- Check Render logs
- Verify DATABASE_URL is correct
- Check Neon database is running
- Try manual migration: In Render shell, run `npm run db:deploy --workspace server`

---

## 📊 Monitoring

**Render Dashboard:**
- View logs: Dashboard → mindcheck-api → Logs
- View metrics: Dashboard → mindcheck-api → Metrics
- Restart service: Dashboard → mindcheck-api → Manual Deploy → Clear build cache & deploy

**Neon Dashboard:**
- Monitor connections: https://console.neon.tech → Your Project → Monitoring
- Check queries: Operations → Query History

---

## 🔄 Future Deployments

Render auto-deploys when you push to `main`:

1. Make changes locally
2. Test locally: `npm run dev`
3. Commit: `git add . && git commit -m "Your changes"`
4. Push: `git push origin main`
5. Render automatically rebuilds and deploys

---

## 💰 Cost Summary

- **Render:** Free tier (750 hours/month)
- **Neon:** Free tier (0.5 GB storage, 10 GB transfer)
- **Vercel:** Free tier (100 GB bandwidth)

**Total: $0/month** ✨

---

## 📝 URLs Summary

After deployment, save these URLs:

- **Frontend:** https://______.vercel.app
- **Backend API:** https://mindcheck-api.onrender.com
- **Health Check:** https://mindcheck-api.onrender.com/api/health
- **Neon Dashboard:** https://console.neon.tech
- **Render Dashboard:** https://dashboard.render.com

---

**Need help?** Check `DEPLOYMENT.md` for detailed troubleshooting.
