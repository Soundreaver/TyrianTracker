# Deployment Guide

This project consists of a React frontend and Express backend, designed to be deployed on Vercel (frontend) and Render (backend).

## Architecture

- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Express.js + Node.js (deployed to Render)
- **Database**: PostgreSQL (can use Neon, Railway, or any PostgreSQL provider)

## Prerequisites

1. Node.js 18+ and npm
2. PostgreSQL database (recommend Neon.tech for free tier)
3. Vercel account
4. Render account
5. Guild Wars 2 API access

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```bash
   VITE_API_URL=http://localhost:3001
   DATABASE_URL=your_local_or_cloud_database_url
   PORT=3001
   ```
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

## Database Setup

1. Create a PostgreSQL database (recommended: Neon.tech)
2. Get your connection string
3. Run database migrations: `npm run db:push`

## Frontend Deployment (Vercel)

### Environment Variables Required:
- `VITE_API_URL` - Your backend URL from Render (e.g., `https://your-app.onrender.com`)

### Deployment Steps:
**Option A: Deploy entire repository (automatic detection)**
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the `client` folder as the frontend
3. Add environment variable `VITE_API_URL`
4. Deploy

**Option B: Deploy client folder only (recommended)**
1. Upload just the `client/` folder to a new GitHub repository
2. Connect that repository to Vercel
3. Vercel will automatically detect Vite configuration
4. Add environment variable `VITE_API_URL`
5. Deploy

### Manual Deployment (client folder only):
```bash
# In the client folder
npm install
npm run build
# Deploy dist/ folder to Vercel or upload client folder to GitHub
```

## Backend Deployment (Render)

### Environment Variables Required:
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
- `PORT` - Set to `3001` (or leave empty for Render to set automatically)
- `NODE_ENV` - Set to `production`
- `SESSION_SECRET` - Random string for session security

### Deployment Steps:
**Option A: Deploy entire repository**
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set root directory: `server`
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Add all environment variables listed above
7. Deploy

**Option B: Deploy server folder only (recommended)**
1. Upload just the `server/` folder to a new GitHub repository  
2. Connect that repository to Render
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add all environment variables listed above
6. Deploy

**Note**: The server folder now contains all necessary files including the database schema, so no additional folders are needed.

### Manual Deployment Commands (server folder):
```bash
# In the server folder
npm install
npm run build
npm start
```

## Post-Deployment Setup

1. **Update CORS**: Ensure your backend's `FRONTEND_URL` environment variable matches your Vercel domain
2. **Database Migration**: Run `npm run db:push` if needed (some platforms auto-run this)
3. **Health Check**: Visit `https://your-backend.onrender.com/health` to verify backend is running
4. **Test Integration**: Visit your frontend and test API key validation
5. **Set Up Keep-Alive Service**: Configure monitoring to prevent Render sleep (see Keep-Alive Setup below)

## Keep-Alive Setup (Prevents Render Sleep)

Render's free tier sleeps after 15 minutes of inactivity, causing 50-second cold starts. Here's how to prevent this:

### Option A: UptimeRobot (Recommended - Free)

1. **Sign up** at [UptimeRobot.com](https://uptimerobot.com) (free account)
2. **Create New Monitor**:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `TyrianTracker Backend`
   - URL: `https://your-backend-name.onrender.com/health`
   - Monitoring Interval: `every 5 minutes` (free tier allows 5-minute intervals)
3. **Save Monitor** - UptimeRobot will now ping your server every 5 minutes
4. **Result**: Server stays warm 24/7, no more cold starts!

### Option B: Kaffeine (Alternative - Free)

1. Visit [Kaffeine.herokuapp.com](http://kaffeine.herokuapp.com)
2. Enter your Render URL: `https://your-backend-name.onrender.com`
3. Click "Caffeinate!" - Kaffeine pings every 30 minutes
4. **Note**: Less reliable than UptimeRobot, but zero setup

### Option C: Custom Cron Job (Advanced)

If you have access to a server or use GitHub Actions:

```yaml
# .github/workflows/keep-alive.yml
name: Keep Server Alive
on:
  schedule:
    - cron: '*/14 * * * *'  # Every 14 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: curl -f https://your-backend-name.onrender.com/health
```

### Monitoring Benefits

With keep-alive monitoring, you also get:
- **Uptime alerts** if your server goes down
- **Response time tracking**
- **Downtime notifications** via email/SMS
- **Public status pages** (optional)

## Environment Variables Reference

### Frontend (.env for local, Vercel environment settings for production)
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend (.env for local, Render environment settings for production)
```
DATABASE_URL=postgresql://username:password@host:port/database
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
NODE_ENV=production
SESSION_SECRET=your-random-secret-string
```

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in backend matches your Vercel domain exactly
- Check that credentials are being sent with requests

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgresql://username:password@host:port/database`
- Ensure database allows connections from Render's IP ranges
- Check if SSL is required (most cloud databases require it)

### Build Issues
- Frontend build fails: Check that all dependencies are in `client/package.json`
- Backend build fails: Ensure TypeScript compiles without errors

### API Issues
- 404 on API calls: Verify `VITE_API_URL` is set correctly
- 500 errors: Check backend logs on Render dashboard

## Manual Steps After Deployment

1. **Update Repository**: Remove any remaining Replit references
2. **Test API Keys**: Verify Guild Wars 2 API integration works
3. **Monitor Performance**: Check both Vercel and Render dashboards for performance
4. **Set Up Monitoring**: Consider adding error tracking (Sentry, etc.)

## Production Optimization

### Frontend
- Images are optimized during build
- Static assets are cached by Vercel CDN
- Gzip compression enabled automatically

### Backend
- Uses Express compression middleware
- Database connection pooling configured
- Health check endpoint available at `/health`

## Support

For deployment issues:
- Check Vercel deployment logs
- Check Render deployment and runtime logs
- Verify all environment variables are set correctly
- Test API endpoints manually using curl or Postman
