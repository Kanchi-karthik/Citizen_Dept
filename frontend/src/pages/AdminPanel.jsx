import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeleteAllDepartments = async () => {
    if (window.confirm('Are you sure you want to delete all departments? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await API.delete('/departments/all');
        setMessage(response.data.message);
        setTimeout(() => {
          navigate('/department-login');
        }, 2000);
      } catch (err) {
        console.error('Error deleting departments:', err);
        setMessage('Error deleting departments: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Admin Panel</h2>
      <p>Manage departments and system settings</p>
      
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}
      
      <div className="admin-actions">
        <button 
          className="btn btn-danger"
          onClick={handleDeleteAllDepartments}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete All Departments'}
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/department-login')}
          style={{ marginLeft: '1rem' }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;