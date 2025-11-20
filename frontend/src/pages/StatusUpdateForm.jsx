import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Edit, Trash2, Plus, X } from "lucide-react";
import API from '../services/api';

const Schema = Yup.object().shape({
  complaintID: Yup.string().required('Complaint is required'),
  departmentID: Yup.string().required('Department is required'),
  status: Yup.string().required('Status is required').oneOf(['New', 'Accepted', 'Working', 'On Hold', 'Resolved', 'Closed', 'Rejected']),
  priority: Yup.string().required('Priority is required'),
  resolutionDays: Yup.number().required('Resolution days required').min(1),
  assignedTo: Yup.string().required('Assigned to is required'),
  progressPercentage: Yup.number().required('Progress required').min(0).max(100),
  remarks: Yup.string().required('Remarks required').min(10)
});

export default function StatusUpdateForm({ departmentId, complaintId, onCancel, onSuccess }){
  const isModalMode = !!complaintId;

  // Function to get next status options based on current status
  const getNextStatusOptions = (currentStatus) => {
    // If no current status, return all initial options
    if (!currentStatus || currentStatus === '') {
      return ['New'];
    }
    
    // Handle "Pending" status if it exists in the data
    if (currentStatus === 'Pending') {
      return ['Accepted', 'Rejected'];
    }
    
    switch (currentStatus) {
      case 'New': return ['Accepted', 'Rejected'];
      case 'Accepted': return ['Working', 'On Hold'];
      case 'Working': return ['Resolved', 'On Hold'];
      case 'On Hold': return ['Working'];
      case 'Resolved': return ['Closed'];
      case 'Closed': return ['Accepted']; // Reopen case
      case 'Rejected': return ['Accepted']; // Reopen rejected case
      default: return ['New'];
    }
  };

  // Function to calculate progress percentage based on status
  const calculateProgressPercentage = (status) => {
    switch (status) {
      case 'New': return 0;
      case 'Accepted': return 10;
      case 'Working': return 50;
      case 'On Hold': return 30;
      case 'Resolved': return 90;
      case 'Closed': return 100;
      case 'Rejected': return 0; // Rejected complaints have 0% progress
      default: return 0;
    }
  };

  // Function to get the default next status based on current status
  const getDefaultNextStatus = (currentStatus) => {
    const options = getNextStatusOptions(currentStatus);
    // Return the first option as the default
    return options.length > 0 ? options[0] : 'New';
  };

  const [depts, setDepts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    complaintID: '',
    departmentID: departmentId || '', // Set default to current department
    status: 'New',
    priority: 'Normal',
    resolutionDays: 1,
    assignedTo: '',
    progressPercentage: 0,
    remarks: ''
  });

  // Update the status field value when complaint status changes (for modal mode)
  useEffect(() => {
    if (isModalMode && complaintId) {
      // If complaints are already loaded, use them
      if (complaints.length > 0) {
        const complaint = complaints.find(c => c._id === complaintId);
        if (complaint) {
          // Set the default next status based on current complaint status
          const nextStatus = getDefaultNextStatus(complaint.status);
          setInitialValues(prev => ({
            ...prev,
            status: nextStatus
          }));
        }
      }
      // If complaints aren't loaded yet, we'll rely on the fetchData function
    }
  }, [complaintId, complaints, isModalMode]);

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
      setItems(statusData);
      
      // Update initial values to include the department ID and pre-selected complaint if in modal mode
      // Also fetch the current status of the complaint
      if (complaintId && complaintsRes.data.length > 0) {
        const complaint = complaintsRes.data.find(c => c._id === complaintId);
        if (complaint) {
          // For modal mode, set the status to the next status according to workflow rules
          const nextStatus = getDefaultNextStatus(complaint.status);
          setInitialValues(prev => ({
            ...prev,
            departmentID: departmentId,
            complaintID: complaintId,
            status: nextStatus
          }));
        }
      } else {
        setInitialValues(prev => ({
          ...prev,
          departmentID: departmentId,
          complaintID: complaintId || ''
        }));
      }
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
      status: 'New',
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
        <h2>{isModalMode ? 'Update Complaint Status' : 'Complaint Status Management'}</h2>
        {editId ? (
          <button className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} /> Cancel Edit
          </button>
        ) : isModalMode && onCancel ? (
          <button className="btn btn-secondary" onClick={onCancel}>
            <X size={16} /> Close
          </button>
        ) : null}
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Schema}
        onSubmit={async (vals, { resetForm }) => {
          try {
            // Ensure department ID is set
            const values = { ...vals, departmentID: departmentId };
            
            let response;
            if (editId) {
              response = await API.put(`/departments/status/${editId}`, values);
              alert('Status updated!');
            } else {
              response = await API.post('/departments/status', values);
              alert('Status created!');
              resetForm();
            }
            
            setEditId(null);
            fetchData();
            
            // Call onSuccess callback if provided (for modal mode)
            if (onSuccess) {
              onSuccess();
            }
          } catch (err) {
            console.error('Error saving status:', err);
            alert('Error saving status: ' + (err.response?.data?.message || err.message));
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          // Find the current complaint to display its current status
          // First try to find by values.complaintID, then by complaintId prop (for modal mode)
          const currentComplaint = complaints.find(c => c._id === values.complaintID) || 
                                  (isModalMode && complaintId ? complaints.find(c => c._id === complaintId) : null);
          
          // Get next status options based on current complaint status
          const nextStatusOptions = currentComplaint ? getNextStatusOptions(currentComplaint.status) : ['New'];
          const defaultNextStatus = nextStatusOptions.length > 0 ? nextStatusOptions[0] : 'New';
          
          return (
            <Form className={isModalMode ? "status-update-form" : "form-container status-update-form"}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Complaint *</label>
                  <Field as="select" name="complaintID" className="form-control" disabled={isModalMode}>
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

                {/* Display current status when in modal mode */}
                {isModalMode && currentComplaint && (
                  <div className="form-group">
                    <label>Current Status</label>
                    <div className="form-control" style={{backgroundColor: '#f8f9fa'}}>
                      <span className="badge" style={{
                        backgroundColor: currentComplaint.status === 'New' ? '#9e9e9e' : 
                        currentComplaint.status === 'Accepted' ? '#4caf50' : 
                        currentComplaint.status === 'Working' ? '#2196f3' : 
                        currentComplaint.status === 'On Hold' ? '#ff9800' : 
                        currentComplaint.status === 'Resolved' ? '#00897b' : 
                        currentComplaint.status === 'Closed' ? '#9c27b0' : 
                        currentComplaint.status === 'Rejected' ? '#f44336' : '#005b5f'
                      }}>
                        {currentComplaint.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Next Status *</label>
                  {isModalMode ? (
                    <Field 
                      as="select" 
                      name="status" 
                      className="form-control"
                      onChange={(e) => {
                        const status = e.target.value;
                        setFieldValue('status', status);
                        // Automatically update progress when status changes
                        const progress = calculateProgressPercentage(status);
                        setFieldValue('progressPercentage', progress);
                      }}
                    >
                      <option value="">Select status</option>
                      {nextStatusOptions.map(statusOption => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </Field>
                  ) : (
                    <Field 
                      as="select" 
                      name="status" 
                      className="form-control"
                      onChange={(e) => {
                        const status = e.target.value;
                        setFieldValue('status', status);
                        // Automatically update progress when status changes
                        const progress = calculateProgressPercentage(status);
                        setFieldValue('progressPercentage', progress);
                      }}
                    >
                      <option value="">Select status</option>
                      {(() => {
                        // For non-modal mode, show options based on selected complaint's current status
                        const currentStatus = currentComplaint ? currentComplaint.status : '';
                        const options = getNextStatusOptions(currentStatus);
                        return options.map(statusOption => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ));
                      })()}
                    </Field>
                  )}
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
                    <Field 
                      name="progressPercentage" 
                      type="number" 
                      className="form-control" 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
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
          );
        }}
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
                      backgroundColor: it.status === 'New' ? '#9e9e9e' : 
                      it.status === 'Accepted' ? '#4caf50' : 
                      it.status === 'Working' ? '#2196f3' : 
                      it.status === 'On Hold' ? '#ff9800' : 
                      it.status === 'Resolved' ? '#00897b' : 
                      it.status === 'Closed' ? '#9c27b0' : 
                      it.status === 'Rejected' ? '#f44336' : '#005b5f'
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