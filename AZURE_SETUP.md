# 🚀 Azure Static Web Apps Setup Guide

This guide will help you deploy your HabitHero app to Azure Static Web Apps and configure the GitHub Actions deployment.

## Prerequisites

- Azure account (free tier available) - [Sign up here](https://azure.microsoft.com/free/)
- GitHub account with this repository
- Your app code pushed to GitHub

## Step-by-Step Setup

### Step 1: Create Azure Static Web App

1. **Go to Azure Portal**
   - Visit https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create a new Static Web App**
   - Click **"Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Create"**

3. **Configure Basic Settings**
   ```
   Subscription: (Select your subscription)
   Resource Group: Create new → "habithero-rg"
   Name: "habithero" (or your preferred name)
   Plan Type: Free
   Region: (Choose closest to you - e.g., East US 2, West Europe)
   ```

4. **Configure Deployment Details**
   ```
   Source: GitHub
   Organization: (Your GitHub username)
   Repository: catllab (or your repo name)
   Branch: main
   ```

5. **Build Configuration**
   ```
   Build Presets: Custom
   App location: /
   Api location: (leave empty)
   Output location: (leave empty)
   ```

6. **Review and Create**
   - Click **"Review + Create"**
   - Click **"Create"**
   - Wait 1-2 minutes for deployment to complete

### Step 2: Get Your Deployment Token

Azure automatically creates a GitHub secret during setup, but if you need to get it manually:

**Option A: From Azure Portal (After Creation)**

1. Go to your Static Web App in Azure Portal
2. Click on **"Manage deployment token"** in the left menu
3. Click **"Copy"** to copy the token
4. ⚠️ **Save this token** - you'll need it in the next step

**Option B: From GitHub Actions (Automatic)**

If you used the Azure Portal to create the Static Web App and connected it to GitHub, Azure automatically adds the secret `AZURE_STATIC_WEB_APPS_API_TOKEN` to your repository. In this case, skip Step 3!

### Step 3: Add Deployment Token to GitHub Secrets (If Needed)

If the secret wasn't automatically added:

1. **Go to your GitHub repository**
   - Navigate to https://github.com/YOUR-USERNAME/catllab

2. **Access Repository Settings**
   - Click **"Settings"** tab
   - Click **"Secrets and variables"** → **"Actions"** in the left menu

3. **Add New Secret**
   - Click **"New repository secret"**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: (Paste the token from Step 2)
   - Click **"Add secret"**

### Step 4: Trigger Deployment

**Option A: Push a commit**
```bash
# Make any small change or just re-trigger
git commit --allow-empty -m "Trigger Azure deployment"
git push origin main
```

**Option B: Re-run workflow**
1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. Select the failed workflow run
4. Click **"Re-run all jobs"**

### Step 5: Verify Deployment

1. **Check GitHub Actions**
   - Go to **Actions** tab in your repository
   - You should see a green checkmark ✅
   - Click on the workflow to see deployment logs

2. **Get Your App URL**

   **From Azure Portal:**
   - Go to your Static Web App
   - The URL is shown at the top: `https://habithero-xxxxx.azurestaticapps.net`

   **From GitHub Actions:**
   - Open the successful workflow run
   - Look for the deployment URL in the logs

3. **Test Your App**
   - Visit the URL
   - Test that the game loads and works
   - Test localStorage persistence

## 🎉 Success!

Your app is now live at: `https://YOUR-APP-NAME.azurestaticapps.net`

## Automatic Deployments

Every time you push to the `main` branch, GitHub Actions will automatically:
1. ✅ Build and validate your app
2. ✅ Deploy to Azure Static Web Apps
3. ✅ Provide a preview URL in the workflow logs

## Custom Domain (Optional)

To use your own domain:

1. In Azure Portal, go to your Static Web App
2. Click **"Custom domains"** in the left menu
3. Click **"Add"**
4. Follow the instructions to verify domain ownership
5. Add the DNS records provided
6. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Deployment token error
```
deployment_token was not provided
```
**Solution**: Follow Step 3 to add the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to your GitHub repository.

### Workflow doesn't run
**Check:**
- Is the workflow file in `.github/workflows/` folder?
- Did you push the workflow file to GitHub?
- Is GitHub Actions enabled for your repository?

### App shows 404
**Check:**
- Is `index.html` in the root directory?
- Did the deployment complete successfully?
- Check Azure Portal for deployment status

### Data not persisting
**Remember:**
- App uses localStorage (browser-based storage)
- Clearing browser data will clear game progress
- Each browser/device has separate data

## Monitoring and Logs

### View Deployment Logs
1. Go to your Static Web App in Azure Portal
2. Click **"Deployment history"** in the left menu
3. See all deployments and their status

### View Application Logs
1. In Azure Portal, go to your Static Web App
2. Click **"Application Insights"** (if enabled)
3. Or use browser developer tools (F12) for client-side errors

## Cost

**Free Tier Includes:**
- ✅ 100 GB bandwidth per month
- ✅ Unlimited custom domains
- ✅ Free SSL certificates
- ✅ GitHub integration
- ✅ No credit card required initially

**Perfect for:**
- Personal projects
- Small family apps
- Learning and development

## Next Steps

1. ✅ **Bookmark your app URL**
2. ✅ **Share with family** - they can play!
3. ✅ **Add to home screen** on mobile devices
4. ✅ **Customize the game** and push updates
5. ✅ **Add a custom domain** (optional)

## Need Help?

- **Azure Docs**: https://docs.microsoft.com/azure/static-web-apps/
- **GitHub Actions**: Check the Actions tab for error logs
- **Browser Console**: Press F12 to see client-side errors

---

## Quick Reference Commands

```bash
# Push changes to trigger deployment
git add .
git commit -m "Update game"
git push origin main

# Create empty commit to re-trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main

# Check current git status
git status

# View recent commits
git log --oneline -5
```

Happy deploying! 🚀
