import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MapPin, TrendingUp, AlertCircle, CheckCircle2, Clock, Users, Eye, Star, Package, X, Menu } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState('overview');
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
    imagePreviews: []
  });
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [editingComplaintId, setEditingComplaintId] = useState(null);
  
  // State for sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching department with ID:", id);
        
        // Fetch department details
        const deptRes = await API.get(`/departments/${id}`);
        console.log("Department fetched:", deptRes.data);
        setDepartment(deptRes.data);

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

        // Calculate stats for all statuses
        const total = complaintRes.data.length;
        const resolved = complaintRes.data.filter(c => c.status === 'Resolved').length;
        const pending = complaintRes.data.filter(c => c.status === 'Pending').length;
        const inProgress = complaintRes.data.filter(c => c.status === 'In Progress').length;

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
  }, [id]);

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
      case 'Pending': return 'In Progress';
      case 'In Progress': return 'Resolved';
      default: return 'Pending';
    }
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
            while (compressedImage.length > 1024 * 1124 && quality > 0.3) {
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
      const formData = {
        ...resolutionForm,
        resolutionDays: resolutionForm.resolutionDays === '' ? 0 : parseInt(resolutionForm.resolutionDays) || 0
      };
      
      const res = await API.post(`/complaints/${editingComplaintId}/resolution-update`, formData);
      
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
      
      alert('Resolution update added successfully');
      closeResolutionForm();
    } catch (err) {
      console.error("Error adding resolution update:", err);
      alert("Failed to add resolution update: " + (err.response?.data?.message || err.message));
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
  ].filter(item => item.value > 0); // Only show statuses that have complaints

  // Chart data for complaints over time
  const complaintTrendData = [
    { month: 'Jan', complaints: 4 },
    { month: 'Feb', complaints: 3 },
    { month: 'Mar', complaints: 6 },
    { month: 'Apr', complaints: 5 },
    { month: 'May', complaints: 8 },
    { month: 'Jun', complaints: 7 },
  ];

  // Map complaints by location
  const complaintsByLocation = {};
  complaints.forEach(c => {
    const location = c.location || 'Unknown';
    complaintsByLocation[location] = (complaintsByLocation[location] || 0) + 1;
  });

  const locationData = Object.entries(complaintsByLocation).map(([location, count]) => ({
    location,
    complaints: count
  }));

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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="form-container">
            <div>
              <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{department?.departmentName}</h1>
              <p className="text-muted">Department Head: {department?.headName || 'N/A'}</p>
            </div>
            
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
                  <p className="kpi-percent">{stats.totalComplaints > 0 ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}%</p>
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
                  <Clock size={24} />
                </div>
                <div className="kpi-content">
                  <p className="kpi-label">In Progress</p>
                  <h3 className="kpi-value">{stats.inProgressComplaints}</h3>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon avg">
                  <TrendingUp size={24} />
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complaintStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
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
              </div>

              {/* Complaint Trend Chart */}
              <div className="chart-card">
                <h3>Complaints Trend (6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={complaintTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="complaints" stroke="#005b5f" strokeWidth={2} dot={{ fill: '#005b5f', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Complaints by Location */}
              {locationData.length > 0 && (
                <div className="chart-card">
                  <h3>Complaints by Location</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="complaints" fill="#00897b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            {performance && (
              <div className="performance-card">
                <h3>Performance Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric">
                    <label>Satisfaction Score</label>
                    <div className="metric-value">{performance.citizenSatisfactionScore}/5 <Star size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} /></div>
                  </div>
                  <div className="metric">
                    <label>Resolution Rate</label>
                    <div className="metric-value">{performance.complaintResolutionRate}%</div>
                  </div>
                  <div className="metric">
                    <label>Budget Utilization</label>
                    <div className="metric-value">{performance.budgetUtilization}%</div>
                  </div>
                  <div className="metric">
                    <label>Performance Rating</label>
                    <div className="metric-value">{performance.performanceRating}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Department Complaints</h2>
            
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
                          <span className={`badge ${
                            complaint.status === 'Resolved' ? 'bg-success' : 
                            complaint.status === 'Pending' ? 'bg-warning' : 
                            complaint.status === 'In Progress' ? 'bg-info' : 'bg-secondary'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewComplaintDetails(complaint._id)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary ml-2"
                            onClick={() => updateComplaintStatus(complaint._id, getNextStatus(complaint.status))}
                          >
                            {getNextStatus(complaint.status)}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info ml-2"
                            onClick={() => openResolutionForm(complaint._id, complaint)}
                          >
                            Resolution
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Department Performance</h2>
            <PerformanceForm departmentId={id} />
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Resource Allocation</h2>
            <ResourceAllocationForm departmentId={id} />
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="form-container">
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Status Update</h2>
            <StatusUpdateForm departmentId={id} />
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
                        <span className={`badge ml-2 ${
                          selectedComplaint.status === 'Resolved' ? 'bg-success' : 
                          selectedComplaint.status === 'Pending' ? 'bg-warning' : 
                          selectedComplaint.status === 'In Progress' ? 'bg-info' : 'bg-secondary'
                        }`}>
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
                  <button type="submit" className="btn btn-primary">
                    Add Resolution Update
                  </button>
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