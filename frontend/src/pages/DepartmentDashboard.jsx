import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp, AlertCircle, CheckCircle2, Clock, Users, Eye, Star, Package, X, Menu, Trash2, EyeOff } from "lucide-react";
import API from "../services/api";
import DepartmentSidebar from "../components/DepartmentSidebar";
import PerformanceForm from "./PerformanceForm";
import ResourceAllocationForm from "./ResourceAllocationForm";
import StatusUpdateForm from "./StatusUpdateForm";
import "../styles/dashboard.css";

const DepartmentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    avgResolutionTime: 0
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const [resolutionForm, setResolutionForm] = useState({
    resolutionDays: '',
    resolutionDescription: '',
    resolutionImages: [],
    departmentNotes: '',
    imagePreviews: [],
    status: 'Pending',
    priority: 'Normal',
    progressPercentage: 0,
    assignedTo: '',
    remarks: ''
  });
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showStatusUpdateForm, setShowStatusUpdateForm] = useState(false);
  const [editingComplaintId, setEditingComplaintId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [users, setUsers] = useState([]);
  
  // State for sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for profile and password update forms
  const [showProfileUpdateForm, setShowProfileUpdateForm] = useState(false);
  const [showPasswordUpdateForm, setShowPasswordUpdateForm] = useState(false);
  const [profileUpdateData, setProfileUpdateData] = useState({
    headName: '',
    contactEmail: '',
    contactNumber: '',
    city: '',
    state: '',
    address: '',
    description: '',
    website: ''
  });
  const [passwordUpdateData, setPasswordUpdateData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if department is authenticated
        const storedDepartment = localStorage.getItem('department');
        if (!storedDepartment) {
          // Redirect to login
          navigate(`/department-login/${id}`);
          return;
        }
        
        const departmentData = JSON.parse(storedDepartment);
        if (departmentData._id !== id) {
          // Redirect to login
          navigate(`/department-login/${id}`);
          return;
        }
        
        console.log("Fetching department with ID:", id);
        
        // Fetch department details
        const deptRes = await API.get(`/departments/${id}`);
        console.log("Department fetched:", deptRes.data);
        setDepartment(deptRes.data);
        
        // Initialize profile update data with current department data
        setProfileUpdateData({
          headName: deptRes.data.headName || '',
          contactEmail: deptRes.data.contactEmail || '',
          contactNumber: deptRes.data.contactNumber || '',
          city: deptRes.data.city || '',
          state: deptRes.data.state || '',
          address: deptRes.data.address || '',
          description: deptRes.data.description || '',
          website: deptRes.data.website || ''
        });

        // Fetch complaints for this department (using backend filtering)
        const complaintRes = await API.get(`/complaints?departmentId=${id}`);
        setComplaints(complaintRes.data);

        // Fetch performance data
        const perfRes = await API.get(`/departments/performance/all`);
        const perfData = perfRes.data.find(p => p.departmentID === id || p.departmentId === id);
        if (perfData) {
          setPerformance(perfData);
        }

        // Fetch resource allocation
        const resRes = await API.get(`/departments/allocation/all`);
        const resData = resRes.data.find(r => r.departmentID === id || r.departmentId === id);
        if (resData) {
          setResources(resData);
        }

        // Fetch users for assignment dropdown
        const usersRes = await API.get('/users');
        setUsers(usersRes.data);

        // Calculate stats for all statuses
        const total = complaintRes.data.length;
        const resolved = complaintRes.data.filter(c => c.status === 'Resolved').length;
        const pending = complaintRes.data.filter(c => c.status === 'New').length;
        const inProgress = complaintRes.data.filter(c => c.status === 'Working').length;

        setStats({
          totalComplaints: total,
          resolvedComplaints: resolved,
          pendingComplaints: pending,
          inProgressComplaints: inProgress,
          avgResolutionTime: perfData?.avgResolutionTime || 0
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response?.data || err.message);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchDashboardData();
    }

    // Add event listener for beforeunload to check authentication
    const handleBeforeUnload = (e) => {
      // Check if department is still authenticated
      const storedDepartment = localStorage.getItem('department');
      if (!storedDepartment) {
        // User is not authenticated, redirect to login
        navigate(`/department-login/${id}`);
      }
    };

    // Add event listener for popstate (back/forward navigation)
    const handlePopState = (e) => {
      // Check if department is still authenticated
      const storedDepartment = localStorage.getItem('department');
      if (!storedDepartment) {
        // User is not authenticated, redirect to login
        navigate(`/department-login/${id}`);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [id, navigate]);

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const res = await API.put(`/complaints/${complaintId}/status`, { status: newStatus });
      
      // Update the complaint in the local state
      setComplaints(prevComplaints => 
        prevComplaints.map(c => 
          c._id === complaintId ? { ...c, status: res.data.status } : c
        )
      );
      
      // If we're viewing the selected complaint details, update that too
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: res.data.status });
      }
      
      alert(`Complaint status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating complaint status:", err);
      alert("Failed to update complaint status: " + (err.response?.data?.message || err.message));
    }
  };

  const viewComplaintDetails = async (complaintId) => {
    try {
      const res = await API.get(`/complaints/${complaintId}/details`);
      setSelectedComplaint(res.data);
      setShowComplaintModal(true);
    } catch (err) {
      console.error("Error fetching complaint details:", err);
      alert("Failed to fetch complaint details: " + (err.response?.data?.message || err.message));
    }
  };

  const closeComplaintModal = () => {
    setShowComplaintModal(false);
    setSelectedComplaint(null);
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'New': return 'Accepted';
      case 'Accepted': return 'Working';
      case 'Working': return 'Resolved';
      case 'On Hold': return 'Working';
      case 'Resolved': return 'Closed';
      case 'Closed': return 'Accepted'; // Reopen case
      default: return 'New';
    }
  };

  const getComplaintProgress = (status) => {
    switch (status) {
      case 'New': return 10;
      case 'Accepted': return 25;
      case 'Working': return 50;
      case 'On Hold': return 30;
      case 'Resolved': return 90;
      case 'Closed': return 100;
      default: return 0;
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'New': return '#9e9e9e';
      case 'Accepted': return '#4caf50';
      case 'Working': return '#2196f3';
      case 'On Hold': return '#ff9800';
      case 'Resolved': return '#00897b';
      case 'Closed': return '#9c27b0';
      default: return '#9e9e9e';
    }
  };

  const openStatusUpdateForm = (complaint) => {
    // Set the complaint and show the status update form
    setEditingComplaintId(complaint._id);
    setShowStatusUpdateForm(true);
  };

  const openResolutionForm = (complaintId, currentData = {}) => {
    setEditingComplaintId(complaintId);
    setResolutionForm({
      resolutionDays: '',
      resolutionDescription: '',
      resolutionImages: [],
      departmentNotes: '',
      imagePreviews: []
    });
    setShowResolutionForm(true);
  };

  const closeResolutionForm = () => {
    setShowResolutionForm(false);
    setEditingComplaintId(null);
    setResolutionForm({
      resolutionDays: '',
      resolutionDescription: '',
      resolutionImages: [],
      departmentNotes: '',
      imagePreviews: []
    });
  };

  const handleResolutionImageChange = (event) => {
    const files = Array.from(event.currentTarget.files);
    if (!files.length) return;
    
    const newImages = [];
    const newPreviews = [...resolutionForm.imagePreviews];
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            
            // Resize to max 600x600 for smaller size
            const maxDim = 600;
            if (width > maxDim || height > maxDim) {
              const ratio = Math.min(maxDim / width, maxDim / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with quality 0.6 for smaller size
            let quality = 0.6;
            let compressedImage = canvas.toDataURL('image/jpeg', quality);
            
            // If still too large, reduce quality further
            while (compressedImage.length > 1024 * 112 && quality > 0.3) {
              quality -= 0.1;
              compressedImage = canvas.toDataURL('image/jpeg', quality);
            }
            
            console.log(`Resolution image compressed: Original ${file.size} bytes, Compressed ${compressedImage.length} bytes`);
            
            newImages.push(compressedImage);
            newPreviews.push({ id: Date.now() + index, src: compressedImage });
            
            // Update state when all images are processed
            if (newImages.length === files.length) {
              setResolutionForm(prev => ({
                ...prev,
                resolutionImages: [...prev.resolutionImages, ...newImages],
                imagePreviews: [...prev.imagePreviews, ...newPreviews]
              }));
            }
          } catch (err) {
            console.error('Image compression error:', err);
            alert('Failed to process image. Please try a different image.');
          }
        };
        img.onerror = () => {
          alert('Failed to load image. Please select a valid image file.');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeResolutionImage = (imageId) => {
    setResolutionForm(prev => ({
      ...prev,
      imagePreviews: prev.imagePreviews.filter(img => img.id !== imageId),
      resolutionImages: prev.imagePreviews
        .filter(img => img.id !== imageId)
        .map(img => img.src)
    }));
  };

  const submitResolutionDetails = async (e) => {
    e.preventDefault();
    try {
      // First, update the complaint status
      await API.put(`/complaints/${editingComplaintId}/status`, { 
        status: resolutionForm.status
      });
      
      const formData = {
        ...resolutionForm,
        resolutionDays: resolutionForm.resolutionDays === '' ? 0 : parseInt(resolutionForm.resolutionDays) || 0
      };
      
      const res = await API.post(`/complaints/${editingComplaintId}/resolution-update`, formData);
      
      // Also create a status update record
      const statusUpdateData = {
        complaintID: editingComplaintId,
        departmentID: id,
        status: resolutionForm.status,
        priority: resolutionForm.priority,
        progressPercentage: resolutionForm.progressPercentage,
        assignedTo: resolutionForm.assignedTo,
        remarks: resolutionForm.remarks
      };
      
      await API.post('/departments/status', statusUpdateData);
      
      // Update the complaint in the local state by adding the new resolution update
      setComplaints(prevComplaints => 
        prevComplaints.map(c => {
          if (c._id === editingComplaintId) {
            const updatedComplaint = { ...c };
            if (!updatedComplaint.resolutionUpdates) {
              updatedComplaint.resolutionUpdates = [];
            }
            updatedComplaint.resolutionUpdates.push(res.data);
            return updatedComplaint;
          }
          return c;
        })
      );
      
      // If we're viewing the selected complaint details, update that too
      if (selectedComplaint && selectedComplaint._id === editingComplaintId) {
        const updatedComplaint = { ...selectedComplaint };
        if (!updatedComplaint.resolutionUpdates) {
          updatedComplaint.resolutionUpdates = [];
        }
        updatedComplaint.resolutionUpdates.push(res.data);
        setSelectedComplaint(updatedComplaint);
      }
      
      // Reset form and close modal
      setResolutionForm({
        resolutionDays: '',
        resolutionDescription: '',
        resolutionImages: [],
        departmentNotes: '',
        imagePreviews: [],
        status: 'New',
        priority: 'Normal',
        progressPercentage: 0,
        assignedTo: '',
        remarks: ''
      });
      setCurrentStep(1);
      
      alert('Resolution update and status added successfully');
      closeResolutionForm();
    } catch (err) {
      console.error("Error adding resolution update:", err);
      alert("Failed to add resolution update: " + (err.response?.data?.message || err.message));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/departments/${id}`, profileUpdateData);
      setDepartment(res.data);
      setShowProfileUpdateForm(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      // Check if new passwords match
      if (passwordUpdateData.newPassword !== passwordUpdateData.confirmNewPassword) {
        alert("New passwords do not match");
        return;
      }
      
      // Send password update request
      const res = await API.put(`/departments/${id}/password`, {
        currentPassword: passwordUpdateData.currentPassword,
        newPassword: passwordUpdateData.newPassword
      });
      
      // Reset password form
      setPasswordUpdateData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
      setShowPasswordUpdateForm(false);
      alert('Password updated successfully');
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Failed to update password: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center mt-5"><h4>Loading Dashboard...</h4></div>;
  if (error) return <div className="text-center mt-5" style={{ color: 'red' }}><h4>Error: {error}</h4></div>;
  if (!department) return <div className="text-center mt-5"><h4>Department not found</h4></div>;

  // Chart data for complaint status
  const complaintStatusData = [
    { name: 'Resolved', value: stats.resolvedComplaints, fill: '#00897b' },
    { name: 'Pending', value: stats.pendingComplaints, fill: '#ffa726' },
    { name: 'In Progress', value: stats.inProgressComplaints, fill: '#2196f3' },
  ].filter(item => item.value > 0); // Only show statuses with actual data

  // Chart data for complaints over time (using actual department data)
  // Group complaints by month for trend analysis
  const complaintTrendData = complaints.reduce((acc, complaint) => {
    const date = new Date(complaint.createdAt);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    
    if (!acc[key]) {
      acc[key] = { month: key, complaints: 0 };
    }
    acc[key].complaints += 1;
    
    return acc;
  }, {});
  
  const complaintTrendArray = Object.values(complaintTrendData).sort((a, b) => {
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return aDate - bDate;
  }).slice(-6); // Last 6 months

  // Map complaints by location
  const complaintsByLocation = {};
  complaints.forEach(c => {
    const location = c.location || 'Unknown';
    complaintsByLocation[location] = (complaintsByLocation[location] || 0) + 1;
  });

  // Convert to array, sort by count (descending), and limit to top 10
  const locationData = Object.entries(complaintsByLocation)
    .map(([location, count]) => ({
      location,
      complaints: count
    }))
    .sort((a, b) => b.complaints - a.complaints)
    .slice(0, 10);

  // Calculate resolution rate
  const resolutionRate = stats.totalComplaints > 0 
    ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) 
    : 0;

  return (
    <div className="dashboard-with-sidebar">
      {sidebarOpen ? (
        <DepartmentSidebar 
          deptName={department?.departmentName || 'Department'}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <button 
          className="sidebar-toggle-btn-closed"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}
      
      <div className={`dashboard-main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{department?.departmentName} - Visualization Dashboard</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Comprehensive overview of department performance and complaint analytics</p>
            
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon total">
                  <AlertCircle size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">Total Complaints</p>
                  <h3 className="kpi-value">{stats.totalComplaints}</h3>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon resolved">
                  <CheckCircle2 size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">Resolved</p>
                  <h3 className="kpi-value">{stats.resolvedComplaints}</h3>
                  <p className="kpi-percent">{resolutionRate}%</p>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon pending">
                  <Clock size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">Pending</p>
                  <h3 className="kpi-value">{stats.pendingComplaints}</h3>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon avg">
                  <TrendingUp size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">In Progress</p>
                  <h3 className="kpi-value">{stats.inProgressComplaints}</h3>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon avg">
                  <Clock size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">Avg Resolution Time</p>
                  <h3 className="kpi-value">{stats.avgResolutionTime || 0}</h3>
                  <p className="kpi-unit">days</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Complaint Status Chart */}
              <div className="chart-card">
                <h3>Complaint Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={complaintStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complaintStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {complaintStatusData.length === 0 && (
                  <div className="empty-state">
                    <p>No complaint data available for visualization</p>
                  </div>
                )}
              </div>

              {/* Complaint Trend Chart */}
              <div className="chart-card">
                <h3>Complaints Trend (6 Months)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={complaintTrendArray}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="complaints" stroke="#005b5f" strokeWidth={2} dot={{ fill: '#005b5f', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
                {complaintTrendArray.length === 0 && (
                  <div className="empty-state">
                    <p>No trend data available for visualization</p>
                  </div>
                )}
              </div>

              {/* Complaints by Location */}
              <div className="chart-card">
                <h3>Complaints by Location</h3>
                {locationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="complaints" fill="#00897b" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">
                    <p>No location data available for visualization</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="performance-card">
              <h3>Performance Metrics</h3>
              {performance ? (
                <div className="metrics-grid">
                  <div className="metric">
                    <label>Satisfaction Score</label>
                    <div className="metric-value">{performance.citizenSatisfactionScore}/5 <Star size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} /></div>
                  </div>
                  <div className="metric">
                    <label>Resolution Rate</label>
                    <div className="metric-value">{resolutionRate}%</div>
                  </div>
                  <div className="metric">
                    <label>Budget Utilization</label>
                    <div className="metric-value">{performance.budgetUtilization || 0}%</div>
                  </div>
                  <div className="metric">
                    <label>Performance Rating</label>
                    <div className="metric-value">{performance.performanceRating}</div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No performance data available</p>
                </div>
              )}
            </div>

            {/* Recent Complaints Table */}
            <div className="recent-complaints">
              <h3>Recent Complaints</h3>
              {complaints.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Title</th>
                        <th>User</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 5).map((complaint) => (
                        <tr key={complaint._id}>
                          <td><code>{complaint.complaintId}</code></td>
                          <td><strong>{complaint.title}</strong></td>
                          <td>{complaint.user?.fullName || 'N/A'}</td>
                          <td>{complaint.location || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              complaint.status === 'Resolved' ? 'bg-success' : 
                              complaint.status === 'New' ? 'bg-secondary' : 
                              complaint.status === 'Accepted' ? 'bg-primary' : 
                              complaint.status === 'Working' ? 'bg-info' : 
                              complaint.status === 'On Hold' ? 'bg-warning' : 
                              complaint.status === 'Closed' ? 'bg-dark' : 'bg-secondary'
                            }`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No complaints available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complaints & Status Tab */}
        {activeTab === 'complaints' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Complaints & Status Management</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Track complaints and update their status in a 3-step verification process</p>
            
            {/* 3-Step Complaint Status Tracker */}
            <div className="performance-card" style={{ marginBottom: '2rem' }}>
              <h3>Complaint Status Tracker</h3>
              <div className="metrics-grid">
                <div className="metric">
                  <label>Total Complaints</label>
                  <div className="metric-value">{stats.totalComplaints}</div>
                </div>
                <div className="metric">
                  <label>Pending Review</label>
                  <div className="metric-value">{stats.pendingComplaints}</div>
                </div>
                <div className="metric">
                  <label>In Progress</label>
                  <div className="metric-value">{stats.inProgressComplaints}</div>
                </div>
                <div className="metric">
                  <label>Resolved</label>
                  <div className="metric-value">{stats.resolvedComplaints}</div>
                </div>
              </div>
            </div>

            {/* Complaints with Status Updates */}
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Complaints List</h3>
            {complaints.length === 0 ? (
              <div className="empty-state">
                <p>No complaints found for this department.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Title</th>
                      <th>User</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((complaint) => (
                      <tr key={complaint._id}>
                        <td><code>{complaint.complaintId}</code></td>
                        <td><strong>{complaint.title}</strong></td>
                        <td>{complaint.user?.fullName || 'N/A'}</td>
                        <td>{complaint.location || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${complaint.status?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>
                          <div className="progress" style={{ height: '10px' }}>
                            <div 
                              className="progress-bar" 
                              style={{
                                width: `${getComplaintProgress(complaint.status)}%`,
                                backgroundColor: getProgressColor(complaint.status)
                              }}
                            ></div>
                          </div>
                          <small className="text-muted">{getComplaintProgress(complaint.status)}%</small>
                        </td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewComplaintDetails(complaint._id)}
                            style={{ marginBottom: '0.25rem' }}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info ml-2"
                            onClick={() => openStatusUpdateForm(complaint)}
                            style={{ marginBottom: '0.25rem' }}
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Status Update Form Modal */}
            {showStatusUpdateForm && editingComplaintId && (
              <div className="user-detail-modal-overlay" onClick={() => setShowStatusUpdateForm(false)}>
                <div className="user-detail-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                  <button className="user-detail-modal-close" onClick={() => setShowStatusUpdateForm(false)}>&times;</button>
                  <h3>Update Complaint Status</h3>
                  <StatusUpdateForm 
                    departmentId={id} 
                    complaintId={editingComplaintId}
                    onCancel={() => setShowStatusUpdateForm(false)}
                    onSuccess={() => {
                      setShowStatusUpdateForm(false);
                      // Refresh complaints data
                      const fetchDashboardData = async () => {
                        try {
                          const complaintRes = await API.get(`/complaints?departmentId=${id}`);
                          setComplaints(complaintRes.data);
                        } catch (err) {
                          console.error("Error refreshing complaints data:", err);
                        }
                      };
                      fetchDashboardData();
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}


        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="department-component-container">
            <PerformanceForm departmentId={id} />
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="department-component-container">
            <ResourceAllocationForm departmentId={id} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="department-component-container">
            <div className="settings-container">
              <div className="settings-section">
                <h3>Profile Information</h3>
                <p>Update your department's profile information.</p>
                {!showProfileUpdateForm ? (
                  <button className="btn btn-primary" onClick={() => setShowProfileUpdateForm(true)}>
                    Update Profile
                  </button>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="settings-form">
                    <div className="form-group">
                      <label>Head Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileUpdateData.headName}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, headName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profileUpdateData.contactEmail}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, contactEmail: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileUpdateData.contactNumber}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, contactNumber: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileUpdateData.city}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, city: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileUpdateData.state}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, state: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Address</label>
                      <textarea
                        className="form-control"
                        value={profileUpdateData.address}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, address: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        value={profileUpdateData.description}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, description: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        className="form-control"
                        value={profileUpdateData.website}
                        onChange={(e) => setProfileUpdateData({...profileUpdateData, website: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Save Profile</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowProfileUpdateForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
              
              <div className="settings-section">
                <h3>Login Credentials</h3>
                <p>Update your department's login credentials.</p>
                {!showPasswordUpdateForm ? (
                  <button className="btn btn-primary" onClick={() => setShowPasswordUpdateForm(true)}>
                    Update Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="settings-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="input-group">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="form-control"
                          value={passwordUpdateData.currentPassword}
                          onChange={(e) => setPasswordUpdateData({...passwordUpdateData, currentPassword: e.target.value})}
                          required
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            minWidth: '40px'
                          }}
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>New Password</label>
                      <div className="input-group">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          className="form-control"
                          value={passwordUpdateData.newPassword}
                          onChange={(e) => setPasswordUpdateData({...passwordUpdateData, newPassword: e.target.value})}
                          required
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            minWidth: '40px'
                          }}
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          value={passwordUpdateData.confirmNewPassword}
                          onChange={(e) => setPasswordUpdateData({...passwordUpdateData, confirmNewPassword: e.target.value})}
                          required
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            minWidth: '40px'
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">Save Password</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordUpdateForm(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}



        {/* Complaint Detail Modal */}
        {showComplaintModal && selectedComplaint && (
          <div className="user-detail-modal-overlay" onClick={closeComplaintModal}>
            <div className="user-detail-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="user-detail-modal-close" onClick={closeComplaintModal}>&times;</button>
              <h3>Complaint Details</h3>
              
              <div className="user-detail-modal-body">
                <div className="detail-section">
                  <h5>Complaint Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Complaint ID:</strong> {selectedComplaint.complaintId}</p>
                      <p><strong>Title:</strong> {selectedComplaint.title}</p>
                      <p><strong>User:</strong> {selectedComplaint.user?.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedComplaint.user?.email || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedComplaint.location || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Status:</strong> 
                        <span className={`badge ml-2 ${selectedComplaint.status === 'Resolved' ? 'bg-success' : selectedComplaint.status === 'New' ? 'bg-secondary' : selectedComplaint.status === 'Accepted' ? 'bg-primary' : selectedComplaint.status === 'Working' ? 'bg-info' : selectedComplaint.status === 'On Hold' ? 'bg-warning' : selectedComplaint.status === 'Closed' ? 'bg-dark' : 'bg-secondary'}`}>
                          {selectedComplaint.status}
                        </span>
                      </p>
                      <p><strong>Complaint Type:</strong> {selectedComplaint.complaintType || 'N/A'}</p>
                      <p><strong>Area Type:</strong> {selectedComplaint.areaType || 'N/A'}</p>
                      <p><strong>Days Pending:</strong> {selectedComplaint.days || 'N/A'}</p>
                      <p><strong>Filed Date:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>Description</h5>
                  <p>{selectedComplaint.description || 'N/A'}</p>
                </div>

                {selectedComplaint.image && (
                  <div className="detail-section">
                    <h5>Evidence Image</h5>
                    <img src={selectedComplaint.image} alt="Complaint evidence" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
                  </div>
                )}

                {/* Department Resolution Updates */}
                {selectedComplaint.resolutionUpdates && selectedComplaint.resolutionUpdates.length > 0 && (
                  <div className="detail-section">
                    <h5>Department Resolution Updates</h5>
                    {selectedComplaint.resolutionUpdates.map((update, index) => (
                      <div key={update._id || index} className="resolution-update mb-4 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                        <h6>Update #{index + 1} - {new Date(update.updatedAt).toLocaleString()}</h6>
                        {update.resolutionDays > 0 && (
                          <p><strong>Days to Resolve:</strong> {update.resolutionDays}</p>
                        )}
                        {update.resolutionDescription && (
                          <div>
                            <p><strong>Resolution Description:</strong></p>
                            <p>{update.resolutionDescription}</p>
                          </div>
                        )}
                        {update.resolutionImages && update.resolutionImages.length > 0 && (
                          <div>
                            <p><strong>Resolution Images:</strong></p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                              {update.resolutionImages.map((img, imgIndex) => (
                                <img 
                                  key={imgIndex} 
                                  src={img} 
                                  alt={`Resolution ${imgIndex + 1}`} 
                                  style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {update.departmentNotes && (
                          <div>
                            <p><strong>Department Notes:</strong></p>
                            <p>{update.departmentNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="detail-section">
                  <h5>Actions</h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      updateComplaintStatus(selectedComplaint._id, getNextStatus(selectedComplaint.status));
                      closeComplaintModal();
                    }}
                  >
                    Update Status to {getNextStatus(selectedComplaint.status)}
                  </button>
                  <button 
                    className="btn btn-secondary ml-2"
                    onClick={() => {
                      closeComplaintModal();
                      openResolutionForm(selectedComplaint._id, selectedComplaint);
                    }}
                  >
                    Add Resolution Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Form Modal */}
        {showResolutionForm && (
          <div className="user-detail-modal-overlay" onClick={closeResolutionForm}>
            <div className="user-detail-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="user-detail-modal-close" onClick={closeResolutionForm}>&times;</button>
              <h3>Add Resolution Update</h3>
              
              <form onSubmit={submitResolutionDetails} className="user-detail-modal-body">
                <div className="detail-section">
                  <h5>Resolution Information</h5>
                  
                  {/* 3-Step Verification Process */}
                  <div className="step-tracker" style={{ marginBottom: '1.5rem' }}>
                    <div className="step-progress">
                      <div className="step-item">
                        <div className={`step-number ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                        <div className="step-label">Details</div>
                      </div>
                      <div className="step-divider"></div>
                      <div className="step-item">
                        <div className={`step-number ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                        <div className="step-label">Status</div>
                      </div>
                      <div className="step-divider"></div>
                      <div className="step-item">
                        <div className={`step-number ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                        <div className="step-label">Confirmation</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 1: Details */}
                  {currentStep === 1 && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Days to Resolve *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={resolutionForm.resolutionDays}
                            onChange={(e) => setResolutionForm({
                              ...resolutionForm, 
                              resolutionDays: e.target.value === '' ? '' : parseInt(e.target.value) || 0
                            })}
                            min="0"
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Department Notes</label>
                          <input
                            type="text"
                            className="form-control"
                            value={resolutionForm.departmentNotes}
                            onChange={(e) => setResolutionForm({...resolutionForm, departmentNotes: e.target.value})}
                            placeholder="Internal notes..."
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label>Resolution Description *</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          value={resolutionForm.resolutionDescription}
                          onChange={(e) => setResolutionForm({...resolutionForm, resolutionDescription: e.target.value})}
                          placeholder="Describe the actions taken to resolve this complaint..."
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Step 2: Status Update */}
                  {currentStep === 2 && (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Current Status *</label>
                          <select 
                            className="form-control"
                            value={resolutionForm.status}
                            onChange={(e) => setResolutionForm({...resolutionForm, status: e.target.value})}
                          >
                            <option value="New">New</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Working">Working</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Priority Level *</label>
                          <select 
                            className="form-control"
                            value={resolutionForm.priority}
                            onChange={(e) => setResolutionForm({...resolutionForm, priority: e.target.value})}
                          >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label>Progress (%) *</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            className="form-control form-range" 
                            value={resolutionForm.progressPercentage}
                            onChange={(e) => setResolutionForm({...resolutionForm, progressPercentage: parseInt(e.target.value)})}
                          />
                          <small className="text-muted">{resolutionForm.progressPercentage}%</small>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label>Assigned To</label>
                          <select 
                            className="form-control"
                            value={resolutionForm.assignedTo}
                            onChange={(e) => setResolutionForm({...resolutionForm, assignedTo: e.target.value})}
                          >
                            <option value="">Select person</option>
                            {users.map(u => (
                              <option key={u._id} value={u._id}>
                                {u.fullName} ({u.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label>Update Remarks *</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={resolutionForm.remarks}
                          onChange={(e) => setResolutionForm({...resolutionForm, remarks: e.target.value})}
                          placeholder="Describe the current status and actions taken..."
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Step 3: Confirmation */}
                  {currentStep === 3 && (
                    <div className="confirmation-step">
                      <h5>Review Your Updates</h5>
                      <div className="review-item">
                        <strong>Resolution Days:</strong> {resolutionForm.resolutionDays || 'Not specified'}
                      </div>
                      <div className="review-item">
                        <strong>Department Notes:</strong> {resolutionForm.departmentNotes || 'None'}
                      </div>
                      <div className="review-item">
                        <strong>Resolution Description:</strong> {resolutionForm.resolutionDescription || 'None'}
                      </div>
                      <div className="review-item">
                        <strong>Status:</strong> {resolutionForm.status}
                      </div>
                      <div className="review-item">
                        <strong>Priority:</strong> {resolutionForm.priority}
                      </div>
                      <div className="review-item">
                        <strong>Progress:</strong> {resolutionForm.progressPercentage}%
                      </div>
                      <div className="review-item">
                        <strong>Assigned To:</strong> {resolutionForm.assignedTo ? users.find(u => u._id === resolutionForm.assignedTo)?.fullName || 'Unknown' : 'Unassigned'}
                      </div>
                      <div className="review-item">
                        <strong>Remarks:</strong> {resolutionForm.remarks || 'None'}
                      </div>
                      
                      <div className="image-preview-container mt-3">
                        {resolutionForm.imagePreviews.map((img) => (
                          <div key={img.id} className="image-preview-item">
                            <img src={img.src} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <label>Resolution Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleResolutionImageChange}
                      multiple
                      className="form-control"
                    />
                    <div className="image-preview-container mt-2">
                      {resolutionForm.imagePreviews.map((img) => (
                        <div key={img.id} className="image-preview-item">
                          <img src={img.src} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                          <button 
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeResolutionImage(img.id)}
                            style={{ marginTop: '5px' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeResolutionForm}>
                    Cancel
                  </button>
                  
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-success">
                      Submit Updates
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;