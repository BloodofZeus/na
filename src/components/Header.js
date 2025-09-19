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

  // Mock notification system for UI demonstration (ready for real-time integration)
  useEffect(() => {
    // Demo notifications - can be replaced with WebSocket/SSE for real-time updates
    const mockNotifications = [
      { id: 1, type: 'order', message: 'New order #1234 received', time: '2 min ago', read: false },
      { id: 2, type: 'system', message: 'Daily backup completed', time: '1 hour ago', read: true },
      { id: 3, type: 'inventory', message: 'Low stock alert: Chicken Shawarma', time: '3 hours ago', read: false },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
    
    // TODO: Replace with real-time notification subscription
    // Example: WebSocket connection, Server-Sent Events, or polling
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'fas fa-shopping-cart';
      case 'system': return 'fas fa-cog';
      case 'inventory': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-bell';
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
              src="/icons/logo.png" 
              alt="Shawarma Boss Logo" 
              className="brand-logo"
            />
          </div>
          <div className="brand-content">
            <h1 className="brand-title">
              Shawarma Boss
              <span className="brand-badge">POS</span>
            </h1>
            <p className="brand-subtitle d-none d-lg-block">Modern Point of Sale</p>
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
                      <h6>Notifications</h6>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-read-btn"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
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
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          >
                            <div className="notification-icon">
                              <i className={getNotificationIcon(notification.type)}></i>
                            </div>
                            <div className="notification-content">
                              <p className="notification-message">{notification.message}</p>
                              <span className="notification-time">{notification.time}</span>
                            </div>
                            {!notification.read && <div className="unread-dot"></div>}
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