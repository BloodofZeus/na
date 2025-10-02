import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStaff, addStaff, getMenu, addMenuItem, updateMenuItem, deleteMenuItem, getOrders, resetPOS } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { useToast } from './ToastContainer';
import { useNotifications } from '../services/NotificationContext';
import StaffDetailsModal from './StaffDetailsModal';
import MenuDetailsModal from './MenuDetailsModal';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';

const Admin = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { notifyStaff, notifyInventory, notifySystem } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showStaffDetailsModal, setShowStaffDetailsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showMenuDetailsModal, setShowMenuDetailsModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Get active section from URL query parameters
  const getActiveSection = () => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    return section && ['dashboard', 'staff', 'menu', 'orders', 'reports'].includes(section) 
      ? section 
      : 'dashboard';
  };

  const activeSection = getActiveSection();

  // Function to navigate to different admin sections
  const navigateToSection = (section) => {
    navigate(`/admin?section=${section}`);
  };

  // Form states
  const [newStaff, setNewStaff] = useState({ username: '', password: '', role: 'staff' });
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', stock: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  // Mobile detection and responsive handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when section changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeSection]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [staffData, menuData, ordersData] = await Promise.all([
        getStaff(),
        getMenu(),
        getOrders()
      ]);
      setStaff(staffData);
      setMenu(menuData);
      setOrders(ordersData);
      setError('');
      
      // Check for low stock items and notify
      const lowStockItems = menuData.filter(item => item.stock <= 5 && item.stock > 0);
      const outOfStockItems = menuData.filter(item => item.stock === 0);
      
      if (lowStockItems.length > 0) {
        lowStockItems.forEach(item => {
          notifyInventory(
            `Low stock alert: ${item.name} (${item.stock} left)`,
            item.name,
            'high'
          );
        });
      }
      
      if (outOfStockItems.length > 0) {
        outOfStockItems.forEach(item => {
          notifyInventory(
            `Out of stock: ${item.name}`,
            item.name,
            'high'
          );
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.username || !newStaff.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addStaff(newStaff);
      await loadAllData();
      setNewStaff({ username: '', password: '', role: 'staff' });
      showSuccess('Staff member added successfully!');
      
      // Add notification for new staff
      notifyStaff(
        `New ${newStaff.role} added: ${newStaff.username}`,
        newStaff.username,
        'medium'
      );
    } catch (error) {
      console.error('Error adding staff:', error);
      showError('Failed to add staff member');
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.stock) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const menuItemData = {
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        stock: parseInt(newMenuItem.stock)
      };
      
      await addMenuItem(menuItemData);
      await loadAllData();
      setNewMenuItem({ name: '', price: '', stock: '' });
      showSuccess('Menu item added successfully!');
      
      // Add notification for new menu item
      notifyInventory(
        `New menu item added: ${menuItemData.name} (${menuItemData.stock} in stock)`,
        menuItemData.name,
        'medium'
      );
    } catch (error) {
      console.error('Error adding menu item:', error);
      showError('Failed to add menu item');
    }
  };


  const handleViewStaffDetails = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowStaffDetailsModal(true);
  };

  const handleStaffUpdate = async () => {
    await loadAllData();
  };

  const handleStaffDelete = async () => {
    await loadAllData();
  };


  const handleViewMenuDetails = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowMenuDetailsModal(true);
  };

  const handleMenuRefresh = async () => {
    await loadAllData();
  };

  const handleUpdateMenuItem = async (itemId, itemData) => {
    try {
      await updateMenuItem(itemId, itemData);
      await loadAllData();
      
      // Add notification for menu item update
      notifyInventory(
        `Menu item updated: ${itemData.name}`,
        itemData.name,
        'low'
      );
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    try {
      // Get item name before deletion for notification
      const item = menu.find(m => m.id === itemId);
      const itemName = item ? item.name : 'Unknown item';
      
      await deleteMenuItem(itemId);
      await loadAllData();
      
      // Add notification for menu item deletion
      notifySystem(
        `Menu item deleted: ${itemName}`,
        'medium'
      );
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };


  const exportData = () => {
    const data = {
      staff,
      menu,
      orders,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shawarma-boss-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csvContent = [
      ['Order ID', 'Staff', 'Date', 'Total', 'Items'].join(','),
      ...orders.map(order => [
        order.id,
        order.staff,
        order.timestamp,
        order.total,
        order.payload ? order.payload.items?.map(item => `${item.name} x${item.quantity}`).join(';') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetPOS = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL test data including:\n\n' +
      '• All orders\n' +
      '• All staff users (except admins)\n' +
      '• All menu items (will be reset to defaults)\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you sure you want to reset the POS system?'
    );

    if (!confirmed) return;

    const doubleCheck = window.confirm(
      '🚨 FINAL CONFIRMATION\n\n' +
      'You are about to reset the entire POS system to factory settings.\n\n' +
      'Click OK to proceed with the reset.'
    );

    if (!doubleCheck) return;

    // Prompt for admin password for security
    const adminPassword = window.prompt(
      '🔐 SECURITY CHECK\n\n' +
      'Please enter your admin password to confirm this action:'
    );

    if (!adminPassword) {
      showError('Password is required to reset the POS system');
      return;
    }

    try {
      setIsLoading(true);
      const result = await resetPOS(user.username, adminPassword);
      await loadAllData();
      
      showSuccess(
        `POS system reset successfully! ` +
        `Deleted ${result.details.ordersDeleted} orders, ` +
        `${result.details.staffDeleted} staff members. ` +
        `Menu reset to ${result.details.menuItemsCreated} default items.`
      );
      
      notifySystem('POS system has been reset to factory settings', 'high');
    } catch (error) {
      console.error('Error resetting POS:', error);
      showError(error.error || 'Failed to reset POS system');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate sales stats
  const salesStats = React.useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const staffSales = {};
    orders.forEach(order => {
      if (!staffSales[order.staff]) {
        staffSales[order.staff] = { orders: 0, total: 0 };
      }
      staffSales[order.staff].orders++;
      staffSales[order.staff].total += Number(order.total || 0);
    });

    return {
      totalOrders: orders.length,
      totalSales,
      todayOrders: todayOrders.length,
      todaySales,
      staffSales
    };
  }, [orders]);

  const renderDashboard = () => (
    <div className="dashboard-container">
      {/* KPI Grid Cards */}
      <div className="kpi-grid d-flex flex-wrap gap-3 mb-4">
        <div className="kpi-card flex-fill">
          <div className="kpi-icon bg-primary">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-value text-primary">{salesStats.totalOrders}</div>
            <div className="kpi-label">Total Orders</div>
          </div>
        </div>
        <div className="kpi-card flex-fill">
          <div className="kpi-icon bg-success">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-value text-success">GHS {salesStats.totalSales.toFixed(2)}</div>
            <div className="kpi-label">Total Sales</div>
          </div>
        </div>
        <div className="kpi-card flex-fill">
          <div className="kpi-icon bg-warning">
            <i className="fas fa-clock"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-value text-warning">{salesStats.todayOrders}</div>
            <div className="kpi-label">Today's Orders</div>
          </div>
        </div>
        <div className="kpi-card flex-fill">
          <div className="kpi-icon bg-info">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="kpi-content">
            <div className="kpi-value text-info">GHS {salesStats.todaySales.toFixed(2)}</div>
            <div className="kpi-label">Today's Sales</div>
          </div>
        </div>
      </div>
      
      {/* Responsive Grid Layout for Staff and Stock */}
      <div className="admin-grid-layout d-flex flex-column flex-lg-row gap-4">
        {/* Staff Performance Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-users me-2"></i>
              Staff Performance
            </h4>
          </div>
          <div className="panel-body">
            <div className="staff-grid d-flex flex-wrap gap-3">
              {staff.map((member) => (
                <div key={member.username} className="staff-card flex-fill">
                  <div className="staff-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="staff-info">
                    <div className="staff-name">{member.username}</div>
                    <div className="staff-role">{member.role}</div>
                  </div>
                  {salesStats.staffSales[member.username] && (
                    <div className="staff-stats">
                      <div className="stat-orders">{salesStats.staffSales[member.username].orders}</div>
                      <div className="stat-sales">GHS {salesStats.staffSales[member.username].total.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Alerts Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Stock Alerts
            </h4>
          </div>
          <div className="panel-body">
            {menu.filter(item => item.stock <= 5).length === 0 ? (
              <div className="no-alerts">
                <i className="fas fa-check-circle"></i>
                <span>All items are well stocked</span>
              </div>
            ) : (
              <div className="stock-alerts d-flex flex-column gap-2">
                {menu.filter(item => item.stock <= 5).map(item => (
                  <div key={item.id} className={`stock-alert ${item.stock === 0 ? 'critical' : 'warning'}`}>
                    <div className="alert-icon">
                      <i className={`fas ${item.stock === 0 ? 'fa-times-circle' : 'fa-exclamation-triangle'}`}></i>
                    </div>
                    <div className="alert-content">
                      <div className="alert-title">{item.name}</div>
                      <div className="alert-message">{item.stock === 0 ? 'Out of stock' : `${item.stock} left`}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="staff-management-container">
      <div className="admin-grid-layout d-flex flex-column flex-xl-row gap-4">
        {/* Staff List Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-users me-2"></i>
              Staff Members
            </h4>
          </div>
          <div className="panel-body">
            <div className="staff-management-grid d-flex flex-wrap gap-3">
              {staff.map((member) => (
                <div key={member.username} className="staff-management-card flex-fill">
                  <div className="staff-card-header">
                    <div className="staff-avatar large">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="staff-badge">
                      <span className={`badge ${member.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {member.role}
                      </span>
                      {!member.is_active && (
                        <span className="badge bg-secondary ms-1">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="staff-card-body">
                    <div className="staff-name">{member.username}</div>
                    {salesStats.staffSales[member.username] && (
                      <div className="staff-performance">
                        <div className="performance-item">
                          <span className="performance-label">Orders:</span>
                          <span className="performance-value">{salesStats.staffSales[member.username].orders}</span>
                        </div>
                        <div className="performance-item">
                          <span className="performance-label">Sales:</span>
                          <span className="performance-value text-success">GHS {salesStats.staffSales[member.username].total.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="staff-card-actions">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => handleViewStaffDetails(member)}
                      title="View/Edit Details"
                    >
                      <i className="fas fa-user-edit me-2"></i>
                      Manage Staff
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Add Staff Form Panel */}
        <div className="admin-panel" style={{minWidth: '320px'}}>
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-user-plus me-2"></i>
              Add New Staff
            </h4>
          </div>
          <div className="panel-body">
            <form onSubmit={handleAddStaff} className="add-staff-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="form-control"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-danger w-100">
                <i className="fas fa-user-plus me-2"></i>
                Add Staff Member
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POS Reset Panel - Admin Only */}
      {user.role === 'admin' && (
        <div className="admin-panel bg-light border-danger mt-4">
          <div className="panel-header bg-danger text-white">
            <h4 className="panel-title">
              <i className="fas fa-exclamation-triangle me-2"></i>
              POS System Reset
            </h4>
          </div>
          <div className="panel-body">
            <div className="alert alert-warning mb-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Warning:</strong> This will delete all test data and reset the POS to factory settings.
            </div>
            <div className="reset-info mb-3">
              <h6 className="text-danger mb-2">This action will:</h6>
              <ul className="reset-list">
                <li><i className="fas fa-times-circle text-danger me-2"></i>Delete all orders</li>
                <li><i className="fas fa-times-circle text-danger me-2"></i>Remove all staff users (except admins)</li>
                <li><i className="fas fa-times-circle text-danger me-2"></i>Reset menu items to defaults</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Create default staff account</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Create default menu items</li>
              </ul>
            </div>
            <button 
              className="btn btn-danger w-100"
              onClick={handleResetPOS}
              disabled={isLoading}
            >
              <i className="fas fa-redo me-2"></i>
              {isLoading ? 'Resetting...' : 'Reset POS System'}
            </button>
            <div className="text-muted small mt-2 text-center">
              <i className="fas fa-shield-alt me-1"></i>
              Admin-only action with double confirmation
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMenuManagement = () => (
    <div className="menu-management-container">
      <div className="admin-grid-layout d-flex flex-column flex-xl-row gap-4">
        {/* Menu Items Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-utensils me-2"></i>
              Menu Items
            </h4>
          </div>
          <div className="panel-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item.id} className={!item.is_available ? 'table-secondary' : ''}>
                      <td className="fw-medium">
                        {item.name}
                        {!item.is_available && <span className="ms-2 badge bg-secondary">Unavailable</span>}
                      </td>
                      <td>
                        <span className="badge bg-info">{item.category || 'General'}</span>
                      </td>
                      <td>GHS {parseFloat(item.price || 0).toFixed(2)}</td>
                      <td>
                        <span className="fw-bold">{item.stock}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.stock <= 0 ? 'bg-danger' : item.stock <= 5 ? 'bg-warning' : 'bg-success'}`}>
                          {item.stock <= 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewMenuDetails(item)}
                          title="Manage Item"
                        >
                          <i className="fas fa-cog me-1"></i>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Add Menu Item Panel */}
        <div className="admin-panel" style={{minWidth: '320px'}}>
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-plus me-2"></i>
              Add New Item
            </h4>
          </div>
          <div className="panel-body">
            <form onSubmit={handleAddMenuItem} className="add-menu-form">
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  placeholder="Enter stock quantity"
                  value={newMenuItem.stock}
                  onChange={(e) => setNewMenuItem({...newMenuItem, stock: e.target.value})}
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-danger w-100">
                <i className="fas fa-plus me-2"></i>
                Add Item
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentOrders = () => (
    <div className="orders-container">
      <div className="admin-panel">
        <div className="panel-header">
          <h4 className="panel-title">
            <i className="fas fa-receipt me-2"></i>
            Recent Orders
          </h4>
        </div>
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Staff</th>
                  <th>Date & Time</th>
                  <th>Total</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.id.slice(-8)}</td>
                    <td>{order.staff}</td>
                    <td>{new Date(order.timestamp).toLocaleString()}</td>
                    <td className="fw-bold text-success">GHS {parseFloat(order.total || 0).toFixed(2)}</td>
                    <td className="text-sm">
                      {order.payload?.items?.slice(0, 2).map(item => item.name).join(', ')}
                      {order.payload?.items?.length > 2 && '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-inbox fa-3x mb-3 text-muted"></i>
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsExport = () => (
    <div className="reports-container">
      <div className="admin-grid-layout d-flex flex-column flex-lg-row gap-4">
        {/* Export Options Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-download me-2"></i>
              Export Options
            </h4>
          </div>
          <div className="panel-body">
            <div className="d-grid gap-3">
              <button onClick={exportData} className="btn btn-outline-danger">
                <i className="fas fa-download me-2"></i>
                Export JSON Data
              </button>
              <button onClick={exportCSV} className="btn btn-outline-danger">
                <i className="fas fa-file-csv me-2"></i>
                Export Orders CSV
              </button>
              <button onClick={loadAllData} className="btn btn-outline-danger">
                <i className="fas fa-sync-alt me-2"></i>
                Refresh All Data
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Panel */}
        <div className="admin-panel flex-fill">
          <div className="panel-header">
            <h4 className="panel-title">
              <i className="fas fa-chart-bar me-2"></i>
              Quick Stats
            </h4>
          </div>
          <div className="panel-body">
            <div className="stats-grid d-flex flex-wrap gap-3">
              <div className="stat-item flex-fill text-center">
                <div className="stat-value text-primary">{menu.length}</div>
                <div className="stat-label">Menu Items</div>
              </div>
              <div className="stat-item flex-fill text-center">
                <div className="stat-value text-warning">{staff.length}</div>
                <div className="stat-label">Staff Members</div>
              </div>
              <div className="stat-item flex-fill text-center">
                <div className="stat-value text-success">{orders.length}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-item flex-fill text-center">
                <div className="stat-value text-info">GHS {salesStats.totalSales.toFixed(2)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'staff':
        return renderStaffManagement();
      case 'menu':
        return renderMenuManagement();
      case 'orders':
        return renderRecentOrders();
      case 'reports':
        return renderReportsExport();
      default:
        return renderDashboard();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 fade-in">
        <LoadingSpinner size="large" centered message="Loading admin panel..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card fade-in">
        <div className="card-body text-center">
          <div className="text-danger mb-4">{error}</div>
          <button onClick={loadAllData} className="btn btn-danger transition-all hover-lift">
            <i className="fas fa-sync me-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container fade-in">
      {/* Full-width admin content */}
      <div className="admin-content-wrapper">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        
        {renderContent()}
      </div>

      {/* Staff Details Modal */}
      {showStaffDetailsModal && selectedStaff && (
        <StaffDetailsModal
          staff={selectedStaff}
          onClose={() => {
            setShowStaffDetailsModal(false);
            setSelectedStaff(null);
          }}
          onUpdate={handleStaffUpdate}
          onDelete={handleStaffDelete}
        />
      )}

      {/* Menu Details Modal */}
      {showMenuDetailsModal && selectedMenuItem && (
        <MenuDetailsModal
          menuItem={selectedMenuItem}
          onClose={() => {
            setShowMenuDetailsModal(false);
            setSelectedMenuItem(null);
          }}
          onUpdate={handleUpdateMenuItem}
          onDelete={handleDeleteMenuItem}
          onRefresh={handleMenuRefresh}
        />
      )}
    </div>
  );
};

export default Admin;