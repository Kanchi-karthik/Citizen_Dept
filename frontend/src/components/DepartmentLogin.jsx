import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const DepartmentLogin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');



  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }
    
    try {
      setForgotPasswordLoading(true);
      setForgotPasswordError('');
      setForgotPasswordSuccess('');
      
      // Call the backend API to send password reset instructions
      const response = await API.post('/departments/forgot-password', {
        email: forgotPasswordEmail
      });
      
      if (response.data.success) {
        setForgotPasswordSuccess(response.data.message || 'Password reset instructions have been sent to your email');
        setForgotPasswordEmail('');
      } else {
        setForgotPasswordError(response.data.message || 'Failed to send password reset instructions');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotPasswordError(err.response?.data?.message || 'Failed to send password reset instructions');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      
      // Call the backend API to authenticate the department
      const response = await API.post('/departments/login', {
        username: values.username,
        password: values.password
      });
      
      // Verify that the logged in department matches the requested department
      if (response.data.department._id !== id) {
        setError('You are not authorized to access this department');
        return;
      }
      
      // Store department info in localStorage
      localStorage.setItem('department', JSON.stringify(response.data.department));
      
      if (response.data.success) {
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
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {showForgotPassword ? (
          <div className="forgot-password-form">
            <h3>Reset Password</h3>
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
            
            {forgotPasswordSuccess && (
              <div className="alert alert-success">
                {forgotPasswordSuccess}
              </div>
            )}
            
            {forgotPasswordError && (
              <div className="alert alert-danger">
                {forgotPasswordError}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    id="forgot-email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-link"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordError('');
                    setForgotPasswordSuccess('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <Field 
                      type="text" 
                      id="username" 
                      name="username" 
                      className="form-control" 
                      placeholder="Enter your username"
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
                  
                  <button 
                    type="button" 
                    className="btn btn-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default DepartmentLogin;