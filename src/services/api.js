import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Network error' };
  }
};

// Menu API
export const getMenu = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch menu' };
  }
};

export const addMenuItem = async (menuItem) => {
  try {
    const response = await api.post('/menu', menuItem);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to add menu item' };
  }
};

export const updateMenuStock = async (itemId, stock) => {
  try {
    const response = await api.put(`/menu/${itemId}/stock`, { stock });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update stock' };
  }
};

// Staff API
export const getStaff = async () => {
  try {
    const response = await api.get('/staff');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch staff' };
  }
};

export const addStaff = async (staffData) => {
  try {
    const response = await api.post('/staff', staffData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to add staff member' };
  }
};

// Orders API
export const getOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch orders' };
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create order' };
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Health check failed' };
  }
};

export default api;