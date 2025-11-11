import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Edit, Trash2, Plus, X } from "lucide-react";
import API from '../services/api';

const Schema = Yup.object().shape({
  complaintID: Yup.string().required('Complaint is required'),
  departmentID: Yup.string().required('Department is required'),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  resolutionDays: Yup.number().required('Resolution days required').min(1),
  assignedTo: Yup.string().required('Assigned to is required'),
  progressPercentage: Yup.number().required('Progress required').min(0).max(100),
  remarks: Yup.string().required('Remarks required').min(10)
});

export default function StatusUpdateForm({ departmentId }){
  const [depts, setDepts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    complaintID: '',
    departmentID: departmentId || '', // Set default to current department
    status: 'Pending',
    priority: 'Normal',
    resolutionDays: 1,
    assignedTo: '',
    progressPercentage: 0,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, [departmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch only the current department
      const deptRes = await API.get(`/departments/${departmentId}`);
      
      // Fetch complaints for this department only
      const complaintsRes = await API.get(`/complaints?departmentId=${departmentId}`);
      
      // Fetch all users (this might need to be filtered based on your requirements)
      const usersRes = await API.get('/users');
      
      // Fetch status updates for this department only
      const itemsRes = await API.get(`/departments/status/department/${departmentId}`).catch((err) => {
        console.error('Error fetching status updates:', err);
        return { data: [] };
      });
      
      setDepts([deptRes.data]); // Only set the current department
      setComplaints(complaintsRes.data);
      setUsers(usersRes.data);
      
      // Fix: Check if itemsRes.data exists, otherwise use itemsRes directly
      const statusData = itemsRes.data || itemsRes || [];
      console.log('Fetched status updates:', statusData); // Debug log
      setItems(statusData);
      
      // Update initial values to include the department ID
      setInitialValues(prev => ({
        ...prev,
        departmentID: departmentId
      }));
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setInitialValues(item);
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this status update?')) {
      try {
        await API.delete(`/departments/status/${id}`);
        alert('Status deleted!');
        fetchData();
      } catch (err) {
        console.error('Error:', err);
        alert('Error deleting status!');
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setInitialValues({
      complaintID: '',
      departmentID: departmentId || '',
      status: 'Pending',
      priority: 'Normal',
      resolutionDays: 1,
      assignedTo: '',
      progressPercentage: 0,
      remarks: ''
    });
  };

  return (
    <div>
      <div className="form-header">
        <h2>Complaint Status Management</h2>
        {editId && (
          <button className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} /> Cancel Edit
          </button>
        )}
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Schema}
        onSubmit={async (vals, { resetForm }) => {
          try {
            // Ensure department ID is set
            const values = { ...vals, departmentID: departmentId };
            
            console.log('Submitting status update:', values); // Debug log
            
            let response;
            if (editId) {
              response = await API.put(`/departments/status/${editId}`, values);
              alert('Status updated!');
            } else {
              response = await API.post('/departments/status', values);
              alert('Status created!');
              resetForm();
            }
            
            console.log('Status update response:', response); // Debug log
            setEditId(null);
            fetchData();
          } catch (err) {
            console.error('Error saving status:', err);
            alert('Error saving status: ' + (err.response?.data?.message || err.message));
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="form-container status-update-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Complaint *</label>
                <Field as="select" name="complaintID" className="form-control">
                  <option value="">Select complaint</option>
                  {complaints.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.complaintType})
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="complaintID" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Department *</label>
                <Field as="select" name="departmentID" className="form-control" disabled>
                  <option value="">Select department</option>
                  {depts.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.departmentName}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="departmentID" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Current Status *</label>
                <Field as="select" name="status" className="form-control">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Priority Level *</label>
                <Field as="select" name="priority" className="form-control">
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Field>
                <ErrorMessage name="priority" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Progress (%) *</label>
                <div className="progress-input">
                  <Field name="progressPercentage" type="range" min="0" max="100" className="form-control form-range" />
                  <span className="progress-value">{values.progressPercentage}%</span>
                </div>
                <ErrorMessage name="progressPercentage" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Assigned To *</label>
                <Field as="select" name="assignedTo" className="form-control">
                  <option value="">Select person</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="assignedTo" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Expected Resolution Days *</label>
                <Field name="resolutionDays" type="number" className="form-control" min="1" />
                <ErrorMessage name="resolutionDays" component="div" className="text-danger small" />
              </div>

              <div className="form-group full-width">
                <label>Update Remarks *</label>
                <Field as="textarea" name="remarks" className="form-control" rows="4" placeholder="Describe the current status and actions taken..." />
                <ErrorMessage name="remarks" component="div" className="text-danger small" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Plus size={16} /> {editId ? 'Update Status' : 'Create Status'}
              </button>
              {editId && (
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  <X size={16} /> Cancel
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <hr />
      <h3>Status Updates</h3>
      {loading ? (
        <div className="text-center"><p>Loading...</p></div>
      ) : items.length === 0 ? (
        <div className="empty-state"><p>No status updates yet</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Department</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Assigned To</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id}>
                  <td><strong>{it.complaintID?.title?.substring(0, 20)}...</strong></td>
                  <td>{it.departmentID?.departmentName}</td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: it.status === 'Resolved' ? '#4caf50' : it.status === 'Closed' ? '#9e9e9e' : '#005b5f'
                    }}>
                      {it.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: it.priority === 'Critical' ? '#d32f2f' : it.priority === 'High' ? '#ff9800' : '#4caf50'
                    }}>
                      {it.priority}
                    </span>
                  </td>
                  <td>
                    <div className="progress" style={{height: '20px'}}>
                      <div 
                        className="progress-bar" 
                        style={{
                          width: `${it.progressPercentage}%`,
                          backgroundColor: '#005b5f'
                        }}
                      >
                        {it.progressPercentage}%
                      </div>
                    </div>
                  </td>
                  <td>{it.assignedTo?.fullName || 'Unassigned'}</td>
                  <td className="text-muted">{new Date(it.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(it)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(it._id)} title="Delete">
                      <Trash2 size={16} />
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
}