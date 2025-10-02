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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError('');
      await onUpdate(menuItem.id, formData);
      setSuccess('Menu item updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('Failed to update menu item');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: menuItem.name || '',
      price: menuItem.price || '',
      category: menuItem.category || 'General',
      is_available: menuItem.is_available !== false,
      stock: menuItem.stock || 0
    });
    setError('');
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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          position: 'relative',
          zIndex: 10000,
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '42rem',
          width: '100%',
          margin: '0 1rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-danger">
            <i className="fas fa-utensils me-2"></i>
            {isEditing ? 'Edit Menu Item' : 'Menu Item Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {success}
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {/* Menu Item Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-utensils text-white text-2xl"></i>
            </div>
            <h4 className="font-bold text-2xl text-danger">{menuItem.name}</h4>
            <p className="text-sm text-muted">Menu Item</p>
          </div>
          
          {/* Menu Information */}
          {!isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h6 className="font-semibold text-gray-700 mb-2">Item Overview</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">{menuItem.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-danger">GHS {parseFloat(menuItem.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className={`badge bg-primary px-2 py-1 rounded text-xs`}>
                        {menuItem.category || 'General'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`badge ${menuItem.is_available ? 'bg-success' : 'bg-secondary'} px-2 py-1 rounded text-xs`}>
                        {menuItem.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h6 className="font-semibold text-gray-700 mb-2">Inventory</h6>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className={`badge ${menuItem.stock <= 0 ? 'bg-danger' : menuItem.stock <= 5 ? 'bg-warning' : 'bg-success'} px-2 py-1 rounded text-xs`}>
                        {menuItem.stock <= 0 ? 'Out of Stock' : menuItem.stock <= 5 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <input
                        type="number"
                        min="0"
                        value={stockValue}
                        onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                        className="form-control form-control-sm"
                        style={{ flex: 1 }}
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
                    </div>
                    <div className="text-muted text-xs">
                      <i className="fas fa-info-circle me-1"></i>
                      Item ID: {menuItem.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-3">Quick Actions</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline-primary w-100"
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Details
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button 
                      className={`btn ${menuItem.is_available ? 'btn-outline-warning' : 'btn-outline-success'} w-100`}
                      onClick={handleToggleAvailability}
                    >
                      <i className={`fas ${menuItem.is_available ? 'fa-ban' : 'fa-check-circle'} me-2`}></i>
                      {menuItem.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button 
                      className="btn btn-outline-info w-100"
                      onClick={handleDuplicate}
                    >
                      <i className="fas fa-copy me-2"></i>
                      Duplicate Item
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button 
                      className="btn btn-outline-danger w-100"
                      onClick={handleDelete}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h6 className="font-semibold text-blue-800 mb-3">Edit Menu Item</h6>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Item Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
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
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Availability</label>
                    <select
                      className="form-control"
                      value={formData.is_available ? 'available' : 'unavailable'}
                      onChange={(e) => setFormData({...formData, is_available: e.target.value === 'available'})}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-outline-secondary">
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsModal;
