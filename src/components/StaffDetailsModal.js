import React, { useState } from 'react';
import { updateStaff, deleteStaff, resetStaffPassword } from '../services/api';

const StaffDetailsModal = ({ staff, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    role: staff.role,
    is_active: staff.is_active
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      role: staff.role,
      is_active: staff.is_active
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      await updateStaff(staff.username, editData);
      setSuccess('Staff member updated successfully!');
      onUpdate();
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.error || 'Failed to update staff member');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      role: staff.role,
      is_active: staff.is_active
    });
    setError('');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setIsResettingPassword(true);
      await resetStaffPassword(staff.username, newPassword);
      setSuccess('Password reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsResettingPassword(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.error || 'Failed to reset password');
      setIsResettingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${staff.username}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setIsDeleting(true);
      await deleteStaff(staff.username);
      setSuccess('Staff member deleted successfully!');
      setTimeout(() => {
        onDelete();
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.error || 'Failed to delete staff member');
      setIsDeleting(false);
    }
  };

  if (!staff) return null;

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
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-danger">Staff Details</h3>
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

          {/* Staff Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-danger rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user text-white text-2xl"></i>
            </div>
            <h4 className="font-bold text-2xl text-danger">{staff.username}</h4>
            <p className="text-sm text-muted">Staff Member</p>
          </div>
          
          {/* Staff Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-semibold text-gray-700 mb-2">Basic Information</h6>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-semibold">{staff.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className={`badge ${staff.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-2 py-1 rounded text-xs`}>
                    {staff.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`badge ${staff.is_active ? 'bg-success' : 'bg-secondary'} px-2 py-1 rounded text-xs`}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">
                    {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="font-semibold text-gray-700 mb-2">Quick Actions</h6>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="btn btn-outline-primary w-100"
                  disabled={isEditing}
                >
                  <i className="fas fa-edit me-2"></i>
                  {isEditing ? 'Editing...' : 'Edit Details'}
                </button>
                <button
                  onClick={() => setIsResettingPassword(!isResettingPassword)}
                  className="btn btn-outline-warning w-100"
                >
                  <i className="fas fa-key me-2"></i>
                  Reset Password
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-outline-danger w-100"
                  disabled={isDeleting}
                >
                  <i className="fas fa-trash me-2"></i>
                  {isDeleting ? 'Deleting...' : 'Delete Staff'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h6 className="font-semibold text-blue-800 mb-3">Edit Staff Details</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({...editData, role: e.target.value})}
                    className="form-control"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <select
                    value={editData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditData({...editData, is_active: e.target.value === 'active'})}
                    className="form-control"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button onClick={handleSave} className="btn btn-primary">
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </button>
                <button onClick={handleCancel} className="btn btn-outline-secondary">
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reset Password Form */}
          {isResettingPassword && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h6 className="font-semibold text-yellow-800 mb-3">Reset Password</h6>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  onClick={handleResetPassword} 
                  className="btn btn-warning"
                  disabled={isResettingPassword}
                >
                  <i className="fas fa-key me-2"></i>
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
                <button 
                  onClick={() => {
                    setIsResettingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }} 
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 p-4 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="btn btn-outline-secondary flex-1"
          >
            <i className="fas fa-times me-2"></i>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
