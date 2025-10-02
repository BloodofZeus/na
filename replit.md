# Overview

Shawarma Boss POS is a modern Point of Sale system built with the MERN stack (MongoDB/PostgreSQL, Express.js, React, Node.js). It provides comprehensive POS functionality including user authentication, menu management, order processing, receipt generation, sales tracking, and real-time inventory management with role-based access control for admin and staff users. The system also features Progressive Web App (PWA) capabilities for offline functionality and an installable experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Context API** for state management (AuthContext, CartContext)
- **Axios** for API communication
- **Component-based architecture**
- **Responsive design** using Bootstrap 5 and custom CSS
- **Webpack** for bundling

## Backend Architecture
- **Express.js** providing RESTful API endpoints
- **PostgreSQL** as the primary database
- **Database initialization** with automatic table creation and data seeding
- **Role-based authentication** (admin and staff)
- **CORS enabled**
- **Environment variable configuration**
- **Static file serving** for React build and legacy PWA assets

## Data Storage Architecture
- **PostgreSQL tables**: users, menu, orders with relational structure
- **Backward compatibility** with localStorage data migration
- **JSON metadata storage** in JSONB fields
- **Automatic timestamp tracking**

## Authentication & Authorization
- **Session-based authentication** with localStorage persistence
- **Role-based access control** (admin, staff)
- **Password validation**

## Legacy PWA Support
- **Service worker** for offline functionality and caching
- **Web app manifest** for PWA installation
- **Dual architecture** supporting both modern React app and legacy vanilla JavaScript

## UI/UX Decisions
- Modern and clean interface with a focus on usability for POS operations.
- Admin panel provides detailed management views for staff and menu items.
- Visual cues like category badges and status indicators.

## Feature Specifications
- **Staff Management**: View/edit staff details, reset passwords, delete staff, assign roles, activate/deactivate, and POS system reset.
- **Menu Management**: View/edit item details, update price, change category, toggle availability, duplicate, and delete items.
- **PWA Features**: Offline functionality, installability, fast loading, reliable sync, real-time status, and native-like experience.
- **POS System Reset**: Admin-only factory reset to clear all orders, staff, and menu items - leaves system completely empty for admin to rebuild.

## System Design Choices
- Emphasis on modularity and reusability of components.
- Clear separation of concerns between frontend and backend.
- Robust error handling and user feedback mechanisms.
- Scalability considerations for database and server architecture.
- Offline-first approach for critical POS operations.

# External Dependencies

## Frontend Libraries
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icon library
- **Chart.js** - Data visualization
- **jsPDF** - PDF generation
- **QRious** - QR code generation

## Backend Dependencies
- **PostgreSQL (pg)** - Database driver
- **CORS** - Cross-origin resource sharing middleware
- **body-parser** - HTTP request body parsing middleware
- **dotenv** - Environment variable management

## Build Tools & Development
- **Webpack** - Module bundler
- **Babel** - JavaScript transpiler
- **React Scripts** - Create React App tooling

# Recent Changes

## Reset & Offline Functionality Updates (October 2, 2025)

### POS Reset Behavior Change
- Modified reset endpoint to leave system completely empty after reset
- Reset no longer creates default menu items or staff accounts  
- Admin users must manually add all menu items and staff after reset
- Only admin accounts are preserved (all staff accounts deleted during reset)
- Provides true clean slate for admins to set up custom menu and team

### Service Worker Resilience Fix
- Fixed Service Worker installation failures caused by blocked resources (403 errors)
- Changed from `cache.addAll()` to individual asset caching with error handling
- Service Worker now skips resources that return 403 or other errors gracefully
- PWA continues to work even when some assets can't be cached
- Added detailed console warnings for skipped or failed assets

## GitHub Import and Initial Setup (October 2, 2025)
- Successfully imported Shawarma Boss POS from GitHub to Replit
- Installed all npm dependencies (667 packages)
- Created Replit-managed PostgreSQL database
- Initialized database with tables: users, menu, orders
- Seeded default data: admin user (admin/admin123)
- Configured Full Stack Server workflow
- Verified all features working correctly