# Vercel Deployment Guide

## Project Structure
This project has been restructured for Vercel deployment with the following structure:
- **Frontend**: React app in root directory (built with Webpack)
- **Backend**: Express API in `/api` folder (serverless functions)
- **Database**: PostgreSQL (recommended: Neon, Supabase, or other serverless-friendly providers)

## Deployment Steps

### 1. Prerequisites
- GitHub repository with this code
- Vercel account
- PostgreSQL database (recommended providers: Neon, Supabase)

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - The `vercel.json` file already contains the build configuration
   - **Build Command**: `npm run build` (pre-configured)
   - **Output Directory**: `dist` (pre-configured)
   - **Install Command**: `npm install` (default)

### 3. Environment Variables
Add these environment variables in Vercel project settings:
- `DATABASE_URL`: Your Neon PostgreSQL connection string (postgresql://neondb_owner:...)
- `NODE_ENV`: `production`
- `PGHOST`: Your Neon database host
- `PGUSER`: Your Neon database user
- `PGDATABASE`: Your Neon database name
- `PGPASSWORD`: Your Neon database password

**Important**: Use the pooled connection URL from Neon for better performance in serverless environments.

### 4. Database Setup
- Use a serverless-friendly PostgreSQL provider (Neon, Supabase recommended)
- Ensure SSL is enabled for production connections
- The app will automatically create tables on first run

### 5. Security Features
- ✅ Password hashing with bcrypt
- ✅ No default credentials in production
- ✅ Secure database connections with SSL
- ✅ Input validation and error handling

## Development Mode
For local development:
```bash
# Frontend (runs on port 5000)
npm start

# API (if testing separately)
cd api && npm run dev
```

## Production Features
- SPA routing with proper fallback for React Router
- Serverless API functions
- Secure password authentication
- Environment-based configuration
- PostgreSQL with connection pooling

## Notes
- Default demo users (admin/staff1) are only created in development mode
- Production deployment requires manual user creation through the admin interface
- All API routes are prefixed with `/api/`
- Frontend automatically proxies API requests to the serverless functions