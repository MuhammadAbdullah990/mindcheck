# 🚀 Deploy MindCheck Backend to Vercel

## Simple 3-Step Deployment

### Step 1: Generate JWT Secret
Run this command locally and save the output:
```bash
node scripts/deploy-helper.js
```
Copy the JWT_SECRET value (you'll need it in Step 3).

---

### Step 2: Deploy to Vercel

1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Click **"Add New..."** → **"Project"**
3. Import the same repository: **`mindcheck`**
4. **Important Settings:**
   - **Project Name:** `mindcheck-api` (or any name you want)
   - **Framework Preset:** Other
   - **Root Directory:** Click "Edit" → Select **`server`** folder
   - **Build Command:** Leave empty (Vercel will auto-detect)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install && npx prisma generate`

5. Click **"Deploy"** (it will fail first time - that's OK!)

---

### Step 3: Add Environment Variables

After the first deploy (even if it fails):

1. Go to your project in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon pooled connection string |
| `JWT_SECRET` | From deploy-helper.js script |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | Your frontend Vercel URL |
| `CLIENT_URL` | Your frontend Vercel URL (same as above) |

**Example values:**
```
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/mindcheck?sslmode=require
JWT_SECRET=<from-deploy-helper-script>
CORS_ORIGIN=https://mindcheck.vercel.app
CLIENT_URL=https://mindcheck.vercel.app
```

4. Click **"Save"**

---

### Step 4: Redeploy

1. Go to **"Deployments"** tab
2. Click the **⋯** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for build to complete

---

### Step 5: Get Your API URL

After successful deployment:
1. Your API will be at: `https://mindcheck-api.vercel.app` (or whatever name you chose)
2. Test it: `https://mindcheck-api.vercel.app/api/health`

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

### Step 6: Update Frontend

1. Go to your **frontend** Vercel project (the original one)
2. **Settings** → **Environment Variables**
3. Add or update:
   ```
   VITE_API_URL=https://mindcheck-api.vercel.app/api
   ```
4. **Deployments** → Redeploy

---

## ✅ Done!

Both frontend and backend are now on Vercel!

**Your URLs:**
- Frontend: `https://mindcheck.vercel.app`
- Backend API: `https://mindcheck-api.vercel.app`
- Health Check: `https://mindcheck-api.vercel.app/api/health`

---

## 🔧 Troubleshooting

### Build Fails with "Cannot find module"
**Fix:** Make sure Root Directory is set to `server` folder in Vercel project settings.

### Database Connection Error
**Fix:** 
- Use POOLED connection from Neon (contains `-pooler`)
- Include `?sslmode=require` at the end
- Check DATABASE_URL is correct in environment variables

### CORS Errors
**Fix:**
- Ensure CORS_ORIGIN matches your frontend URL exactly
- Include `https://` protocol
- No trailing slashes

### Migrations Not Running
**Note:** Vercel serverless doesn't auto-run migrations. You need to:
1. Run migrations manually from your local machine:
   ```bash
   npm run db:deploy --workspace server
   ```
2. Or use Railway/Render for auto-migrations

---

## 💡 Important Notes

- **Vercel is serverless** - Functions start on-demand (slight cold start delay)
- **No persistent file system** - All data must be in database
- **10-second timeout** on free tier - Most requests finish in <1 second
- **100GB bandwidth/month** free

---

## 🎉 All Set!

Your MindCheck app is now fully deployed on Vercel (both frontend and backend).

Test the full flow:
1. Visit your frontend URL
2. Register a new account
3. Complete an assessment
4. View results

Everything should work! 🚀
