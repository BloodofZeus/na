# Shawarma Boss POS - Vercel Deployment Guide

## Project Structure

This project is optimized for Vercel deployment with the following structure:

```
├── api/                    # Serverless API functions
│   ├── health.js          # Health check endpoint
│   ├── login.js           # Authentication
│   ├── menu.js            # Menu management
│   ├── orders.js          # Order processing
│   ├── staff.js           # Staff management
│   ├── init-db.js         # Database initialization
│   └── _utils.js          # Shared utilities
├── src/                   # React frontend
├── dist/                  # Built frontend (generated)
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── vercel.json            # Vercel configuration
└── webpack.config.js      # Build configuration
```

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables for Neon Database:
- `DATABASE_URL` - Neon PostgreSQL connection string (primary)
- `NODE_ENV` - Set to "production" for production deployment

### Neon Database Variables (Optional):
- `DATABASE_URL_UNPOOLED` - Neon unpooled connection string
- `POSTGRES_URL` - Alternative Neon connection string
- `POSTGRES_URL_NON_POOLING` - Neon non-pooling connection
- `POSTGRES_USER` - Neon database username
- `POSTGRES_PASSWORD` - Neon database password
- `POSTGRES_HOST` - Neon database host
- `POSTGRES_DATABASE` - Neon database name

### Neon Auth Variables (if using Neon Auth):
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Neon project ID
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Neon publishable key
- `STACK_SECRET_SERVER_KEY` - Neon secret server key

## Deployment Steps

### 1. Database Setup
1. **Neon Database** (Recommended):
   - Create a Neon database at [neon.tech](https://neon.tech)
   - Copy your connection string from the Neon dashboard
   - Add it to Vercel environment variables as `DATABASE_URL`
   - The connection string should look like: `postgresql://username:password@host/database?sslmode=require`

### 2. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 3. Initialize Database
After deployment, make a POST request to `/api/init-db` to set up tables and default data.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/login` - User authentication
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Add menu item
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/staff` - Get staff members
- `POST /api/staff` - Add staff member
- `POST /api/init-db` - Initialize database

## Development

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Performance Optimizations

1. **Code Splitting**: Vendor and app code are split for better caching
2. **Asset Optimization**: Images and fonts are optimized with content hashing
3. **Serverless Functions**: Each API endpoint is a separate serverless function
4. **Database Connection Pooling**: Optimized for serverless environment
5. **Caching Headers**: Proper cache headers for static assets

## Security Features

1. **CORS Configuration**: Proper CORS headers for API endpoints
2. **Security Headers**: XSS protection, content type options, frame options
3. **Password Hashing**: bcrypt for secure password storage
4. **SQL Injection Protection**: Parameterized queries

## Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure `DATABASE_URL` is set correctly
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **API Errors**: Check Vercel function logs in dashboard
4. **CORS Issues**: API endpoints have proper CORS headers

### Debug Commands:
```bash
# Check build locally
npm run build

# Test API endpoints
curl https://your-app.vercel.app/api/health

# Check database initialization
curl -X POST https://your-app.vercel.app/api/init-db
```
