import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, User, CheckCircle, Plus, Grid3x3, List, Bell, RefreshCw, Building } from "lucide-react";
import API from "../services/api";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshed, setAutoRefreshed] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await API.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for complaint filed events
    const handleComplaintFiled = () => {
      // Add a delay to ensure the backend has processed the complaint
      setTimeout(() => {
        fetchData();
        // Show a notification that the data has been refreshed
        setAutoRefreshed(true);
        // Hide the notification after 3 seconds
        setTimeout(() => {
          setAutoRefreshed(false);
        }, 3000);
      }, 2000);
    };
    
    window.addEventListener('complaintFiled', handleComplaintFiled);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('complaintFiled', handleComplaintFiled);
    };
  }, []);
  
  if (loading) return <div className="text-center mt-5"><h4>Loading departments...</h4></div>;

  return (
    <div>
      {autoRefreshed && (
        <div className="notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeInOut 3s ease-in-out'
        }}>
          <CheckCircle size={20} />
          Department data automatically updated!
        </div>
      )}
      <div className="dashboard-header">
        <div>
          <div>
            <h2>Departments Directory</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>
              Total Departments: <strong>{departments.length}</strong>
              {departments.reduce((total, dept) => total + (dept.complaintCount || 0), 0) > 0 && (
                <span>
                  {" | "}Total Complaints: <strong style={{color: 'var(--accent)'}}>{departments.reduce((total, dept) => total + (dept.complaintCount || 0), 0)}</strong>
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <button
            className="btn-accent"
            onClick={() => navigate('/department-login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '50px',
              padding: '0.7rem 1.8rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 4px 15px rgba(37, 117, 252, 0.3)'
            }}
          >
            <User size={20} /> Department Login
          </button>
          <div className="view-toggle">
            <button 
              className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                fontSize: '0.95rem'
              }}
            >
              <Grid3x3 size={18} /> Grid
            </button>
            <button 
              className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                fontSize: '0.95rem'
              }}
            >
              <List size={18} /> List
            </button>
            <button 
              className="btn-view"
              onClick={fetchData}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                background: refreshing ? 'var(--primary)' : 'var(--white)',
                color: refreshing ? 'var(--white)' : 'var(--primary)',
                border: '2px solid var(--primary-light)'
              }}
              title="Refresh department data"
              disabled={refreshing}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'var(--primary-light)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'var(--white)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {refreshing ? (
                <>
                  <RefreshCw size={18} className="spin" /> Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={18} /> Refresh
                </>
              )}
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/department-form')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '50px',
              padding: '0.7rem 1.8rem',
              fontSize: '0.95rem',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={20} /> Add
          </button>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-light)',
          fontSize: '1.1rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 91, 95, 0.05)',
          border: '1px dashed var(--border-color)'
        }}>
          <Building size={48} style={{margin: '0 auto 1rem', color: 'var(--primary-light)'}} />
          <p>No departments found</p>
          <button 
            className="btn-accent"
            onClick={() => navigate('/department-form')}
            style={{marginTop: '1rem'}}
          >
            <Plus size={18} /> Create First Department
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="departments-grid">
          {departments.map((d, index) => (
            <div 
              key={d._id} 
              className="dept-card"
              onClick={() => navigate(`/department/${d._id}`)}
              style={{ cursor: 'pointer', animation: `fadeIn 0.3s ease-out ${index * 0.1}s both` }}
            >
              <div className="dept-header-card">
                <h4 className="dept-name">{d.departmentName}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {d.isActive && <span className="active-badge"><CheckCircle size={16} /> Active</span>}
                  {d.complaintCount > 0 && (
                    <span className="complaint-count-badge">
                      <Bell size={14} />
                      {d.complaintCount}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="dept-info">
                {d.headName && (
                  <div className="info-row">
                    <User size={16} className="icon" />
                    <div>
                      <label>Department Head</label>
                      <p>{d.headName}</p>
                    </div>
                  </div>
                )}
                
                {d.city && (
                  <div className="info-row">
                    <MapPin size={16} className="icon" />
                    <div>
                      <label>Location</label>
                      <p>{d.city}</p>
                    </div>
                  </div>
                )}
                
                {d.contactEmail && (
                  <div className="info-row">
                    <Mail size={16} className="icon" />
                    <div>
                      <label>Email</label>
                      <p><a href={`mailto:${d.contactEmail}`}>{d.contactEmail}</a></p>
                    </div>
                  </div>
                )}
                
                {d.contactNumber && (
                  <div className="info-row">
                    <Phone size={16} className="icon" />
                    <div>
                      <label>Phone</label>
                      <p><a href={`tel:${d.contactNumber}`}>{d.contactNumber}</a></p>
                    </div>
                  </div>
                )}
              </div>
              
              {d.description && (
                <div className="dept-description">
                  <label>Description</label>
                  <p>{d.description}</p>
                </div>
              )}
              
              <div className="dept-footer">
                <small className="text-muted">Created: {new Date(d.createdAt).toLocaleDateString()}</small>
                <button 
                  className="btn btn-sm btn-primary ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/department-login/${d._id}`);
                  }}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Login
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive" style={{backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 91, 95, 0.1)'}}>
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Head</th>
                <th>Location</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Complaints</th>
                <th>Status</th>
                <th>Login</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, index) => (
                <tr 
                  key={d._id} 
                  className="clickable-row" 
                  onClick={() => navigate(`/department/${d._id}`)}
                  style={{ cursor: 'pointer', animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <td><strong>{d.departmentName}</strong></td>
                  <td>{d.headName || '-'}</td>
                  <td>{d.city || '-'}</td>
                  <td>{d.contactEmail ? <a href={`mailto:${d.contactEmail}`}>{d.contactEmail}</a> : '-'}</td>
                  <td>{d.contactNumber ? <a href={`tel:${d.contactNumber}`}>{d.contactNumber}</a> : '-'}</td>
                  <td>
                    {d.complaintCount > 0 ? (
                      <span className="complaint-count-badge">
                        <Bell size={14} />
                        {d.complaintCount}
                      </span>
                    ) : (
                      <span>0</span>
                    )}
                  </td>
                  <td>
                    {d.isActive ? (
                      <span className="badge" style={{backgroundColor: 'var(--success)', color: 'white'}}>Active</span>
                    ) : (
                      <span className="badge" style={{backgroundColor: '#ccc', color: 'var(--text-dark)'}}>Inactive</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/department-login/${d._id}`);
                      }}
                    >
                      Login
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;