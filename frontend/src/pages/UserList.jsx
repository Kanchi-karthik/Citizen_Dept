import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import API from "../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userComplaints, setUserComplaints] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      // Fetch user details
      const userRes = await API.get(`/users/${userId}`);
      
      // Fetch user complaints
      const complaintsRes = await API.get(`/complaints?userId=${userId}`);
      
      // Fetch user feedbacks
      const feedbacksRes = await API.get(`/feedbacks?userId=${userId}`);
      
      setSelectedUser(userRes.data);
      setUserComplaints(complaintsRes.data);
      setUserFeedbacks(feedbacksRes.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
      // Show error message to user
      alert("Failed to fetch user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setUserComplaints([]);
    setUserFeedbacks([]);
  };

  if (loading) return <div className="text-center mt-5"><h4>Loading users...</h4></div>;

  return (
    <div>
      <h2>Users</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-muted">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <code>{u.userId || 'N/A'}</code>
                  </td>
                  <td><strong>{u.fullName || 'N/A'}</strong></td>
                  <td>{u.email || 'N/A'}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.location || '-'}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{
                        backgroundColor: u.role === 'admin' ? '#d32f2f' : '#005b5f'
                      }}
                    >
                      {u.role ? u.role.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => fetchUserDetails(u._id)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="user-detail-modal-overlay" onClick={closeModal}>
          <div className="user-detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="user-detail-modal-close" onClick={closeModal}>&times;</button>
            <h3>User Details</h3>
            
            <div className="user-detail-modal-body">
              {/* User Information */}
              <div className="detail-section">
                <h5>Personal Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>User ID:</strong> {selectedUser.userId || 'N/A'}</p>
                    <p><strong>Full Name:</strong> {selectedUser.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                    <p><strong>Location:</strong> {selectedUser.location || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Role:</strong> 
                      <span 
                        className="badge ml-2" 
                        style={{
                          backgroundColor: selectedUser.role === 'admin' ? '#d32f2f' : '#005b5f'
                        }}
                      >
                        {selectedUser.role ? selectedUser.role.toUpperCase() : 'N/A'}
                      </span>
                    </p>
                    <p><strong>Gender:</strong> {selectedUser.gender || 'N/A'}</p>
                    <p><strong>Age:</strong> {selectedUser.age || 'N/A'}</p>
                    <p><strong>Work:</strong> {selectedUser.work || 'N/A'}</p>
                    <p><strong>Member Since:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Volunteering Information */}
              {(selectedUser.volunteering || (selectedUser.volunteeringTypes && selectedUser.volunteeringTypes.length > 0) || selectedUser.volunteeringDays) && (
                <div className="detail-section">
                  <h5>Volunteering</h5>
                  {selectedUser.volunteering && <p><strong>Volunteering Interest:</strong> {selectedUser.volunteering}</p>}
                  {selectedUser.volunteeringTypes && selectedUser.volunteeringTypes.length > 0 && (
                    <p><strong>Volunteering Types:</strong> {selectedUser.volunteeringTypes.join(', ')}</p>
                  )}
                  {selectedUser.volunteeringDays && <p><strong>Available Days:</strong> {selectedUser.volunteeringDays}</p>}
                </div>
              )}

              {/* Complaints */}
              <div className="detail-section">
                <h5>Complaints ({userComplaints.length})</h5>
                {userComplaints.length === 0 ? (
                  <p className="text-muted">No complaints filed by this user.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Complaint ID</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userComplaints.map(complaint => (
                          <tr key={complaint._id}>
                            <td><code>{complaint.complaintId || 'N/A'}</code></td>
                            <td>{complaint.title || 'N/A'}</td>
                            <td>
                              <span className={`badge ${
                                complaint.status === 'Resolved' ? 'bg-success' : 
                                complaint.status === 'Pending' ? 'bg-warning' : 
                                complaint.status === 'In Progress' ? 'bg-info' : 'bg-secondary'
                              }`}>
                                {complaint.status || 'N/A'}
                              </span>
                            </td>
                            <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Feedbacks */}
              <div className="detail-section">
                <h5>Feedbacks ({userFeedbacks.length})</h5>
                {userFeedbacks.length === 0 ? (
                  <p className="text-muted">No feedback provided by this user.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Feedback ID</th>
                          <th>Complaint</th>
                          <th>Rating</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userFeedbacks.map(feedback => (
                          <tr key={feedback._id}>
                            <td><code>{feedback.feedbackId || 'N/A'}</code></td>
                            <td>{(feedback.complaint && feedback.complaint.title) || 'N/A'}</td>
                            <td>
                              <span className="badge bg-primary">
                                {feedback.rating ? `${feedback.rating}/5` : 'N/A'}
                              </span>
                            </td>
                            <td>{feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;