# 🚂 Deploy MindCheck Backend to Railway

Railway is a modern hosting platform with a generous free tier ($5/month credit, no credit card required initially).

---

## 📋 Quick Start Guide

### Step 1: Sign Up for Railway

1. Go to **[railway.app](https://railway.app)**
2. Click **"Login"** and sign in with **GitHub**
3. Authorize Railway to access your repositories

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`mindcheck`** (your repository)
4. Railway will automatically:
   - Detect it's a Node.js project
   - Start building
   - Create a deployment

---

### Step 3: Configure Environment Variables

1. In your Railway project, click on your **service** (mindcheck)
2. Go to the **Variables** tab
3. Click **"+ New Variable"** and add these:

```
NODE_ENV=production
DATABASE_URL=<your-neon-pooled-connection-string>
JWT_SECRET=<generate-with-deploy-helper.js>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
CLIENT_URL=https://your-frontend-url.vercel.app
PORT=3001
```

**How to get these values:**

- **DATABASE_URL**: Get from Neon (pooled connection)
- **JWT_SECRET**: Run `node scripts/deploy-helper.js` locally (copy the output, keep it secure!)
- **CORS_ORIGIN & CLIENT_URL**: Your Vercel frontend URL

---

### Step 4: Generate Domain

1. In your Railway service, go to **Settings** tab
2. Scroll to **Networking** section
3. Click **"Generate Domain"**
4. Railway will create a public URL like: `https://mindcheck-production-xxxx.up.railway.app`
5. **Copy this URL** - you'll need it for your frontend!

---

### Step 5: Verify Deployment

Once deployed (takes 3-5 minutes), test your endpoints:

**Health Check:**
```
https://your-railway-url.up.railway.app/api/health
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

**Get Assessments:**
```
https://your-railway-url.up.railway.app/api/assessments
```

---

### Step 6: Update Frontend (Vercel)

1. Go to your **Vercel project**
2. **Settings** → **Environment Variables**
3. Add or update:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
4. **Deployments** → **Redeploy** (click ⋯ on latest deployment)

---

## 🔍 Monitoring & Logs

### View Logs
1. Go to your Railway project
2. Click on your service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. View **Build Logs** and **Deploy Logs**

### View Metrics
1. Click **"Metrics"** tab
2. See CPU, Memory, Network usage

---

## 🔄 Auto-Deploy from GitHub

Railway automatically redeploys when you push to `main`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will:
- Detect the push
- Rebuild your service
- Run migrations
- Deploy automatically

---

## 💰 Railway Free Tier

- **$5 free credit per month**
- **500 hours** of execution time
- **100 GB** of outbound network
- **No credit card required** (for trial)
- After trial, add card to continue free tier

Your MindCheck API should stay well within free limits! 🎉

---

## 🛠️ Troubleshooting

### Build Fails

**Check logs in Railway:**
- Deployments → Latest → Build Logs

**Common issues:**
- Missing environment variables
- Node version mismatch (should use Node 20)
- Prisma client not generated

**Fix:**
- Verify `railway.json` and `nixpacks.toml` are in root
- Check all environment variables are set
- Redeploy: Settings → Redeploy

---

### Database Connection Error

**Symptoms:**
- Health check returns 503
- "Database unreachable" error

**Fix:**
1. Verify `DATABASE_URL` is correct
2. Must use **POOLED** connection from Neon (contains `-pooler`)
3. Connection string must include `?sslmode=require`
4. Check Neon database is running

**Test connection:**
```bash
# In Railway service shell (Settings → Connect)
echo $DATABASE_URL
```

---

### CORS Errors

**Symptoms:**
- Frontend can't reach API
- "CORS policy" error in browser console

**Fix:**
1. Verify `CORS_ORIGIN` exactly matches your Vercel URL
2. Must include `https://` protocol
3. No trailing slashes
4. Check browser console for specific error

**Example:**
```
✅ CORS_ORIGIN=https://mindcheck.vercel.app
❌ CORS_ORIGIN=https://mindcheck.vercel.app/
❌ CORS_ORIGIN=http://mindcheck.vercel.app
❌ CORS_ORIGIN=mindcheck.vercel.app
```

---

### Migrations Don't Run

**Symptoms:**
- Tables missing in database
- "Table does not exist" errors

**Fix:**
1. Check Deploy Logs for migration errors
2. Manually run migrations:
   - Settings → Connect → Shell
   - Run: `npm run db:deploy --workspace server`
3. Check `DATABASE_URL` permissions

---

### Service Crashes on Startup

**Check:**
1. Deploy logs for error messages
2. Verify all required env vars are set
3. Check `PORT` is set to `3001` (or Railway's `$PORT`)
4. Verify start command is correct

---

## 🔐 Security Notes

- ✅ **JWT_SECRET**: Generate locally, add to Railway (never commit to git)
- ✅ **DATABASE_URL**: Contains credentials, keep secure
- ✅ Railway encrypts all environment variables
- ✅ Use HTTPS only (Railway provides this automatically)

---

## 📊 Architecture After Deployment

```
┌─────────────────┐
│  Vercel (Frontend)
│  mindcheck.vercel.app
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  Railway (Backend API)
│  mindcheck.up.railway.app
└────────┬────────┘
         │
         │ PostgreSQL
         │
┌────────▼────────┐
│  Neon Database
│  (Pooled Connection)
└─────────────────┘
```

---

## 📝 Quick Reference

### Railway Commands (in service shell)
```bash
# Check environment
env | grep DATABASE_URL

# Run migrations manually
npm run db:deploy --workspace server

# Check Node version
node --version

# Test database connection
npm run db:generate --workspace server
```

### Important URLs
- **Railway Dashboard**: https://railway.app/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## ✅ Deployment Checklist

- [ ] Signed up for Railway
- [ ] Connected GitHub repository
- [ ] Added all environment variables
- [ ] Generated public domain
- [ ] Tested health check endpoint
- [ ] Updated Vercel with Railway API URL
- [ ] Tested full app flow (register → assessment → results)

---

## 🎉 That's It!

Your backend should now be live on Railway. The free tier is very generous for projects like MindCheck.

**Next Steps:**
1. Test your full application
2. Monitor usage in Railway dashboard
3. Set up error tracking (optional)
4. Add custom domain (optional, paid feature)

Need help? Check the **Troubleshooting** section above! 🚀
