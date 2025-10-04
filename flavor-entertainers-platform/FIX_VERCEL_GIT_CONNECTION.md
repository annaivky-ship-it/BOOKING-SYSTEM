# Fix Vercel Git Repository Connection

## Issue
Vercel is trying to deploy from `github.com/annaivky-ship-it/BOOKING-SYSTEM`  
But the correct repo is: `github.com/annaivky-ship-it/flavor-entertainers-platform`

## ✅ Current Workaround
Deploying directly from local folder works:
```bash
cd flavor-entertainers-platform
npx vercel --prod
```

## 🔧 Permanent Fix: Update Vercel Git Settings

### Option 1: Reconnect Repository in Vercel Dashboard

1. **Go to Vercel Project Settings**:
   https://vercel.com/annaivky-ship-its-projects/booking-system/settings

2. **Click "Git" tab** (left sidebar)

3. **Disconnect current repository**:
   - Click "Disconnect" next to `BOOKING-SYSTEM`

4. **Connect correct repository**:
   - Click "Connect Git Repository"
   - Select: `annaivky-ship-it/flavor-entertainers-platform`
   - Branch: `master`
   - Root Directory: `./` (leave default)

5. **Save changes**

6. **Redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

### Option 2: Use Vercel CLI to Link

```bash
cd flavor-entertainers-platform

# Unlink current project
npx vercel unlink

# Link to correct project
npx vercel link

# Deploy
npx vercel --prod
```

## ✅ Verify Fix Worked

After reconnecting:

1. Push a small change to GitHub:
   ```bash
   git commit --allow-empty -m "Test auto-deploy"
   git push
   ```

2. Check Vercel deployments:
   - Should auto-deploy from GitHub
   - Build logs should show correct repo

3. Verify deployment succeeds without errors

## 📋 Current Status

**Working**:
- ✅ Local deploys work (`npx vercel --prod`)
- ✅ Latest deployment successful
- ✅ Site is live at: https://booking-system-lrkd.vercel.app

**Needs Fix**:
- ⚠️ Auto-deploy from GitHub not working (wrong repo)
- ⚠️ Manual deployment required for updates

## 🚀 Quick Deploy Commands

Until Git connection is fixed, use these:

**Deploy Production**:
```bash
cd flavor-entertainers-platform
npx vercel --prod
```

**Deploy Preview**:
```bash
npx vercel
```

**Check Deployment Status**:
```bash
npx vercel ls
```

**View Logs**:
```bash
npx vercel logs
```

## 🔗 Important Links

- **Vercel Project**: https://vercel.com/annaivky-ship-its-projects/booking-system
- **Git Settings**: https://vercel.com/annaivky-ship-its-projects/booking-system/settings/git
- **Deployments**: https://vercel.com/annaivky-ship-its-projects/booking-system/deployments
- **Correct GitHub Repo**: https://github.com/annaivky-ship-it/flavor-entertainers-platform

---

**Note**: The current deployment is working fine via CLI. The Git connection fix is optional but recommended for auto-deploy on push.
