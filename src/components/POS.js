import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useCart } from '../services/CartContext';
import { useNotifications } from '../services/NotificationContext';
import { usePWA } from '../services/PWAContext';
import { getMenu, createOrder, updateMenuStock } from '../services/api';
import MenuGrid from './MenuGrid';
import Cart from './Cart';
import OrderModal from './OrderModal';
import OrderDetailsModal from './OrderDetailsModal';

const POS = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { notifyOrder, notifyInventory } = useNotifications();
  const { isOnline, dbManager, syncManager } = usePWA();
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('pos');

  // Load menu on mount and when returning to this route
  useEffect(() => {
    loadMenu();
    loadRecentOrders();
  }, [location.pathname]);

  // Also refresh menu when window gains focus (e.g., different browser tabs)
  useEffect(() => {
    const handleFocus = () => {
      loadMenu();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMenu();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      
      if (isOnline) {
        const menuData = await getMenu();
        setMenu(menuData);
        await dbManager.saveMenu(menuData);
        setError('');
      } else {
        const cachedMenu = await dbManager.getMenu();
        if (cachedMenu && cachedMenu.length > 0) {
          setMenu(cachedMenu);
          setError('📡 Offline - Using cached menu');
        } else {
          setError('⚠️ No menu available offline. Please connect to the internet.');
        }
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      
      try {
        const cachedMenu = await dbManager.getMenu();
        if (cachedMenu && cachedMenu.length > 0) {
          setMenu(cachedMenu);
          setError('📡 Connection failed - Using cached menu');
        } else {
          setError('Failed to load menu. Please refresh the page.');
        }
      } catch (dbError) {
        setError('Failed to load menu. Please refresh the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentOrders = () => {
    const stored = localStorage.getItem('shawarma_boss_recent_orders');
    if (stored) {
      try {
        setRecentOrders(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent orders:', error);
      }
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const order = {
      id: isOnline ? 'order-' + Date.now() + '-' + Math.floor(Math.random() * 1000) : 'offline-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user: user.username,
      staff: user.username,
      timestamp: new Date().toISOString(),
      items: cartItems,
      total: getCartTotal(),
      status: isOnline ? 'completed' : 'pending'
    };

    try {
      console.log('Creating order with data:', order);
      
      if (!isOnline) {
        await syncManager.saveOfflineOrder(order);
        console.log('Order saved offline:', order.id);
        
        notifyOrder(
          `📴 Offline order #${order.id.slice(-8)} saved - GHS ${order.total.toFixed(2)} (Will sync when online)`,
          order.id,
          'high'
        );

        const newRecentOrders = [{ ...order, offline: true }, ...recentOrders.slice(0, 4)];
        setRecentOrders(newRecentOrders);
        localStorage.setItem('shawarma_boss_recent_orders', JSON.stringify(newRecentOrders));

        setCurrentOrder({ ...order, offline: true });
        setShowOrderModal(true);
        clearCart();
        return;
      }
      
      // Save order to backend (online)
      const result = await createOrder(order);
      console.log('Order creation result:', result);

      // Update stock for each item and check for low stock
      for (const item of cartItems) {
        const menuItem = menu.find(m => m.id === item.id);
        if (menuItem && menuItem.stock >= item.quantity) {
          const newStock = menuItem.stock - item.quantity;
          await updateMenuStock(item.id, newStock);
          
          // Check for low stock and notify
          if (newStock <= 5 && newStock > 0) {
            notifyInventory(
              `Low stock alert: ${menuItem.name} (${newStock} left)`,
              menuItem.name,
              'high'
            );
          } else if (newStock === 0) {
            notifyInventory(
              `Out of stock: ${menuItem.name}`,
              menuItem.name,
              'high'
            );
          }
        }
      }

      // Update local menu state
      setMenu(prevMenu =>
        prevMenu.map(menuItem => {
          const cartItem = cartItems.find(item => item.id === menuItem.id);
          if (cartItem) {
            return {
              ...menuItem,
              stock: Math.max(0, menuItem.stock - cartItem.quantity)
            };
          }
          return menuItem;
        })
      );

      // Add order notification
      notifyOrder(
        `New order #${order.id.slice(-8)} created - GHS ${order.total.toFixed(2)}`,
        order.id,
        'high'
      );

      // Save to recent orders
      const newRecentOrders = [order, ...recentOrders.slice(0, 4)];
      setRecentOrders(newRecentOrders);
      localStorage.setItem('shawarma_boss_recent_orders', JSON.stringify(newRecentOrders));

      // Set current order and show modal
      setCurrentOrder(order);
      setShowOrderModal(true);

      // Clear cart
      clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.data,
        status: error.status,
        statusText: error.statusText,
        fullError: error
      });
      
      // Try to extract a meaningful error message
      let errorMessage = 'Unknown error';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status) {
        errorMessage = `HTTP ${error.status}: ${error.statusText || 'Request failed'}`;
      }
      
      // Add specific error message mapping for common issues
      if (errorMessage.includes('User not found')) {
        errorMessage = 'User not found. Please log in again.';
      } else if (errorMessage.includes('Database not initialized')) {
        errorMessage = 'Database not initialized. Please contact administrator.';
      } else if (errorMessage.includes('Database connection failed')) {
        errorMessage = 'Database connection failed. Please try again.';
      } else if (errorMessage.includes('foreign key constraint')) {
        errorMessage = 'User not found. Please log in again.';
      } else if (errorMessage.includes('relation "orders" does not exist')) {
        errorMessage = 'Database not initialized. Please contact administrator.';
      }
      
      alert(`Failed to create order: ${errorMessage}. Please try again.`);
    }
  };

  // Sidebar navigation items for staff dashboard
  const sidebarItems = [
    { id: 'pos', icon: 'fas fa-cash-register', label: 'Point of Sale' },
    { id: 'orders', icon: 'fas fa-receipt', label: 'Recent Orders' },
    { id: 'menu', icon: 'fas fa-utensils', label: 'Menu Items' },
    { id: 'stats', icon: 'fas fa-chart-line', label: 'Quick Stats' }
  ];

  // Calculate quick stats for staff dashboard
  const calculateStats = () => {
    const todayOrders = recentOrders.filter(order => {
      const orderDate = new Date(order.timestamp).toDateString();
      const today = new Date().toDateString();
      return orderDate === today;
    });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalItems = recentOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    return {
      totalOrders: recentOrders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalItems
    };
  };

  const stats = calculateStats();

  // Render different sections based on active selection
  const renderPOSSection = () => (
    <div className="pwa-pos-grid">
      {/* Menu Section */}
      <div className="pwa-menu-section">
        <div className="pwa-section-header">
          <div className="pwa-header-content">
            <div className="pwa-header-icon">
              <i className="fas fa-utensils"></i>
            </div>
            <div className="pwa-header-text">
              <h5 className="pwa-section-title">Menu Items</h5>
              <span className="pwa-section-subtitle">{menu.length} items available</span>
            </div>
          </div>
          <div className="pwa-header-actions">
            <button
              onClick={loadMenu}
              className="pwa-refresh-btn"
              title="Refresh menu"
            >
              <i className="fas fa-sync"></i>
            </button>
          </div>
        </div>
        <div className="pwa-menu-container">
          <MenuGrid menu={menu} />
        </div>
      </div>

      {/* Cart Section */}
      <div className="pwa-cart-section">
        <div className="pwa-section-header">
          <div className="pwa-header-content">
            <div className="pwa-header-icon pwa-cart-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="pwa-header-text">
              <h5 className="pwa-section-title">Current Order</h5>
              <span className="pwa-section-subtitle">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
          </div>
          <div className="pwa-cart-total">
            <span className="pwa-total-label">Total</span>
            <span className="pwa-total-amount">GHS {getCartTotal().toFixed(2)}</span>
          </div>
        </div>
        <div className="pwa-cart-container">
          <Cart onConfirmOrder={handleConfirmOrder} />
        </div>
      </div>
    </div>
  );

  const renderRecentOrdersSection = () => (
    <div className="card">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-clock me-2"></i>
          Recent Orders
        </h5>
      </div>
      <div className="card-body">
        {recentOrders.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
            <h6>No recent orders</h6>
            <p className="mb-0">Orders will appear here as they are created</p>
          </div>
        ) : (
          <div className="row g-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="col-md-6 col-lg-4">
                <div 
                  className="card border hover-card cursor-pointer"
                  onClick={() => handleViewOrderDetails(order)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = '#dc3545';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">#{order.id.slice(-6)}</h6>
                      <span className="badge bg-success">Completed</span>
                    </div>
                    <p className="text-muted small mb-2">
                      {new Date(order.timestamp).toLocaleString()}
                    </p>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">{order.items?.length || 0} items</span>
                      <span className="fw-bold text-success">GHS {parseFloat(order.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-3 text-center">
                      <small className="text-primary">
                        <i className="fas fa-eye me-1"></i>
                        Click to view details
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMenuSection = () => (
    <div className="card">
      <div className="card-header bg-warning text-white">
        <h5 className="mb-0">
          <i className="fas fa-utensils me-2"></i>
          Menu Items Overview
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {menu.map((item) => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="card-title">{item.name}</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-success fw-bold">GHS {parseFloat(item.price || 0).toFixed(2)}</span>
                    <span className={`badge ${item.stock <= 0 ? 'bg-danger' : item.stock <= 5 ? 'bg-warning' : 'bg-success'}`}>
                      Stock: {item.stock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatsSection = () => (
    <div className="space-y-6">
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.totalOrders}</div>
            <div className="text-sm text-muted">Total Orders</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-success bg-opacity-10 border border-success border-opacity-20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success mb-1">{stats.todayOrders}</div>
            <div className="text-sm text-muted">Today's Orders</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-warning bg-opacity-10 border border-warning border-opacity-20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-warning mb-1">GHS {stats.todayRevenue.toFixed(2)}</div>
            <div className="text-sm text-muted">Today's Revenue</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-danger bg-opacity-10 border border-danger border-opacity-20 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-danger mb-1">{stats.totalItems}</div>
            <div className="text-sm text-muted">Items Sold</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Performance Overview</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <i className="fas fa-user-check fa-3x text-success mb-3"></i>
            <h6>Logged in as: {user.username}</h6>
            <p className="text-muted mb-0">Keep up the great work!</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return renderRecentOrdersSection();
      case 'menu':
        return renderMenuSection();
      case 'stats':
        return renderStatsSection();
      case 'pos':
      default:
        return renderPOSSection();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner"></div>
        <span className="ml-2">Loading menu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="text-danger mb-4">{error}</div>
          <button 
            onClick={loadMenu}
            className="btn btn-danger"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pwa-staff-layout fade-in">
      {/* PWA Navigation Tabs - Mobile First */}
      <div className="pwa-nav-tabs">
        <div className="pwa-nav-container">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`pwa-nav-tab ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="pwa-tab-icon">
                <i className={item.icon}></i>
              </div>
              <span className="pwa-tab-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PWA Main Content */}
      <div className="pwa-main-content">
        {/* PWA Header */}
        <div className="pwa-main-header">
          <div className="pwa-header-info">
            <h2 className="pwa-main-title">
              <i className={`${sidebarItems.find(item => item.id === activeSection)?.icon || 'fas fa-dashboard'}`}></i>
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h2>
            <p className="pwa-main-subtitle">
              {activeSection === 'pos' && 'Create orders and manage transactions'}
              {activeSection === 'orders' && 'View all recent order history'}
              {activeSection === 'menu' && 'Browse available menu items'}
              {activeSection === 'stats' && 'View performance statistics'}
            </p>
          </div>
          <div className="pwa-header-user">
            <div className="pwa-user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="pwa-user-info">
              <span className="pwa-user-name">{user.username}</span>
              <span className="pwa-user-role">Staff Member</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="pwa-content-area">
          {renderContent()}
        </div>
      </div>

      {/* Order Success Modal */}
      {showOrderModal && currentOrder && (
        <OrderModal
          order={currentOrder}
          onClose={() => {
            setShowOrderModal(false);
            setCurrentOrder(null);
          }}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderDetailsModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default POS;