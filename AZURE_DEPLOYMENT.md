# Azure Static Web Apps Deployment Guide

## Current Architecture Issue

Your app currently uses:
- **Node.js/Express** server with API routes
- **Socket.IO** for real-time communication
- **SQLite** database (file-based)

Azure Static Web Apps is designed for **static frontends** only. Your backend requires a server runtime.

## Deployment Options

### Option 1: Azure Static Web Apps + Azure Functions (Best for Static Apps)

**Pros:**
- Free tier available
- Global CDN distribution
- Automatic HTTPS
- Easy GitHub integration

**Cons:**
- Requires refactoring backend to serverless functions
- Socket.IO won't work (need to use SignalR or polling)
- Need to replace SQLite with cloud database (Cosmos DB, Azure SQL, or Table Storage)

**Steps:**
1. Create Azure Static Web App in Azure Portal
2. Connect your GitHub repository
3. Migrate API routes to Azure Functions (in `/api` folder)
4. Replace Socket.IO with Azure SignalR Service or long polling
5. Replace SQLite with Azure Cosmos DB or Azure Table Storage
6. Deploy automatically via GitHub Actions

### Option 2: Azure App Service (Easiest Migration)

**Pros:**
- Deploy as-is with minimal changes
- Full Node.js runtime support
- Socket.IO works natively
- Can use SQLite (though not recommended for production)

**Cons:**
- No free tier (starts ~$13/month)
- Requires manual setup

**Steps:**
1. Create Azure App Service (Node.js runtime)
2. Configure deployment from GitHub
3. Add environment variables in Azure Portal
4. Deploy using GitHub Actions or Azure CLI

### Option 3: Azure Container Apps

**Pros:**
- Full containerized environment
- Auto-scaling
- Works with all your current dependencies

**Cons:**
- More complex setup
- Costs similar to App Service

## Recommended Approach for Your App

Given your app's architecture, I recommend **Option 2: Azure App Service** because:
1. Minimal code changes required
2. Socket.IO works out of the box
3. You can migrate the database later

## Quick Start: Deploy to Azure App Service

### Prerequisites
- Azure account
- Azure CLI installed

### Deployment Steps

```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name catllab-rg --location eastus

# 3. Create App Service plan
az appservice plan create --name catllab-plan --resource-group catllab-rg --sku B1 --is-linux

# 4. Create Web App
az webapp create --resource-group catllab-rg --plan catllab-plan --name catllab-quest --runtime "NODE:18-lts"

# 5. Configure deployment from GitHub
az webapp deployment source config --name catllab-quest --resource-group catllab-rg --repo-url https://github.com/YOUR-USERNAME/catllab --branch main --manual-integration

# 6. Set environment variable
az webapp config appsettings set --resource-group catllab-rg --name catllab-quest --settings PORT=8080
```

### Database Considerations

For production, replace SQLite with:
- **Azure Cosmos DB** (NoSQL, serverless option available)
- **Azure SQL Database** (Relational, free tier available)
- **Azure Database for PostgreSQL** (Relational, flexible server)

## Files Added for Static Web Apps

If you want to pursue Option 1 later:
- `staticwebapp.config.json` - Configuration for Azure Static Web Apps
- `.github/workflows/azure-static-web-apps.yml` - GitHub Actions deployment workflow

These files are ready but won't work until you refactor the backend to Azure Functions.

## Next Steps

1. **Choose your deployment option** (App Service recommended)
2. **Set up Azure resources** using the commands above
3. **Configure production database** (optional but recommended)
4. **Set up CI/CD** with GitHub Actions
5. **Configure custom domain** (if needed)

## Need Help?

- Azure Static Web Apps: https://docs.microsoft.com/azure/static-web-apps/
- Azure App Service: https://docs.microsoft.com/azure/app-service/
- Azure Functions: https://docs.microsoft.com/azure/azure-functions/
