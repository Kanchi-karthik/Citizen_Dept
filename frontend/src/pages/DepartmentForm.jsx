import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { Edit, Trash2, Plus, X } from "lucide-react";

const DeptSchema = Yup.object().shape({
  departmentName: Yup.string().required('Department name is required').min(3, 'Minimum 3 characters'),
  departmentCode: Yup.string().required('Department code is required').min(2, 'Minimum 2 characters'),
  headName: Yup.string().required('Head name is required').min(3, 'Minimum 3 characters'),
  contactEmail: Yup.string().email('Invalid email').required('Email is required'),
  contactNumber: Yup.string().matches(/^[0-9()+-\s]{10,}$/, 'Invalid phone number').required('Phone is required'),
  city: Yup.string().required('City is required').min(2, 'Minimum 2 characters'),
  description: Yup.string().required('Description is required').min(10, 'Minimum 10 characters'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required').min(5, 'Minimum 5 characters'),
  website: Yup.string().url('Invalid website URL'),
  establishedYear: Yup.number().required('Year is required').min(1900).max(new Date().getFullYear()),
  employeeCount: Yup.number().required('Employee count is required').min(1),
  isActive: Yup.boolean(),
  agreement: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
  // Login credentials
  username: Yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  password: Yup.string()
    .when('$isEditing', {
      is: true,
      then: (schema) => schema,
      otherwise: (schema) => schema.required('Password is required').min(6, 'Minimum 6 characters')
    }),
  confirmPassword: Yup.string()
    .when('$isEditing', {
      is: true,
      then: (schema) => schema.oneOf([Yup.ref('password'), null], 'Passwords must match'),
      otherwise: (schema) => schema.required('Confirm Password is required').oneOf([Yup.ref('password'), null], 'Passwords must match')
    }),
});

export default function DepartmentForm(){
  const defaultValues = {
    departmentName: '',
    departmentCode: '',
    headName: '',
    contactEmail: '',
    contactNumber: '',
    city: '',
    state: '',
    address: '',
    description: '',
    website: '',
    establishedYear: new Date().getFullYear(),
    employeeCount: 0,
    isActive: true,
    agreement: false,
    // Login credentials
    username: '',
    password: '',
    confirmPassword: ''
  };

  const [initial, setInitial] = useState({ ...defaultValues });
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    // Ensure all fields have values, use defaults if undefined
    const editData = {
      departmentName: dept.departmentName || '',
      departmentCode: dept.departmentCode || '',
      headName: dept.headName || '',
      contactEmail: dept.contactEmail || '',
      contactNumber: dept.contactNumber || '',
      city: dept.city || '',
      state: dept.state || '',
      address: dept.address || '',
      description: dept.description || '',
      website: dept.website || '',
      establishedYear: dept.establishedYear || new Date().getFullYear(),
      employeeCount: dept.employeeCount || 0,
      isActive: dept.isActive !== undefined ? dept.isActive : true,
      agreement: false, // Always reset agreement for editing
      // Login credentials
      username: dept.username || '',
      password: '', // Don't prefill password for security
      confirmPassword: '' // Don't prefill confirmPassword for security
    };
    setInitial(editData);
    setEditId(dept._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await API.delete(`/departments/${id}`);
        alert('Department deleted successfully!');
        fetchDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Error deleting department!');
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setInitial({ ...defaultValues });
  };

  return (
    <div>
      <div className="form-header" style={{ 
        marginBottom: '1.5rem', 
        paddingBottom: '1rem', 
        borderBottom: '2px solid var(--primary-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>{editId ? 'Edit Department' : 'Create New Department'}</h2>
          <p style={{ color: 'var(--text-light)', margin: '0.5rem 0 0 0' }}>
            {editId ? 'Update department information and credentials' : 'Add a new department to the system'}
          </p>
        </div>
        {editId && (
          <button className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} /> Cancel Edit
          </button>
        )}
      </div>

      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={DeptSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            // Remove confirmPassword from the data being sent to backend
            const { confirmPassword, ...departmentData } = values;
            
            if (editId) {
              await API.put(`/departments/${editId}`, departmentData);
              alert('Department updated successfully!');
              setEditId(null);
              setInitial({ ...defaultValues });
            } else {
              await API.post('/departments', departmentData);
              alert('Department created successfully!');
              setInitial({ ...defaultValues });
            }
            fetchDepartments();
          } catch (err) {
            console.error('Error:', err);
            alert('Error saving department: ' + (err.response?.data?.message || err.message));
          } finally {
            setSubmitting(false);
          }
        }}
        context={{ isEditing: !!editId }}
      >
        {({ isSubmitting, values }) => (
          <Form className="form-container department-form">
            {/* Basic Department Information Section */}
            <div className="form-section">
              <h3 style={{ 
                color: 'var(--primary)', 
                borderBottom: '1px dashed var(--border-color)', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Basic Department Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Department Name *</label>
                  <Field as="select" name="departmentName" className="form-control">
                    <option value="">Select a Department</option>
                    <option value="Department of Sanitation and Waste Management">Department of Sanitation and Waste Management 🗑</option>
                    <option value="Department of Water Resources and Supply">Department of Water Resources and Supply 💧</option>
                    <option value="Department of Infrastructure and Public Works">Department of Infrastructure and Public Works 🏗</option>
                    <option value="Department of Environmental Protection and Pollution Control">Department of Environmental Protection and Pollution Control 🌫</option>
                    <option value="Department of Parks, Green Spaces, and Urban Development">Department of Parks, Green Spaces, and Urban Development 🌳</option>
                  </Field>
                  <ErrorMessage name="departmentName" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Department Code *</label>
                  <Field name="departmentCode" className="form-control" placeholder="e.g., DSW001" />
                  <ErrorMessage name="departmentCode" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Department Head *</label>
                  <Field name="headName" className="form-control" placeholder="Full name" />
                  <ErrorMessage name="headName" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Year Established *</label>
                  <Field name="establishedYear" type="number" className="form-control" min="1900" max={new Date().getFullYear()} />
                  <ErrorMessage name="establishedYear" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Number of Employees *</label>
                  <Field name="employeeCount" type="number" className="form-control" min="1" />
                  <ErrorMessage name="employeeCount" component="div" className="text-danger small" />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <Field as="textarea" name="description" className="form-control" rows="4" placeholder="Describe the department's functions and services" />
                  <ErrorMessage name="description" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section" style={{ 
              marginTop: '2rem', 
              paddingTop: '2rem', 
              borderTop: '1px dashed var(--border-color)' 
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                borderBottom: '1px dashed var(--border-color)', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Contact Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email Address *</label>
                  <Field name="contactEmail" type="email" className="form-control" placeholder="email@department.gov" />
                  <ErrorMessage name="contactEmail" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <Field name="contactNumber" className="form-control" placeholder="+91-XXXXXXXXXX" />
                  <ErrorMessage name="contactNumber" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <Field name="city" className="form-control" placeholder="City name" />
                  <ErrorMessage name="city" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <Field name="state" className="form-control" placeholder="State name" />
                  <ErrorMessage name="state" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <Field name="website" type="url" className="form-control" placeholder="https://department.gov" />
                  <ErrorMessage name="website" component="div" className="text-danger small" />
                </div>

                <div className="form-group full-width">
                  <label>Address *</label>
                  <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Full address" />
                  <ErrorMessage name="address" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            {/* Login Credentials Section */}
            <div className="form-section" style={{ 
              marginTop: '2rem', 
              paddingTop: '2rem', 
              borderTop: '1px dashed var(--border-color)' 
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                borderBottom: '1px dashed var(--border-color)', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Login Credentials
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <Field name="username" className="form-control" placeholder="Enter username for department login" />
                  <ErrorMessage name="username" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Password {editId ? '(Leave blank to keep current password)' : '*'}</label>
                  <Field name="password" type="password" className="form-control" placeholder="Enter password for department login" />
                  <ErrorMessage name="password" component="div" className="text-danger small" />
                </div>

                <div className="form-group">
                  <label>Confirm Password {editId ? '(Leave blank to keep current password)' : '*'}</label>
                  <Field name="confirmPassword" type="password" className="form-control" placeholder="Confirm password" />
                  <ErrorMessage name="confirmPassword" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="form-section" style={{ 
              marginTop: '2rem', 
              paddingTop: '2rem', 
              borderTop: '1px dashed var(--border-color)' 
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                borderBottom: '1px dashed var(--border-color)', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem' 
              }}>
                Additional Information
              </h3>
              <div className="form-grid">
                <div className="form-group checkbox-group">
                  <label className="form-check">
                    <Field type="checkbox" name="isActive" className="form-check-input" />
                    <span className="form-check-label">Active Status</span>
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="form-check">
                    <Field type="checkbox" name="agreement" className="form-check-input" />
                    <span className="form-check-label">I agree to the terms and conditions *</span>
                  </label>
                  <ErrorMessage name="agreement" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Plus size={16} /> {editId ? 'Update Department' : 'Create Department'}
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
      <h3>Department List</h3>
      {loading ? (
        <div className="text-center"><p>Loading departments...</p></div>
      ) : departments.length === 0 ? (
        <div className="empty-state"><p>No departments found. Create one to get started!</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Head</th>
                <th>City</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Employees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td><strong>{dept.departmentName}</strong></td>
                  <td>{dept.headName}</td>
                  <td>{dept.city}</td>
                  <td>{dept.contactEmail}</td>
                  <td>{dept.contactNumber}</td>
                  <td>{dept.employeeCount || '-'}</td>
                  <td>
                    <span className="badge" style={{backgroundColor: dept.isActive ? '#005b5f' : '#ccc'}}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(dept)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(dept._id)} title="Delete">
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
