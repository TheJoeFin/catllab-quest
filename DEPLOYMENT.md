# Deployment Guide for Azure Static Web Apps

## ✅ Pre-Deployment Checklist

Your app is now ready to deploy as a static website! All backend dependencies have been removed.

### What Was Removed:
- ❌ Socket.IO (real-time sync)
- ❌ Express server (Node.js)
- ❌ SQLite database
- ❌ All server-side code

### What Remains:
- ✅ Pure HTML/CSS/JavaScript
- ✅ localStorage for data persistence
- ✅ All game functionality
- ✅ Parent dashboard
- ✅ Sound effects

## 🚀 Deploy to Azure Static Web Apps

### Method 1: Azure Portal (Easiest)

1. **Create Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web Apps"
   - Click "Create"

2. **Configure**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `habithero` (or your preferred name)
   - **Plan type**: Free (or Standard for custom domains)
   - **Region**: Choose closest to you
   - **Source**: GitHub (or upload files manually)

3. **Build Configuration**
   - **App location**: `/`
   - **Api location**: (leave empty)
   - **Output location**: (leave empty)

4. **Deploy**
   - Click "Review + Create"
   - Click "Create"
   - Wait for deployment (2-3 minutes)

### Method 2: Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name habithero-rg --location eastus

# Create static web app
az staticwebapp create \
  --name habithero \
  --resource-group habithero-rg \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location ""
```

### Method 3: GitHub Actions (Automatic)

The workflow file is already created at `.github/workflows/azure-static-web-apps.yml`

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Convert to static web app"
   git push origin main
   ```

2. **Get Deployment Token**
   - In Azure Portal, go to your Static Web App
   - Click "Manage deployment token"
   - Copy the token

3. **Add Secret to GitHub**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: (paste the token)

4. **Deploy**
   - Push to main branch
   - GitHub Actions will automatically deploy

## 🧪 Test Locally

Before deploying, test locally:

```bash
# Option 1: Just open in browser
# Double-click index.html or open it in your browser

# Option 2: Use a simple HTTP server (optional)
# Python 3
python -m http.server 8000

# Node.js (if you have it)
npx serve

# Then open http://localhost:8000
```

## 📋 Post-Deployment Checklist

After deployment, test these features:

- [ ] Game loads correctly
- [ ] Player can move around
- [ ] Can switch between rooms
- [ ] Can interact with objects
- [ ] Can accept quests
- [ ] Can complete quests
- [ ] XP and gems are awarded
- [ ] Data persists after refresh
- [ ] Parent mode works
- [ ] Can create quests
- [ ] Can create rewards
- [ ] Parent dashboard loads
- [ ] Sounds play correctly
- [ ] Mobile/tablet view works

## 🌐 Access Your App

After deployment, your app will be available at:
```
https://YOUR-APP-NAME.azurestaticapps.net
```

You can also configure a custom domain in Azure Portal.

## 💰 Pricing

- **Free Tier**: 100 GB bandwidth/month, 0.5 GB storage
- **Standard Tier**: $9/month, custom domains, SLA

For a family app, the free tier is perfect!

## 🔧 Configuration

The `staticwebapp.config.json` file is already configured with:
- Navigation fallback (SPA routing)
- MIME types for files
- Cache control headers

## 📱 Share with Family

Once deployed, you can:
1. Open on any device's browser
2. Add to home screen on mobile (acts like an app!)
3. Share the URL with family members

Each device will have its own data (localStorage is per-browser).

## 🆘 Troubleshooting

**Build fails?**
- Check that all files are committed to git
- Verify `staticwebapp.config.json` is valid JSON

**App doesn't load?**
- Check browser console for errors
- Verify all files deployed correctly
- Check file paths are correct (case-sensitive!)

**Data doesn't persist?**
- LocalStorage must be enabled in browser
- Not in private/incognito mode
- Check browser compatibility

**Sounds don't work?**
- Verify sound files are in `/sounds` folder
- Check browser allows autoplay
- Try clicking something first (browsers require user interaction)

## 🎉 Success!

Your app is now deployed as a static website with:
- ⚡ Lightning-fast loading
- 💰 Minimal costs (free tier works great)
- 🔒 No server to maintain
- 🌍 Global CDN distribution
- 📱 Works on all devices

Enjoy your gamified habit tracker!
