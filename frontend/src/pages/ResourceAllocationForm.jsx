import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Edit, Trash2, Plus, X } from "lucide-react";
import API from '../services/api';

const Schema = Yup.object().shape({
  departmentID: Yup.string().required('Department is required'),
  resourceType: Yup.string().required('Resource type is required').min(3),
  quantity: Yup.number().required('Quantity is required').min(1),
  cost: Yup.number().required('Cost is required').min(0),
  allocationDate: Yup.date().required('Date is required'),
  allocatedBy: Yup.string().required('Allocated by is required'),
  priority: Yup.string().required('Priority is required'),
  status: Yup.string().required('Status is required'),
  remarks: Yup.string().min(5)
});

const ResourceAllocationForm = ({ departmentId }) => {
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    departmentID: departmentId || '',
    resourceType: '',
    quantity: 1,
    cost: 0,
    allocationDate: new Date().toISOString().split('T')[0],
    allocatedBy: '',
    priority: 'Medium',
    status: 'Pending',
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, usersRes, itemsRes] = await Promise.all([
        API.get('/departments'),
        API.get('/users'),
        API.get('/departments/allocation/all').catch(() => ({ data: [] }))
      ]);
      setDepts(deptsRes.data);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setInitialValues({
      ...item,
      allocationDate: item.allocationDate?.split('T')[0]
    });
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this allocation?')) {
      try {
        await API.delete(`/departments/allocation/${id}`);
        alert('Allocation deleted!');
        fetchData();
      } catch (err) {
        console.error('Error:', err);
        alert('Error deleting allocation!');
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setInitialValues({
      departmentID: departmentId || '',
      resourceType: '',
      quantity: 1,
      cost: 0,
      allocationDate: new Date().toISOString().split('T')[0],
      allocatedBy: '',
      priority: 'Medium',
      status: 'Pending',
      remarks: ''
    });
  };

  return (
    <div>
      <div className="form-header">
        <h2>Resource Allocation Management</h2>
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
            if (editId) {
              await API.put(`/departments/allocation/${editId}`, vals);
              alert('Allocation updated!');
            } else {
              await API.post('/departments/allocation', vals);
              alert('Allocation created!');
              resetForm();
            }
            setEditId(null);
            fetchData();
          } catch (err) {
            console.error('Error:', err);
            alert('Error saving allocation!');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="form-container resource-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Department *</label>
                <Field as="select" name="departmentID" className="form-control">
                  <option value="">Select Department</option>
                  {depts.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                </Field>
                <ErrorMessage name="departmentID" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Resource Type *</label>
                <Field as="select" name="resourceType" className="form-control">
                  <option value="">Select Type</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Budget">Budget</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Technology">Technology</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Other">Other</option>
                </Field>
                <ErrorMessage name="resourceType" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <Field name="quantity" type="number" className="form-control" min="1" />
                <ErrorMessage name="quantity" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Estimated Cost (₹) *</label>
                <Field name="cost" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="cost" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Allocation Date *</label>
                <Field name="allocationDate" type="date" className="form-control" />
                <ErrorMessage name="allocationDate" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Allocated By *</label>
                <Field as="select" name="allocatedBy" className="form-control">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </Field>
                <ErrorMessage name="allocatedBy" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Priority Level *</label>
                <Field as="select" name="priority" className="form-control">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Field>
                <ErrorMessage name="priority" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Status *</label>
                <Field as="select" name="status" className="form-control">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Allocated">Allocated</option>
                  <option value="In Use">In Use</option>
                  <option value="Returned">Returned</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-danger small" />
              </div>

              <div className="form-group full-width">
                <label>Remarks</label>
                <Field as="textarea" name="remarks" className="form-control" rows="3" placeholder="Add any additional notes..." />
                <ErrorMessage name="remarks" component="div" className="text-danger small" />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Plus size={16} /> {editId ? 'Update Allocation' : 'Create Allocation'}
              </button>
              {editId && (
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <hr />
      <h3>Allocations List</h3>
      {loading ? (
        <div className="text-center"><p>Loading...</p></div>
      ) : items.length === 0 ? (
        <div className="empty-state"><p>No allocations found</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Resource Type</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id}>
                  <td><strong>{it.departmentID?.departmentName}</strong></td>
                  <td>{it.resourceType}</td>
                  <td>{it.quantity}</td>
                  <td>₹{it.cost?.toLocaleString() || '0'}</td>
                  <td>
                    <span className="badge" style={{
                      backgroundColor: it.priority === 'Critical' ? '#d32f2f' : it.priority === 'High' ? '#ff9800' : '#4caf50'
                    }}>
                      {it.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{backgroundColor: '#005b5f'}}>
                      {it.status}
                    </span>
                  </td>
                  <td>{new Date(it.allocationDate).toLocaleDateString()}</td>
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
};

export default ResourceAllocationForm;
