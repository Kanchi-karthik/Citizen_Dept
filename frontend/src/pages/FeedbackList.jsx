import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import API from "../services/api";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await API.get("/feedbacks");
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Error loading feedbacks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  if (loading) return <div className="text-center mt-5"><h4>Loading feedbacks...</h4></div>;

  return (
    <div>
      <h2>Feedbacks</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Feedback Type</th>
              <th>Rating</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted">No feedbacks found</td></tr>
            ) : (
              feedbacks.map((f) => (
                <tr key={f._id}>
                  <td>
                    <strong>{f.user?.fullName || f.full_name}</strong>
                  </td>
                  <td>{f.email}</td>
                  <td>
                    <span className="badge" style={{backgroundColor: '#005b5f'}}>
                      {f.feedback_type}
                    </span>
                  </td>
                  <td>
                    <span className="text-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={16} />
                      <span>{f.rating}/5</span>
                    </span>
                  </td>
                  <td>{f.location}</td>
                  <td className="text-muted">
                    {new Date(f.experience_date || f.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackList;
