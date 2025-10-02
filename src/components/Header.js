import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Enhanced notification system with real-time updates
  useEffect(() => {
    // Generate dynamic notifications with timestamps
    const generateNotifications = () => {
      const now = new Date();
      const notifications = [
        {
          id: 1,
          type: 'order',
          message: `New order #${Math.floor(Math.random() * 9999) + 1000} received`,
          time: formatTimeAgo(new Date(now.getTime() - 120000)),
          read: false,
          timestamp: now.getTime() - 120000,
          priority: 'high'
        },
        {
          id: 2,
          type: 'inventory',
          message: 'Low stock alert: Chicken Shawarma (3 left)',
          time: formatTimeAgo(new Date(now.getTime() - 300000)),
          read: false,
          timestamp: now.getTime() - 300000,
          priority: 'high'
        },
        {
          id: 3,
          type: 'system',
          message: 'Daily backup completed successfully',
          time: formatTimeAgo(new Date(now.getTime() - 3600000)),
          read: true,
          timestamp: now.getTime() - 3600000,
          priority: 'low'
        },
        {
          id: 4,
          type: 'order',
          message: `Order #${Math.floor(Math.random() * 9999) + 2000} completed`,
          time: formatTimeAgo(new Date(now.getTime() - 900000)),
          read: false,
          timestamp: now.getTime() - 900000,
          priority: 'medium'
        },
        {
          id: 5,
          type: 'staff',
          message: 'New staff member John Doe added to system',
          time: formatTimeAgo(new Date(now.getTime() - 7200000)),
          read: true,
          timestamp: now.getTime() - 7200000,
          priority: 'medium'
        },
        {
          id: 6,
          type: 'sales',
          message: 'Daily sales target achieved! GHS 2,500',
          time: formatTimeAgo(new Date(now.getTime() - 1800000)),
          read: false,
          timestamp: now.getTime() - 1800000,
          priority: 'medium'
        }
      ];
      
      // Sort by timestamp (newest first)
      return notifications.sort((a, b) => b.timestamp - a.timestamp);
    };
    
    const initialNotifications = generateNotifications();
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);
    
    // Simulate real-time notifications every 45 seconds
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: 'order',
          messages: [
            `New order #${Math.floor(Math.random() * 9999) + 1000} received`,
            `Order #${Math.floor(Math.random() * 9999) + 2000} ready for pickup`,
            `Payment confirmed for order #${Math.floor(Math.random() * 9999) + 3000}`
          ],
          priority: 'high'
        },
        {
          type: 'inventory',
          messages: [
            'Low stock alert: Beef Shawarma (2 left)',
            'Stock updated: Chicken Shawarma (+15 items)',
            'Inventory check required for Falafel Wrap'
          ],
          priority: 'high'
        },
        {
          type: 'system',
          messages: [
            'System maintenance completed',
            'Database backup successful',
            'Security update installed'
          ],
          priority: 'low'
        },
        {
          type: 'sales',
          messages: [
            `Sales milestone: GHS ${Math.floor(Math.random() * 1000) + 1500} today`,
            'Weekly sales report ready',
            'Best-selling item: Chicken Shawarma'
          ],
          priority: 'medium'
        },
        {
          type: 'staff',
          messages: [
            'Staff shift change reminder',
            'Training session scheduled for tomorrow',
            'Performance review completed'
          ],
          priority: 'medium'
        }
      ];
      
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];
      
      const newNotification = {
        id: Date.now(),
        type: randomType.type,
        message: randomMessage,
        time: 'Just now',
        read: false,
        timestamp: Date.now(),
        priority: randomType.priority
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 14)]); // Keep only 15 notifications
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound for high priority notifications
      if (randomType.priority === 'high') {
        playNotificationSound();
      }
    }, 45000); // New notification every 45 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-wrapper')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
      // Create a simple beep sound using Web Audio API
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
  
  // Mark individual notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'fas fa-shopping-cart';
      case 'system': return 'fas fa-cog';
      case 'inventory': return 'fas fa-exclamation-triangle';
      case 'sales': return 'fas fa-chart-line';
      case 'staff': return 'fas fa-users';
      default: return 'fas fa-bell';
    }
  };
  
  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'order';
      case 'system': return 'system';
      case 'inventory': return 'inventory';
      case 'sales': return 'sales';
      case 'staff': return 'staff';
      default: return 'system';
    }
  };

  return (
    <header className="modern-navbar">
      <div className="navbar-container">
        {/* Mobile Hamburger Menu */}
        {user && (
          <button 
            className="mobile-menu-toggle d-md-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        )}

        {/* Brand Section */}
        <button 
          className="navbar-brand" 
          onClick={() => handleNavigation('/')}
          aria-label="Go to home"
        >
          <div className="brand-icon">
            <img 
              src="/logo.png" 
              alt="Shawarma Boss Logo" 
              className="brand-logo"
            />
          </div>
          <div className="brand-content">
            <h1 className="brand-title">
              Shawarma Boss
              <span className="brand-badge">POS</span>
            </h1>
            <p className="brand-subtitle d-none d-lg-block">Taste The Boss Life</p>
          </div>
        </button>

        {user && (
          <>
            {/* Desktop Navigation Tabs */}
            <nav className="nav-tabs d-none d-md-flex" aria-label="Primary navigation">
              <div className="nav-tab-list">
                <button
                  onClick={() => handleNavigation('/')}
                  className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
                  title="POS Dashboard"
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  <div className="tab-icon">
                    <i className="fas fa-cash-register"></i>
                  </div>
                  <span className="tab-label">POS</span>
                </button>
                {user.role === 'admin' && (
                  <div className="nav-tab-dropdown">
                    <button
                      className={`nav-tab ${location.pathname === '/admin' ? 'active' : ''}`}
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      title="Admin Dashboard"
                      aria-current={location.pathname === '/admin' ? 'page' : undefined}
                    >
                      <div className="tab-icon">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <span className="tab-label">Admin</span>
                      <i className="fas fa-chevron-down ms-1"></i>
                    </button>
                    <ul className="dropdown-menu modern-dropdown">
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleNavigation('/admin?section=dashboard')}
                        >
                          <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleNavigation('/admin?section=staff')}
                        >
                          <i className="fas fa-users me-2"></i>Staff Management
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleNavigation('/admin?section=menu')}
                        >
                          <i className="fas fa-utensils me-2"></i>Menu Management
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleNavigation('/admin?section=orders')}
                        >
                          <i className="fas fa-receipt me-2"></i>Recent Orders
                        </button>
                      </li>
                      <li>
                        <button 
                          className="dropdown-item" 
                          onClick={() => handleNavigation('/admin?section=reports')}
                        >
                          <i className="fas fa-chart-bar me-2"></i>Reports & Export
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </nav>
            
            {/* Right Side Actions */}
            <div className="navbar-actions">
              {/* Notifications */}
              <div className="notification-wrapper">
                <button
                  className="notification-btn"
                  onClick={toggleNotifications}
                  title="Notifications"
                  aria-label="Show notifications"
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <div className="notification-header-content">
                        <h6>Notifications</h6>
                        <span className="notification-count">{notifications.length}</span>
                      </div>
                      <div className="notification-actions">
                        {unreadCount > 0 && (
                          <button 
                            className="mark-read-btn"
                            onClick={markAllAsRead}
                            title="Mark all as read"
                          >
                            <i className="fas fa-check-double me-1"></i>
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            className="clear-all-btn"
                            onClick={clearAllNotifications}
                            title="Clear all notifications"
                          >
                            <i className="fas fa-trash me-1"></i>
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <i className="fas fa-bell-slash"></i>
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${getNotificationColor(notification.type)} ${!notification.read ? 'unread' : ''} priority-${notification.priority || 'medium'}`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <div className="notification-icon">
                              <i className={getNotificationIcon(notification.type)}></i>
                            </div>
                            <div className="notification-content">
                              <p className="notification-message">{notification.message}</p>
                              <div className="notification-meta">
                                <span className="notification-time">{notification.time}</span>
                                {notification.priority === 'high' && (
                                  <span className="priority-badge high">
                                    <i className="fas fa-exclamation-circle"></i>
                                    High
                                  </span>
                                )}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="notification-actions-item">
                                <div className="unread-dot"></div>
                                <button 
                                  className="mark-read-single"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  title="Mark as read"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="user-details d-none d-lg-block">
                    <div className="user-name">{user.username}</div>
                    <div className={`user-role role-${user.role}`}>
                      <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                      {user.role}
                    </div>
                  </div>
                  
                  <div className="dropdown">
                    <button 
                      className="user-menu-btn" 
                      type="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      title="User Menu"
                    >
                      <i className="fas fa-chevron-down d-none d-md-inline"></i>
                      <i className="fas fa-ellipsis-v d-md-none"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end modern-dropdown">
                      <li className="dropdown-header">
                        <div className="dropdown-user-info">
                          <div className="dropdown-avatar">
                            <i className="fas fa-user-circle"></i>
                          </div>
                          <div>
                            <div className="dropdown-name">{user.username}</div>
                            <div className={`dropdown-role role-${user.role}`}>
                              <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          <div className="dropdown-item-content">
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Sign Out</span>
                          </div>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {user && (
        <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="mobile-user-details">
                <div className="mobile-user-name">{user.username}</div>
                <div className={`mobile-user-role role-${user.role}`}>
                  <i className={`fas ${user.role === 'admin' ? 'fa-crown' : 'fa-user'} me-1`}></i>
                  {user.role}
                </div>
              </div>
            </div>
          </div>
          
          <nav className="mobile-nav-list">
            <button
              onClick={() => handleNavigation('/')}
              className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="fas fa-cash-register"></i>
              <span>POS Dashboard</span>
            </button>
            {user.role === 'admin' && (
              <>
                <div className="mobile-nav-section">
                  <div className="mobile-nav-header">
                    <i className="fas fa-shield-alt"></i>
                    <span>Admin</span>
                  </div>
                  <div className="mobile-nav-items">
                    <button
                      onClick={() => handleNavigation('/admin?section=dashboard')}
                      className={`mobile-nav-subitem ${location.pathname === '/admin' && new URLSearchParams(location.search).get('section') === 'dashboard' ? 'active' : ''}`}
                    >
                      <i className="fas fa-tachometer-alt"></i>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/admin?section=staff')}
                      className={`mobile-nav-subitem ${location.pathname === '/admin' && new URLSearchParams(location.search).get('section') === 'staff' ? 'active' : ''}`}
                    >
                      <i className="fas fa-users"></i>
                      <span>Staff Management</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/admin?section=menu')}
                      className={`mobile-nav-subitem ${location.pathname === '/admin' && new URLSearchParams(location.search).get('section') === 'menu' ? 'active' : ''}`}
                    >
                      <i className="fas fa-utensils"></i>
                      <span>Menu Management</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/admin?section=orders')}
                      className={`mobile-nav-subitem ${location.pathname === '/admin' && new URLSearchParams(location.search).get('section') === 'orders' ? 'active' : ''}`}
                    >
                      <i className="fas fa-receipt"></i>
                      <span>Recent Orders</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/admin?section=reports')}
                      className={`mobile-nav-subitem ${location.pathname === '/admin' && new URLSearchParams(location.search).get('section') === 'reports' ? 'active' : ''}`}
                    >
                      <i className="fas fa-chart-bar"></i>
                      <span>Reports & Export</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="mobile-nav-divider"></div>
            <button className="mobile-nav-item logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Sign Out</span>
            </button>
          </nav>
        </div>
      )}
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>}
    </header>
  );
};

export default Header;