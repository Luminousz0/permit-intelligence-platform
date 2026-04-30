# Deployment Guide — Railway

Complete instructions for deploying Permit Intelligence Platform on Railway.

---

## Quick Start

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

### 2. Connect GitHub Repository
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Select `permit-intelligence-platform`
5. Railway auto-detects the Node.js app

### 3. Configure Environment

Add these environment variables in Railway dashboard:

```
NODE_ENV=production
PORT=3000
```

Optional for advanced features:
```
GOOGLE_ANALYTICS_ID=G-740YX0W0GE
PDOK_API_KEY=<your-key-if-needed>
```

### 4. Deploy

Push to main branch:
```bash
git push origin main
```

Railway automatically deploys when code is pushed.

---

## Database

The application uses **SQLite** (`better-sqlite3`), which stores data in:
```
src/data/app.db
```

### Database Persistence on Railway

Railway mounts a persistent volume for the database:
1. Database file is created in `src/data/app.db`
2. Data persists across deployments
3. Backups are handled by Railway's storage system

**Note**: If you need to reset the database, delete `app.db` and redeploy.

---

## Monitoring

### View Logs
```bash
# Stream logs
railway logs -f

# View build logs
railway logs --service permit-intelligence-platform --build
```

### Health Checks
Railway monitors the `/` endpoint on port 3000. The app responds with the homepage, confirming it's running.

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `GOOGLE_ANALYTICS_ID` | — | Google Analytics tracking ID |

---

## Troubleshooting

### App Crashes on Start
```bash
# Check logs
railway logs -f

# Common issues:
# - PORT already in use (Railway handles this)
# - Missing dependencies (npm install run during build)
# - Environment variable issues
```

### Database File Not Persisting
1. Check Railway dashboard for volume mounts
2. Verify `src/data/` directory is created
3. Check file permissions

### Slow Deployments
1. Clear build cache in Railway dashboard
2. Check internet connection
3. Verify package-lock.json is committed

---

## Advanced Configuration

### Custom Build Steps
Edit `railway.json` to customize build behavior:

```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm ci && npm run build"
  }
}
```

### Multiple Environments

Create separate Railway projects for staging/production:

```bash
# Development branch
railway init --name permit-intelligence-dev

# Production branch (main)
# Automatically deployed via GitHub integration
```

---

## Rollback

### Revert to Previous Deployment
1. Go to Railway dashboard
2. Select your deployment
3. Click "Rollback" next to the previous version
4. Deployment restarts with the previous code

---

## Performance

### Build Time
- First build: ~2-3 minutes
- Subsequent builds: ~1-2 minutes (incremental)

### Startup Time
- Cold start: ~3-5 seconds
- Warm start: <1 second

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Status Page**: https://railway-status.com
- **Support**: support@railway.app

---

**Deployed on Railway** 🚂
