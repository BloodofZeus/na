import React, { useState, useEffect } from 'react';
import { updateMenuStock, toggleMenuItemAvailability, duplicateMenuItem } from '../services/api';
import { useToast } from './ToastContainer';

const MenuDetailsModal = ({ menuItem, onClose, onUpdate, onDelete, onRefresh }) => {
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    is_available: true,
    stock: 0
  });
  const [stockValue, setStockValue] = useState(0);

  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name || '',
        price: menuItem.price || '',
        category: menuItem.category || 'General',
        is_available: menuItem.is_available !== false,
        stock: menuItem.stock || 0
      });
      setStockValue(menuItem.stock || 0);
    }
  }, [menuItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(menuItem.id, formData);
      setIsEditing(false);
      showSuccess('Menu item updated successfully!');
    } catch (error) {
      console.error('Error updating menu item:', error);
      showError('Failed to update menu item');
    }
  };

  const handleStockUpdate = async () => {
    try {
      setIsUpdatingStock(true);
      await updateMenuStock(menuItem.id, stockValue);
      setIsUpdatingStock(false);
      showSuccess('Stock updated successfully!');
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error updating stock:', error);
      setIsUpdatingStock(false);
      showError('Failed to update stock');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleMenuItemAvailability(menuItem.id, !menuItem.is_available);
      showSuccess(`Item marked as ${!menuItem.is_available ? 'available' : 'unavailable'}!`);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error toggling availability:', error);
      showError('Failed to toggle availability');
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateMenuItem(menuItem.id);
      showSuccess('Menu item duplicated successfully!');
      if (onRefresh) await onRefresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error duplicating menu item:', error);
      showError('Failed to duplicate menu item');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${menuItem.name}"? This action cannot be undone.`)) {
      try {
        await onDelete(menuItem.id);
        showSuccess('Menu item deleted successfully!');
        setTimeout(() => onClose(), 1000);
      } catch (error) {
        console.error('Error deleting menu item:', error);
        showError('Failed to delete menu item');
      }
    }
  };

  if (!menuItem) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-utensils me-2"></i>
            {isEditing ? 'Edit Menu Item' : 'Menu Item Details'}
          </h3>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {!isEditing ? (
            <div className="menu-details">
              <div className="detail-row">
                <label className="detail-label">Item Name:</label>
                <div className="detail-value">{menuItem.name}</div>
              </div>
              <div className="detail-row">
                <label className="detail-label">Price:</label>
                <div className="detail-value">GHS {parseFloat(menuItem.price || 0).toFixed(2)}</div>
              </div>
              <div className="detail-row">
                <label className="detail-label">Category:</label>
                <div className="detail-value">{menuItem.category || 'General'}</div>
              </div>
              <div className="detail-row">
                <label className="detail-label">Availability:</label>
                <div className="detail-value">
                  <span className={`badge ${menuItem.is_available ? 'bg-success' : 'bg-secondary'}`}>
                    {menuItem.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <label className="detail-label">Current Stock:</label>
                <div className="detail-value">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={stockValue}
                      onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                      className="form-control form-control-sm"
                      style={{ width: '100px' }}
                    />
                    {stockValue !== menuItem.stock && (
                      <button
                        onClick={handleStockUpdate}
                        className="btn btn-sm btn-success"
                        disabled={isUpdatingStock}
                      >
                        <i className="fas fa-check me-1"></i>
                        {isUpdatingStock ? 'Updating...' : 'Update'}
                      </button>
                    )}
                    <span className={`badge ${menuItem.stock <= 0 ? 'bg-danger' : menuItem.stock <= 5 ? 'bg-warning' : 'bg-success'}`}>
                      {menuItem.stock <= 0 ? 'Out of Stock' : menuItem.stock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="detail-row">
                <label className="detail-label">Item ID:</label>
                <div className="detail-value text-muted">{menuItem.id}</div>
              </div>

              <hr className="my-4" />
              
              <div className="quick-actions">
                <h6 className="mb-3 fw-bold">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button 
                    className={`btn ${menuItem.is_available ? 'btn-warning' : 'btn-success'}`}
                    onClick={handleToggleAvailability}
                  >
                    <i className={`fas ${menuItem.is_available ? 'fa-ban' : 'fa-check-circle'} me-2`}></i>
                    {menuItem.is_available ? 'Mark as Unavailable' : 'Mark as Available'}
                  </button>
                  <button 
                    className="btn btn-info"
                    onClick={handleDuplicate}
                  >
                    <i className="fas fa-copy me-2"></i>
                    Duplicate This Item
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="menu-edit-form">
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Shawarma">Shawarma</option>
                  <option value="Wraps">Wraps</option>
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  />
                  Item Available for Sale
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          {!isEditing ? (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit me-2"></i>
                Edit Item
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash me-2"></i>
                Delete Item
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-success" onClick={handleSubmit}>
                <i className="fas fa-save me-2"></i>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsModal;
