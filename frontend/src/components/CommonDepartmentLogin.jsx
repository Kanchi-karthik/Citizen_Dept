import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const CommonDepartmentLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      
      // Call the backend API to authenticate the department
      const response = await API.post('/departments/login', {
        username: values.username,
        password: values.password
      });
      
      if (response.data.success) {
        // Store department info in localStorage
        localStorage.setItem('department', JSON.stringify(response.data.department));
        // Navigate to department dashboard
        navigate(`/department/${response.data.department._id}`);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const initialValues = {
    username: '',
    password: ''
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>Department Login</h2>
          <p>Sign in to access your department dashboard</p>
          <p className="text-muted small">You can log in with your username, email address, or phone number</p>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ isSubmitting }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username, Email, or Phone Number</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <Field 
                    type="text" 
                    id="username" 
                    name="username" 
                    className="form-control" 
                    placeholder="Enter your username, email, or phone number"
                  />
                </div>
                <ErrorMessage name="username" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon password-field">
                  <Lock size={18} />
                  <Field 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    name="password" 
                    className="form-control" 
                    placeholder="Enter your password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="text-danger small" />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block" 
                  disabled={isSubmitting || loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CommonDepartmentLogin;