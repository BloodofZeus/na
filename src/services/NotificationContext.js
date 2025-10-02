import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('shawarma-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('shawarma-notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not supported:', error);
    }
  };

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      time: 'Just now',
      read: false,
      priority: notification.priority || 'medium',
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 notifications
    setUnreadCount(prev => prev + 1);

    // Play sound for high priority notifications
    if (newNotification.priority === 'high') {
      playNotificationSound();
    }

    return newNotification.id;
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('shawarma-notifications');
  };

  // Update notification times
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          time: formatTimeAgo(new Date(notification.timestamp))
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Notification helper functions for different types
  const notifyOrder = (message, orderId, priority = 'high') => {
    return addNotification({
      type: 'order',
      message,
      priority,
      orderId
    });
  };

  const notifyInventory = (message, itemName, priority = 'high') => {
    return addNotification({
      type: 'inventory',
      message,
      priority,
      itemName
    });
  };

  const notifyStaff = (message, staffName, priority = 'medium') => {
    return addNotification({
      type: 'staff',
      message,
      priority,
      staffName
    });
  };

  const notifySystem = (message, priority = 'low') => {
    return addNotification({
      type: 'system',
      message,
      priority
    });
  };

  const notifySales = (message, amount, priority = 'medium') => {
    return addNotification({
      type: 'sales',
      message,
      priority,
      amount
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    notifyOrder,
    notifyInventory,
    notifyStaff,
    notifySystem,
    notifySales,
    formatTimeAgo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
