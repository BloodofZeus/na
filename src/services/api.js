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

export const updateMenuItem = async (itemId, itemData) => {
  try {
    const response = await api.patch('/menu', { id: itemId, ...itemData });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update menu item' };
  }
};

export const deleteMenuItem = async (itemId) => {
  try {
    const response = await api.delete('/menu', { data: { id: itemId } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete menu item' };
  }
};

export const duplicateMenuItem = async (itemId) => {
  try {
    const response = await api.post('/menu', { duplicateFrom: itemId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to duplicate menu item' };
  }
};

export const toggleMenuItemAvailability = async (itemId, isAvailable) => {
  try {
    const response = await api.patch('/menu', { id: itemId, is_available: isAvailable });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to toggle availability' };
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

export const updateStaff = async (username, staffData) => {
  try {
    const response = await api.put('/staff', { username, ...staffData });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update staff member' };
  }
};

export const deleteStaff = async (username) => {
  try {
    const response = await api.delete('/staff', { data: { username } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete staff member' };
  }
};

export const resetStaffPassword = async (username, newPassword) => {
  try {
    const response = await api.patch('/staff', { username, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to reset password' };
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
    console.log('API: Sending order data:', orderData);
    const response = await api.post('/orders', orderData);
    console.log('API: Order creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Order creation error:', error);
    console.error('API: Error response:', error.response);
    console.error('API: Error data:', error.response?.data);
    
    // Preserve the original error structure
    if (error.response?.data) {
      throw error.response.data;
    } else if (error.message) {
      throw { error: error.message };
    } else {
      throw { error: 'Failed to create order' };
    }
  }
};

export const resetStaffOrders = async (username) => {
  try {
    const response = await api.delete('/orders', { data: { staff: username } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to reset staff orders' };
  }
};

export const resetAllOrders = async () => {
  try {
    const response = await api.delete('/orders', { data: { action: 'reset-all' } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to reset all orders' };
  }
};

// POS Reset (Admin only)
export const resetPOS = async (adminUsername, adminPassword) => {
  try {
    const response = await api.post('/reset-pos', { adminUsername, adminPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to reset POS system' };
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