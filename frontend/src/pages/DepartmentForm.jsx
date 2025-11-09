import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { Edit, Trash2, Plus, X } from "lucide-react";

const DeptSchema = Yup.object().shape({
  departmentName: Yup.string().required('Department name is required').min(3, 'Minimum 3 characters'),
  headName: Yup.string().required('Head name is required').min(3, 'Minimum 3 characters'),
  contactEmail: Yup.string().email('Invalid email').required('Email is required'),
  contactNumber: Yup.string().matches(/^[0-9()+-\s]{10,}$/, 'Invalid phone number').required('Phone is required'),
  city: Yup.string().required('City is required').min(2, 'Minimum 2 characters'),
  description: Yup.string().required('Description is required').min(10, 'Minimum 10 characters'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required').min(5, 'Minimum 5 characters'),
  establishedYear: Yup.number().required('Year is required').min(1900).max(new Date().getFullYear()),
  employeeCount: Yup.number().required('Employee count is required').min(1),
  isActive: Yup.boolean(),
});

export default function DepartmentForm(){
  const defaultValues = {
    departmentName: '',
    headName: '',
    contactEmail: '',
    contactNumber: '',
    city: '',
    state: '',
    address: '',
    description: '',
    establishedYear: new Date().getFullYear(),
    employeeCount: 0,
    isActive: true
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
      headName: dept.headName || '',
      contactEmail: dept.contactEmail || '',
      contactNumber: dept.contactNumber || '',
      city: dept.city || '',
      state: dept.state || '',
      address: dept.address || '',
      description: dept.description || '',
      establishedYear: dept.establishedYear || new Date().getFullYear(),
      employeeCount: dept.employeeCount || 0,
      isActive: dept.isActive !== undefined ? dept.isActive : true
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
      <div className="form-header">
        <h2>{editId ? 'Edit Department' : 'Create New Department'}</h2>
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
            if (editId) {
              await API.put(`/departments/${editId}`, values);
              alert('Department updated successfully!');
              setEditId(null);
              setInitial({ ...defaultValues });
            } else {
              await API.post('/departments', values);
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
      >
        {({ isSubmitting, values }) => (
          <Form className="form-container">
            <div className="form-section">
              <h4>Basic Information</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Department Name *</label>
                  <Field name="departmentName" className="form-control" placeholder="e.g., Public Works Department" />
                  <ErrorMessage name="departmentName" component="div" className="text-danger small" />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Department Head *</label>
                  <Field name="headName" className="form-control" placeholder="Full name" />
                  <ErrorMessage name="headName" component="div" className="text-danger small" />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Email Address *</label>
                  <Field name="contactEmail" type="email" className="form-control" placeholder="email@department.gov" />
                  <ErrorMessage name="contactEmail" component="div" className="text-danger small" />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Contact Number *</label>
                  <Field name="contactNumber" className="form-control" placeholder="+91-XXXXXXXXXX" />
                  <ErrorMessage name="contactNumber" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Location Details</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>City *</label>
                  <Field name="city" className="form-control" placeholder="City name" />
                  <ErrorMessage name="city" component="div" className="text-danger small" />
                </div>

                <div className="col-md-6 mb-3">
                  <label>State *</label>
                  <Field name="state" className="form-control" placeholder="State name" />
                  <ErrorMessage name="state" component="div" className="text-danger small" />
                </div>
              </div>

              <div className="mb-3">
                <label>Address *</label>
                <Field as="textarea" name="address" className="form-control" rows="2" placeholder="Full address" />
                <ErrorMessage name="address" component="div" className="text-danger small" />
              </div>
            </div>

            <div className="form-section">
              <h4>Organization Details</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Year Established *</label>
                  <Field name="establishedYear" type="number" className="form-control" min="1900" max={new Date().getFullYear()} />
                  <ErrorMessage name="establishedYear" component="div" className="text-danger small" />
                </div>

                <div className="col-md-6 mb-3">
                  <label>Number of Employees *</label>
                  <Field name="employeeCount" type="number" className="form-control" min="1" />
                  <ErrorMessage name="employeeCount" component="div" className="text-danger small" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Additional Information</h4>
              <div className="mb-3">
                <label>Description *</label>
                <Field as="textarea" name="description" className="form-control" rows="4" placeholder="Describe the department's functions and services" />
                <ErrorMessage name="description" component="div" className="text-danger small" />
              </div>

              <div className="mb-3">
                <label className="form-check">
                  <Field type="checkbox" name="isActive" className="form-check-input" />
                  <span className="form-check-label">Active Status</span>
                </label>
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
