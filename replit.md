# Overview

Shawarma Boss POS is a modern Point of Sale system built with the MERN stack (MongoDB/PostgreSQL, Express.js, React, Node.js). Originally developed as a vanilla JavaScript PWA stored in localStorage, it has been transformed into a full-stack application with a React frontend, Express.js backend, and PostgreSQL database. The system provides comprehensive POS functionality including user authentication, menu management, order processing, receipt generation, sales tracking, and real-time inventory management with role-based access control for admin and staff users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with functional components and hooks for the user interface
- **React Router** for client-side navigation between POS and admin views
- **Context API** for state management (AuthContext for user sessions, CartContext for shopping cart)
- **Axios** for HTTP client communication with the backend API
- **Component-based architecture** with reusable components (Header, Login, POS, Admin, Cart, MenuGrid, OrderModal)
- **Responsive design** using Bootstrap 5 and custom CSS with mobile-first approach
- **Webpack** for module bundling and build process with hot reloading in development

## Backend Architecture
- **Express.js** web server providing RESTful API endpoints
- **PostgreSQL** as the primary database with ACID compliance
- **Database initialization** with automatic table creation and default data seeding
- **Role-based authentication** with admin and staff user roles
- **CORS enabled** for cross-origin requests (required for Replit proxy)
- **Environment variable configuration** for database connection and deployment flexibility
- **Static file serving** for both React build artifacts and legacy PWA assets

## Data Storage Architecture
- **PostgreSQL tables**: users, menu, orders with proper relational structure
- **Backward compatibility** with localStorage data migration for existing installations
- **JSON metadata storage** in JSONB fields for flexible data extension
- **Automatic timestamp tracking** for created_at and updated_at fields

## Authentication & Authorization
- **Session-based authentication** with localStorage persistence
- **Role-based access control** (admin can access all features, staff limited to POS functionality)
- **Token-based API authentication** for external server sync (optional)
- **Password validation** with secure credential handling

## Legacy PWA Support
- **Service worker** for offline functionality and caching
- **Web app manifest** for PWA installation capabilities
- **Progressive enhancement** approach maintaining offline-first functionality
- **Dual architecture** supporting both modern React app and legacy vanilla JavaScript

# External Dependencies

## Frontend Libraries
- **Bootstrap 5** - CSS framework for responsive UI components
- **Font Awesome** - Icon library for UI elements
- **Chart.js** - Data visualization for sales analytics and reporting
- **jsPDF** - PDF generation for receipts and reports
- **QRious** - QR code generation for receipts

## Backend Dependencies
- **PostgreSQL (pg)** - Primary database driver and connection pooling
- **CORS** - Cross-origin resource sharing middleware
- **body-parser** - HTTP request body parsing middleware
- **dotenv** - Environment variable configuration management

## Build Tools & Development
- **Webpack** - Module bundler with Babel transpilation
- **Babel** - JavaScript transpiler for React JSX and modern JavaScript features
- **React Scripts** - Create React App tooling for development workflow

## Database Configuration
- **PostgreSQL connection** with environment variable configuration
- **SSL support** for production deployments
- **Connection pooling** for efficient database resource management
- **Automatic failover** to localhost development database

## Deployment Support
- **Environment-based configuration** for development and production
- **Static file serving** for single-server deployment
- **Port configuration** with fallback to port 5000
- **Database URL parsing** for various hosting providers (Railway, Render, Fly.io)

# Replit Environment Setup (October 2025)

## Development Configuration
- **Frontend**: Webpack dev server on port 5000 (0.0.0.0) with proxy to backend
- **Backend**: Express.js server on port 3001 (localhost)
- **Database**: Replit-managed PostgreSQL database
- **Workflow**: Single "Full Stack Server" workflow runs both frontend and backend using concurrently

## Environment Variables (Auto-configured by Replit)
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Database credentials

## Database Initialization
- Run POST request to `/api/init-db` to create tables and seed default data
- Default users: admin/admin123 (admin role), staff1/staff123 (staff role)
- Creates tables: users, menu, orders with proper indexes

## Production Deployment
- Build command: `npm run build` (creates optimized bundle in /dist)
- Run command: `node server.js` (serves static files and API)
- Deployment target: Autoscale (stateless application)

# Recent Changes

## GitHub Import Setup (October 2, 2025)
- Successfully imported Shawarma Boss POS from GitHub to Replit
- Created and configured PostgreSQL database with Replit's managed database service
- Initialized database with default users (admin/admin123, staff1/staff123) and menu items
- Configured Full Stack Server workflow to run both frontend (port 5000) and backend (port 3001)
- Set up deployment configuration for production (autoscale with build and run commands)
- Verified all API endpoints are working correctly
- Frontend is properly configured with allowedHosts: 'all' for Replit's proxy environment

## Bug Fixes (October 2, 2025)
- **Staff Deletion Foreign Key Fix**: Fixed staff deletion error by nullifying orders.staff field before deleting users. This prevents foreign key constraint violations when deleting staff members who have associated orders.
- **Login Error Messages**: Improved login error handling with user-friendly messages ("Invalid username or password" instead of generic errors). Added toast notifications for login success and failure with clear feedback.
- **Login Success Notification**: Added welcome toast notification when users successfully log in, showing "Welcome back, [username]!"

## Enhanced Admin Panel Features

### Staff Management
- **View/Edit Staff Details** - Modal interface for viewing and editing staff information
- **Reset Password** - Direct password reset functionality for staff members
- **Delete Staff** - Remove staff members with confirmation dialog
- **Assign Roles** - Ability to change staff roles (admin/staff) via StaffDetailsModal
- **Activate/Deactivate** - Toggle staff member active status
- **POS System Reset** - Factory reset feature for admins to clear all test/trial data and start fresh
  - Deletes all orders
  - Removes all staff users (except admins)
  - Resets menu items to defaults
  - Creates default staff account (staff1/staff123)
  - Requires admin password verification for security
  - Triple confirmation (2 warnings + password prompt)

### Menu Items Management
- **View/Edit Details** - Comprehensive modal (MenuDetailsModal) for viewing and editing menu items
- **Update Price** - Direct price modification for menu items
- **Change Category** - Categorize items (General, Shawarma, Wraps, Sides, Drinks, Desserts)
- **Toggle Availability** - Mark items as available/unavailable (out of stock) independently of inventory
- **Duplicate Item** - Quick duplication of menu items with "(Copy)" suffix
- **Delete Item** - Remove menu items with confirmation dialog
- **Category Display** - Visual category badges in menu table
- **Stock Management** - In-line stock quantity updates with immediate database sync

### Backend API Enhancements
- **PATCH /api/menu** - Update menu item details (name, price, category, availability)
- **DELETE /api/menu** - Remove menu items from database
- **POST /api/menu** (duplicate) - Clone existing menu items
- **Enhanced GET /api/menu** - Returns category and availability status
- **POST /api/reset-pos** - Factory reset endpoint (admin-only, password-verified)
- **Full CRUD operations** - Complete Create, Read, Update, Delete for both staff and menu items

## POS System Reset Feature (October 2, 2025)
Added comprehensive factory reset functionality for admins to start with a clean operating state:
- **Security**: Requires admin username + password verification using bcrypt
- **Authorization**: Role-checked to ensure only admin users can trigger reset
- **Transaction Safety**: All operations wrapped in database transaction (BEGIN/COMMIT/ROLLBACK)
- **User Confirmation**: Triple-layer confirmation (2 warnings + password prompt) to prevent accidental resets
- **Factory Reset Actions**:
  - Clears all orders (complete order history deletion)
  - Removes all staff users except admin accounts
  - Deletes all menu items and resets to 3 default shawarma items
  - Creates default staff account (staff1/staff123)
- **UI Location**: Admin Panel → Staff Management section (visible only to admin role)
- **Use Case**: Perfect for clearing test data or resetting shop to fresh state

## Progressive Web App (PWA) Implementation (October 2, 2025)
Transformed Shawarma Boss POS into a complete Progressive Web App with offline-first capabilities:

### PWA Infrastructure
- **Service Worker** (`public/service-worker.js`)
  - Cache-first strategy for static assets (HTML, CSS, JS, images, fonts)
  - Network-first with fallback for API calls
  - Automatic cache versioning and cleanup
  - Background sync support for offline order processing
  - Offline fallback page for unavailable routes
- **Web App Manifest** (`public/manifest.json`)
  - Installability support for mobile and desktop
  - Custom app icons (192x192, 512x512)
  - Standalone display mode for native app experience
  - Themed splash screens and UI

### Offline Data Management
- **IndexedDB Storage** (`src/services/db.js`)
  - Four object stores: orders, menu, staff, syncQueue
  - Offline order storage with automatic sync when online
  - Menu and staff data caching for offline access
  - Sync queue for reliable data synchronization
  - Uses numeric keys (0/1) for synced field to ensure IndexedDB compatibility
- **Sync Manager** (`src/services/sync.js`)
  - Automatic background sync when network becomes available
  - Manual sync trigger for pending orders
  - Retry logic for failed syncs with exponential backoff
  - Real-time pending order count tracking
  - Event-driven sync notifications

### Network Management
- **Network Status Monitor** (`src/services/network.js`)
  - Real-time online/offline detection
  - Observable pattern for network state changes
  - Automatic reconnection handling
  - Browser and service worker integration

### PWA Context & UI
- **PWA Context Provider** (`src/services/PWAContext.js`)
  - Global PWA state management using React Context API
  - Service worker registration and lifecycle management
  - Install prompt handling for "Add to Home Screen"
  - Centralized network status and sync state
- **PWA Status Component** (`src/components/PWAStatus.js`)
  - Visual network status indicator (online/offline)
  - Pending orders count badge
  - Install app button when available
  - Sync status with manual sync trigger
  - Floating action button design for easy access

### Webpack Configuration Updates
- **Copy Plugin** - Automatically copies service worker to dist folder in both development and production
- **Public Assets** - Proper handling of manifest.json and icons
- **Source Maps** - Enhanced debugging support for PWA features

### Features & Benefits
- **Works Offline** - Full POS functionality without internet connection
- **Installable** - Can be installed on mobile/desktop home screen
- **Fast Loading** - Cached assets load instantly
- **Reliable Sync** - Orders never lost, automatically sync when online
- **Real-time Status** - Always know connection and sync status
- **Native Experience** - Runs like a native app when installed