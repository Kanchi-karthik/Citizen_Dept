import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Grid3x3, List, Image, MapPin, User, Building } from "lucide-react";
import API from "../services/api";

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaints");
        setComplaints(res.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div className="text-center mt-5"><h4>Loading complaints...</h4></div>;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>Complaints</h2>
        <button
          className="btn-primary"
          onClick={() => navigate('/complaint-form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '50px',
            padding: '0.6rem 1.5rem'
          }}
        >
          <Plus size={20} /> File Complaint
        </button>
      </div>
      <div className="complaints-grid">
        {complaints.length === 0 ? (
          <p className="text-muted">No complaints found</p>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="complaint-card">
              {c.image ? (
                <img 
                  src={c.image} 
                  alt={c.title} 
                  className="complaint-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBmMmYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwNWI1ZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
              ) : (
                <div className="complaint-image" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#e0f2f1',
                  color: '#005b5f',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  <Image size={24} style={{ marginRight: '0.5rem' }} />
                  No Image
                </div>
              )}
              <div className="complaint-content">
                <h5 className="complaint-title">{c.title}</h5>
                <p className="complaint-description">{c.description?.substring(0, 120)}...</p>
                <div className="complaint-meta">
                  <span className="badge">{c.complaintType}</span>
                  <span className={`status-badge ${c.status?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}`}>{c.status}</span>
                </div>
                <div className="complaint-footer">
                  <small><MapPin size={14} style={{ marginRight: '0.25rem' }} /> {c.location || 'Not specified'}</small>
                  <small><User size={14} style={{ marginRight: '0.25rem' }} /> {c.user?.fullName || 'Unknown User'}</small>
                  <small><Building size={14} style={{ marginRight: '0.25rem' }} /> {c.department?.departmentName || 'Unassigned'}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
