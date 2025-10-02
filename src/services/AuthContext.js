import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('shawarma_boss_current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('shawarma_boss_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      if (response.ok) {
        const userData = { username: response.username, role: response.role };
        setUser(userData);
        localStorage.setItem('shawarma_boss_current_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shawarma_boss_current_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};