import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, User, CheckCircle, Plus, Grid3x3, List } from "lucide-react";
import API from "../services/api";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/departments");
        setDepartments(res.data);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5"><h4>Loading departments...</h4></div>;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2.5rem',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Departments Directory</h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>Total Departments: <strong>{departments.length}</strong></p>
        </div>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <div className="view-toggle" style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
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
        <div className="empty-state">
          <p>No departments found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="departments-grid">
          {departments.map((d) => (
            <div 
              key={d._id} 
              className="dept-card"
              onClick={() => navigate(`/department/${d._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="dept-header-card">
                <h4 className="dept-name">{d.departmentName}</h4>
                {d.isActive && <span className="active-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle size={16} /> Active</span>}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Department Head</th>
                <th>Location</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr 
                  key={d._id} 
                  className="clickable-row" 
                  onClick={() => navigate(`/department/${d._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><strong>{d.departmentName}</strong></td>
                  <td>{d.headName || '-'}</td>
                  <td>{d.city || '-'}</td>
                  <td>{d.contactEmail ? <a href={`mailto:${d.contactEmail}`}>{d.contactEmail}</a> : '-'}</td>
                  <td>{d.contactNumber ? <a href={`tel:${d.contactNumber}`}>{d.contactNumber}</a> : '-'}</td>
                  <td>
                    {d.isActive ? (
                      <span className="badge" style={{backgroundColor: '#005b5f'}}>Active</span>
                    ) : (
                      <span className="badge" style={{backgroundColor: '#ccc'}}>Inactive</span>
                    )}
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