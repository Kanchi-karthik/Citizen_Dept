import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import API from "../services/api";

const DepartmentSchema = Yup.object().shape({
  departmentName: Yup.string().required('Department name is required'),
  departmentCode: Yup.string().required('Department code is required').min(3, 'Minimum 3 characters'),
  headName: Yup.string().required('Head name is required').min(2, 'Minimum 2 characters'),
  contactEmail: Yup.string().email('Invalid email').required('Email is required'),
  contactNumber: Yup.string().required('Contact number is required').min(10, 'Minimum 10 characters').max(15, 'Maximum 15 characters'),
  city: Yup.string().required('City is required').min(2, 'Minimum 2 characters'),
  state: Yup.string().required('State is required').min(2, 'Minimum 2 characters'),
  address: Yup.string().required('Address is required').min(10, 'Minimum 10 characters'),
  description: Yup.string().required('Description is required').min(20, 'Minimum 20 characters'),
  website: Yup.string().url('Invalid URL'),
  establishedYear: Yup.number().required('Established year is required').min(1900, 'Invalid year').max(new Date().getFullYear(), 'Cannot be in future'),
  employeeCount: Yup.number().required('Employee count is required').min(1, 'Minimum 1 employee'),
  password: Yup.string().when('agreement', {
    is: true,
    then: schema => schema.required('Password is required when agreement is checked').min(8, 'Minimum 8 characters'),
    otherwise: schema => schema.notRequired()
  }),
  confirmPassword: Yup.string().when('agreement', {
    is: true,
    then: schema => schema.required('Confirm password is required when agreement is checked').oneOf([Yup.ref('password')], 'Passwords must match'),
    otherwise: schema => schema.notRequired()
  }),
  agreement: Yup.boolean()
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
    employeeCount: 1,
    isActive: true,
    agreement: false,
    // Login credentials (username is auto-generated)
    password: '',
    confirmPassword: ''
  };

  const [initial, setInitial] = useState({ ...defaultValues });
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Predefined departments with emojis
  const predefinedDepartments = [
    "Department of Sanitation and Waste Management",
    "Department of Water Resources and Supply",
    "Department of Infrastructure and Public Works",
    "Department of Environmental Protection and Pollution Control",
    "Department of Parks, Green Spaces, and Urban Development"
  ];

  // Department code mapping
  const departmentCodeMap = {
    'Department of Sanitation and Waste Management': 'DSW',
    'Department of Water Resources and Supply': 'DWR',
    'Department of Infrastructure and Public Works': 'DIP',
    'Department of Environmental Protection and Pollution Control': 'DEP',
    'Department of Parks, Green Spaces, and Urban Development': 'DPG'
  };

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to fetch departments');
    }
  };

  // Generate department code based on department name with next available number from database
  const generateDepartmentCode = async (deptName) => {
    if (!deptName) return '';
    
    try {
      // Fetch all departments to determine the next sequential number
      const res = await API.get('/departments');
      const allDepartments = res.data;
      
      const codePrefix = departmentCodeMap[deptName] || 'DEPT';
      // Filter departments with the same name
      const existingDepts = allDepartments.filter(dept => dept.departmentName === deptName);
      
      // Find the highest existing number for this department type
      let maxNumber = 0;
      existingDepts.forEach(dept => {
        const match = dept.departmentCode.match(/^([A-Z]+)(\d+)$/);
        if (match && match[1] === codePrefix) {
          const num = parseInt(match[2]);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `${codePrefix}${nextNumber.toString().padStart(3, '0')}`;
    } catch (err) {
      console.error('Error generating department code:', err);
      return '';
    }
  };

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  useEffect(() => {
    fetchDepartments();
    
    // If editing, fetch department data
    if (id) {
      const fetchDepartment = async () => {
        try {
          setLoading(true);
          const res = await API.get(`/departments/${id}`);
          const deptData = res.data;
          
          // Set form values
          setInitial({
            ...deptData,
            password: '',
            confirmPassword: '',
            agreement: false
          });
          setEditId(id);
        } catch (err) {
          console.error('Error fetching department:', err);
          toast.error('Failed to fetch department data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchDepartment();
    }
  }, [id]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = { ...values };
      
      // Remove password fields if not creating new credentials
      if (!values.agreement) {
        delete formData.password;
        delete formData.confirmPassword;
      }
      
      if (editId) {
        // Update existing department
        await API.put(`/departments/${editId}`, formData);
        toast.success('Department updated successfully');
      } else {
        // Create new department
        await API.post('/departments', formData);
        toast.success('Department created successfully');
      }
      
      // Reset form and navigate
      resetForm();
      navigate('/departments');
    } catch (err) {
      console.error('Error saving department:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save department';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><h4>Loading...</h4></div>;
  }

  return (
    <div className="form-container">
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
        {editId ? 'Edit Department' : 'Add New Department'}
      </h2>
      
      <Formik
        key={editId}
        initialValues={initial}
        validationSchema={DepartmentSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="form-container department-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Department Name *</label>
                <Field 
                  name="departmentName" 
                  as="select"
                  className="form-control"
                  onChange={async (e) => {
                    const value = e.target.value;
                    setFieldValue('departmentName', value);
                    // Auto-generate department code
                    const code = await generateDepartmentCode(value);
                    setFieldValue('departmentCode', code);
                  }}
                >
                  <option value="">Select a Department</option>
                  {predefinedDepartments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="departmentName" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Department Code *</label>
                <Field 
                  name="departmentCode" 
                  className="form-control"
                  readOnly
                />
                <ErrorMessage name="departmentCode" component="div" className="text-danger small" />
                <small className="form-text text-muted">
                  Auto-generated based on department name
                </small>
              </div>
              
              <div className="form-group">
                <label>Head Name *</label>
                <Field name="headName" className="form-control" />
                <ErrorMessage name="headName" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Contact Email *</label>
                <Field name="contactEmail" type="email" className="form-control" />
                <ErrorMessage name="contactEmail" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Contact Number *</label>
                <Field name="contactNumber" className="form-control" />
                <ErrorMessage name="contactNumber" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <Field name="city" className="form-control" />
                <ErrorMessage name="city" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <Field name="state" className="form-control" />
                <ErrorMessage name="state" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Established Year *</label>
                <Field name="establishedYear" type="number" className="form-control" />
                <ErrorMessage name="establishedYear" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Employee Count *</label>
                <Field name="employeeCount" type="number" className="form-control" />
                <ErrorMessage name="employeeCount" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group full-width">
                <label>Address *</label>
                <Field name="address" as="textarea" className="form-control" rows="3" />
                <ErrorMessage name="address" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group full-width">
                <label>Description *</label>
                <Field name="description" as="textarea" className="form-control" rows="4" />
                <ErrorMessage name="description" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Website</label>
                <Field name="website" type="url" className="form-control" placeholder="https://example.com" />
                <ErrorMessage name="website" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <Field name="isActive" as="select" className="form-control">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Field>
              </div>
            </div>
            
            <div className="form-group">
              <div className="form-check">
                <Field 
                  name="agreement" 
                  type="checkbox" 
                  className="form-check-input" 
                  id="agreement"
                />
                <label className="form-check-label" htmlFor="agreement">
                  Create login credentials for this department (Email/Phone will be used as username)
                </label>
              </div>
              <ErrorMessage name="agreement" component="div" className="text-danger small" />
            </div>
            
            {values.agreement && (
              <div className="credentials-section">
                <h4>Login Credentials</h4>
                <p className="text-muted">
                  <small>Note: Department can login using either their email or phone number as username</small>
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Password *</label>
                    <div className="input-group">
                      <Field 
                        name="password" 
                        type={showPassword ? "text" : "password"}
                        className="form-control" 
                        placeholder="Enter password or generate one"
                      />
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          const password = generatePassword();
                          setFieldValue('password', password);
                          setFieldValue('confirmPassword', password);
                        }}
                        style={{ 
                          minWidth: '80px'
                        }}
                      >
                        Generate
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          minWidth: '40px',
                          borderLeft: '1px solid #ccc'
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-danger small" />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <div className="input-group">
                      <Field 
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control" 
                      />
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          minWidth: '40px'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="text-danger small" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editId ? 'Update Department' : 'Create Department')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/departments')}
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}