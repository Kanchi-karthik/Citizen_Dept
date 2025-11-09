import React from "react";
import { BarChart3, Package, CheckCircle2, X, Eye, AlertCircle, LogOut } from "lucide-react";
import "../styles/app.css";

const DepartmentSidebar = ({ deptName, activeTab, setActiveTab, onClose }) => {
  // Function to exit from department UI
  const exitDepartment = () => {
    // Navigate to the home page or main dashboard
    window.location.href = '/';
  };

  return (
    <div className="department-sidebar">
      <div className="sidebar-header">
        <div>
          <h3>{deptName}</h3>
          <p className="sidebar-subtitle">Department Portal</p>
        </div>
        <div className="sidebar-header-actions">
          <button 
            className="close-btn" 
            onClick={onClose}
            title="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="sidebar-nav">
        <button 
          className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Eye size={20} />
          <span className="label">Overview</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          <AlertCircle size={20} />
          <span className="label">Complaints</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <BarChart3 size={20} />
          <span className="label">Performance</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <Package size={20} />
          <span className="label">Resources</span>
        </button>

        <button 
          className={`sidebar-nav-item ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <CheckCircle2 size={20} />
          <span className="label">Status Update</span>
        </button>
      </div>

      {/* Exit button at the bottom of the sidebar */}
      <div className="sidebar-footer">
        <button 
          className="sidebar-nav-item exit-btn"
          onClick={exitDepartment}
          title="Exit Department UI"
        >
          <LogOut size={20} />
          <span className="label">Exit Department</span>
        </button>
      </div>
    </div>
  );
};

export default DepartmentSidebar;