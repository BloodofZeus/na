import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStaff, addStaff, updateStaff, deleteStaff, resetStaffPassword, getMenu, addMenuItem, updateMenuStock, updateMenuItem, deleteMenuItem, duplicateMenuItem, toggleMenuItemAvailability, getOrders } from '../services/api';
import { useAuth } from '../services/AuthContext';
import StaffDetailsModal from './StaffDetailsModal';
import MenuDetailsModal from './MenuDetailsModal';

const Admin = () => {
  const { user } = useAuth();
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
  const [stockUpdates, setStockUpdates] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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
      setSuccessMessage('Staff member added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding staff:', error);
      setError('Failed to add staff member');
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.stock) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await addMenuItem({
        name: newMenuItem.name,
        price: parseFloat(newMenuItem.price),
        stock: parseInt(newMenuItem.stock)
      });
      await loadAllData();
      setNewMenuItem({ name: '', price: '', stock: '' });
      setSuccessMessage('Menu item added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Failed to add menu item');
    }
  };

  const handleUpdateStock = async (itemId, newStock) => {
    try {
      await updateMenuStock(itemId, parseInt(newStock));
      await loadAllData();
      setStockUpdates({});
      setSuccessMessage('Stock updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock');
    }
  };

  const handleStockChange = (itemId, value) => {
    setStockUpdates(prev => ({
      ...prev,
      [itemId]: value
    }));
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

  const handleDeleteStaff = async (username) => {
    if (window.confirm(`Are you sure you want to delete staff member "${username}"?`)) {
      try {
        await deleteStaff(username);
        await loadAllData();
        setSuccessMessage('Staff member deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting staff:', error);
        setError('Failed to delete staff member');
      }
    }
  };

  const handleResetStaffPassword = async (username) => {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (newPassword) {
      try {
        await resetStaffPassword(username, newPassword);
        setSuccessMessage(`Password reset successfully for ${username}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error resetting password:', error);
        setError('Failed to reset password');
      }
    }
  };

  const handleViewMenuDetails = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowMenuDetailsModal(true);
  };

  const handleUpdateMenuItem = async (itemId, itemData) => {
    try {
      await updateMenuItem(itemId, itemData);
      await loadAllData();
      setSuccessMessage('Menu item updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('Failed to update menu item');
      throw error;
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    try {
      await deleteMenuItem(itemId);
      await loadAllData();
      setSuccessMessage('Menu item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item');
      throw error;
    }
  };

  const handleDuplicateMenuItem = async (itemId) => {
    try {
      await duplicateMenuItem(itemId);
      await loadAllData();
      setSuccessMessage('Menu item duplicated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error duplicating menu item:', error);
      setError('Failed to duplicate menu item');
    }
  };

  const handleToggleAvailability = async (itemId, isAvailable) => {
    try {
      await toggleMenuItemAvailability(itemId, !isAvailable);
      await loadAllData();
      setSuccessMessage(`Item marked as ${!isAvailable ? 'available' : 'unavailable'}!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to toggle availability');
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
                      className="btn btn-sm btn-outline-info me-1"
                      onClick={() => handleViewStaffDetails(member)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleViewStaffDetails(member)}
                      title="Edit Staff"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-warning me-1"
                      onClick={() => handleResetStaffPassword(member.username)}
                      title="Reset Password"
                    >
                      <i className="fas fa-key"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteStaff(member.username)}
                      title="Delete Staff"
                    >
                      <i className="fas fa-trash"></i>
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
    </div>
  );

  const renderMenuManagement = () => (
    <div className="row">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-header">
            <h4 className="font-bold text-danger mb-0">Menu Items</h4>
          </div>
          <div className="card-body">
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
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={stockUpdates[item.id] !== undefined ? stockUpdates[item.id] : item.stock}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className="form-control form-control-sm"
                            style={{ width: '80px' }}
                          />
                          {stockUpdates[item.id] !== undefined && stockUpdates[item.id] != item.stock && (
                            <button
                              onClick={() => handleUpdateStock(item.id, stockUpdates[item.id])}
                              className="btn btn-sm btn-primary"
                              title="Update Stock"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.stock <= 0 ? 'bg-danger' : item.stock <= 5 ? 'bg-warning' : 'bg-success'}`}>
                          {item.stock <= 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => handleViewMenuDetails(item)}
                            title="View/Edit Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className={`btn btn-sm ${item.is_available ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            onClick={() => handleToggleAvailability(item.id, item.is_available)}
                            title={item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                          >
                            <i className={`fas ${item.is_available ? 'fa-ban' : 'fa-check-circle'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleDuplicateMenuItem(item.id)}
                            title="Duplicate Item"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                handleDeleteMenuItem(item.id);
                              }
                            }}
                            title="Delete Item"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-4">
        <div className="card">
          <div className="card-header">
            <h4 className="font-bold text-danger mb-0">Add New Item</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleAddMenuItem}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price (GHS)"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <input
                  type="number"
                  placeholder="Initial Stock"
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
    <div className="card">
      <div className="card-header">
        <h4 className="font-bold text-danger mb-0">Recent Orders</h4>
      </div>
      <div className="card-body">
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
            <div className="text-center py-4 text-muted">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderReportsExport = () => (
    <div className="row">
      <div className="col-lg-6">
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="font-bold text-danger mb-0">Export Options</h4>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
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
      </div>
      
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h4 className="font-bold text-danger mb-0">Quick Stats</h4>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-6 mb-3">
                <div className="h4 text-primary mb-0">{menu.length}</div>
                <small className="text-muted">Menu Items</small>
              </div>
              <div className="col-6 mb-3">
                <div className="h4 text-warning mb-0">{staff.length}</div>
                <small className="text-muted">Staff Members</small>
              </div>
              <div className="col-6">
                <div className="h4 text-success mb-0">{orders.length}</div>
                <small className="text-muted">Total Orders</small>
              </div>
              <div className="col-6">
                <div className="h4 text-info mb-0">GHS {salesStats.totalSales.toFixed(2)}</div>
                <small className="text-muted">Total Revenue</small>
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
      <div className="flex items-center justify-center py-8">
        <div className="spinner"></div>
        <span className="ml-2">Loading admin panel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="text-danger mb-4">{error}</div>
          <button onClick={loadAllData} className="btn btn-danger">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
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
        />
      )}
    </div>
  );
};

export default Admin;