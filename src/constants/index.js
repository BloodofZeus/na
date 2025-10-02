// ===== APP CONSTANTS =====

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  MENU: '/api/menu',
  MENU_ITEM: (id) => `/api/menu/${id}`,
  MENU_STOCK: (id) => `/api/menu/${id}/stock`,
  ORDERS: '/api/orders',
  STAFF: '/api/staff',
  RESET_POS: '/api/reset-pos',
  HEALTH: '/api/health',
};

// Cache Configuration
export const CACHE_CONFIG = {
  MENU_CACHE_NAME: 'shawarma-boss-menu-v1',
  ORDERS_CACHE_NAME: 'shawarma-boss-orders-v1',
  STATIC_CACHE_NAME: 'shawarma-boss-static-v1',
  CACHE_DURATION: 3600000, // 1 hour in milliseconds
};

// Stock Thresholds
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
  CRITICAL_STOCK: 2,
  REORDER_POINT: 10,
};

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  CRITICAL: 'critical',
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  MODAL: 300,
  TOAST: 3000,
  PAGE_TRANSITION: 400,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CASHIER: 'cashier',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'shawarma_boss_auth_token',
  USER_DATA: 'shawarma_boss_user',
  RECENT_ORDERS: 'shawarma_boss_recent_orders',
  CART: 'shawarma_boss_cart',
  THEME: 'shawarma_boss_theme',
  OFFLINE_ORDERS: 'shawarma_boss_offline_orders',
};

// Default Menu Items (for initialization/fallback)
export const DEFAULT_MENU_ITEMS = [
  {
    id: 1,
    name: 'Classic Shawarma',
    price: 15.00,
    stock: 20,
    category: 'Shawarma',
    is_available: true,
  },
  {
    id: 2,
    name: 'Chicken Shawarma',
    price: 18.00,
    stock: 15,
    category: 'Shawarma',
    is_available: true,
  },
  {
    id: 3,
    name: 'Beef Shawarma',
    price: 20.00,
    stock: 12,
    category: 'Shawarma',
    is_available: true,
  },
  {
    id: 4,
    name: 'Mixed Shawarma',
    price: 22.00,
    stock: 10,
    category: 'Shawarma',
    is_available: true,
  },
  {
    id: 5,
    name: 'Fries',
    price: 5.00,
    stock: 30,
    category: 'Sides',
    is_available: true,
  },
  {
    id: 6,
    name: 'Soft Drink',
    price: 3.00,
    stock: 50,
    category: 'Beverages',
    is_available: true,
  },
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Currency
export const CURRENCY = {
  CODE: 'GHS',
  SYMBOL: 'GHS',
  NAME: 'Ghanaian Cedi',
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/DD/YYYY HH:mm:ss',
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_ITEM_NAME_LENGTH: 2,
  MAX_ITEM_NAME_LENGTH: 100,
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
  MIN_STOCK: 0,
  MAX_STOCK: 10000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTHENTICATION_FAILED: 'Invalid username or password.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timed out. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  ORDER_CREATED: 'Order created successfully!',
  ITEM_ADDED: 'Item added successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
  STAFF_ADDED: 'Staff member added successfully!',
  STOCK_UPDATED: 'Stock updated successfully!',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Shawarma Boss POS',
  APP_VERSION: '1.0.0',
  DEVELOPER: 'FulPlan',
  SUPPORT_EMAIL: 'support@shawarmaboss.com',
  MAX_CART_ITEMS: 100,
  AUTO_LOGOUT_TIME: 3600000, // 1 hour
  SYNC_INTERVAL: 30000, // 30 seconds
};

// PWA Configuration
export const PWA_CONFIG = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_BACKGROUND_SYNC: true,
  ENABLE_OFFLINE_MODE: true,
  UPDATE_CHECK_INTERVAL: 60000, // 1 minute
};

export default {
  API_ENDPOINTS,
  CACHE_CONFIG,
  STOCK_THRESHOLDS,
  STOCK_STATUS,
  ANIMATION_DURATIONS,
  USER_ROLES,
  ORDER_STATUS,
  TOAST_TYPES,
  NOTIFICATION_PRIORITY,
  STORAGE_KEYS,
  DEFAULT_MENU_ITEMS,
  PAGINATION,
  CURRENCY,
  DATE_FORMATS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_CONFIG,
  PWA_CONFIG,
};
