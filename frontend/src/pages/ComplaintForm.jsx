import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';

const Schema = Yup.object().shape({
  complaintId: Yup.string().required('Complaint ID is auto-generated'),
  title: Yup.string().required('Title is required').min(5, 'Minimum 5 characters'),
  description: Yup.string().required('Description is required').min(20, 'Minimum 20 characters'),
  complaintType: Yup.string().required('Complaint Type is required'),
  areaType: Yup.string().required('Area Type is required'),
  category: Yup.array(),
  days: Yup.number().min(1).required('Days is required'),
  location: Yup.string().required('Location is required').min(3, 'Minimum 3 characters'),
  user: Yup.string().required('User is required'),
  department: Yup.string().required('Department is required')
});

const ComplaintForm = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [nextComplaintId, setNextComplaintId] = useState('COMP001');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes, complaintsRes] = await Promise.all([
          API.get('/users'),
          API.get('/departments'),
          API.get('/complaints')
        ]);
        
        setUsers(usersRes.data);
        setDepartments(departmentsRes.data);
        setComplaints(complaintsRes.data);
        // Auto-generate next complaint ID with proper error handling
        if (complaintsRes.data && complaintsRes.data.length > 0) {
          try {
            const sortedComplaints = complaintsRes.data.sort((a, b) => {
              const aNum = parseInt(a.complaintId?.replace('COMP', '') || '0');
              const bNum = parseInt(b.complaintId?.replace('COMP', '') || '0');
              return bNum - aNum; // Descending order
            });
            
            const lastComplaint = sortedComplaints[0];
            const lastIdNum = parseInt(lastComplaint.complaintId?.replace('COMP', '') || '0');
            
            if (!isNaN(lastIdNum)) {
              const nextNum = lastIdNum + 1;
              setNextComplaintId(`COMP${String(nextNum).padStart(3, '0')}`);
            } else {
              setNextComplaintId('COMP001');
            }
          } catch (parseErr) {
            console.error('Error parsing complaint ID:', parseErr);
            setNextComplaintId('COMP001');
          }
        } else {
          setNextComplaintId('COMP001');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setNextComplaintId('COMP001');
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    
    // Check file size (max 2MB for initial)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Image is too large. Compressing...');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // Resize to max 600x600 for smaller size
          const maxDim = 600;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with quality 0.6 for smaller size
          let quality = 0.6;
          let compressedImage = canvas.toDataURL('image/jpeg', quality);
          
          // If still too large, reduce quality further
          while (compressedImage.length > 1024 * 1024 && quality > 0.3) {
            quality -= 0.1;
            compressedImage = canvas.toDataURL('image/jpeg', quality);
          }
          
          console.log(`Image compressed: Original ${file.size} bytes, Compressed ${compressedImage.length} bytes`);
          
          setImagePreview(compressedImage);
          setImageBase64(compressedImage);
          setFieldValue('image', compressedImage);
        } catch (err) {
          console.error('Image compression error:', err);
          alert('Failed to process image. Please try a different image.');
        }
      };
      img.onerror = () => {
        alert('Failed to load image. Please select a valid image file.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-container">
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>File Complaint</h2>
      <Formik
        key={nextComplaintId}
        initialValues={{
          complaintId: nextComplaintId,
          title: '',
          description: '',
          complaintType: '',
          areaType: '',
          category: [],
          days: 1,
          location: '',
          user: '',
          department: '',
          image: null,
          status: 'Pending'
        }}
        validationSchema={Schema}
        onSubmit={async (vals, { resetForm }) => {
          try {
            const complaintData = {
              ...vals,
              category: vals.category.length > 0 ? vals.category : ['General']
            };
            
            const res = await API.post('/complaints', complaintData);
            alert('Complaint filed successfully with ID: ' + nextComplaintId);
            resetForm();
            setImagePreview(null);
            setImageBase64(null);
            
            // Refresh complaints list
            const complaintsRes = await API.get('/complaints');
            setComplaints(complaintsRes.data);
            
            // Update next complaint ID
            const number = parseInt(nextComplaintId.replace('COMP', '')) + 1;
            setNextComplaintId(`COMP${String(number).padStart(3, '0')}`);
            
            // Dispatch a custom event to notify other components that a complaint was filed
            window.dispatchEvent(new CustomEvent('complaintFiled'));
          } catch (err) {
            console.error('Error filing complaint:', err);
            alert('Error filing complaint: ' + (err.response?.data?.message || err.message));
          }
        }}
      >
        {({ values, setFieldValue }) => (
          <Form className="form-container complaint-form">
            {/* Auto-generated Complaint ID - Hidden */}
            <Field name="complaintId" type="hidden" />
            
            <div className="form-grid">
              <div className="form-group">
                <label>User *</label>
                <Field as="select" name="user" className="form-control">
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                  ))}
                </Field>
                <ErrorMessage name="user" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Department *</label>
                <Field as="select" name="department" className="form-control">
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </Field>
                <ErrorMessage name="department" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <Field name="title" className="form-control" placeholder="Complaint title" />
                <ErrorMessage name="title" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Complaint Type *</label>
                <Field as="select" name="complaintType" className="form-control">
                  <option value="">Select Type</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Service">Service</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Safety">Safety</option>
                  <option value="Other">Other</option>
                </Field>
                <ErrorMessage name="complaintType" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Area Type *</label>
                <Field as="select" name="areaType" className="form-control">
                  <option value="">Select Area</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Public">Public</option>
                </Field>
                <ErrorMessage name="areaType" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <Field name="location" className="form-control" placeholder="Enter location" />
                <ErrorMessage name="location" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Days Pending *</label>
                <Field name="days" type="number" className="form-control" min="1" />
                <ErrorMessage name="days" component="div" className="text-danger small" />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <Field as="select" name="status" className="form-control">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </Field>
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <Field 
                  as="textarea" 
                  name="description" 
                  className="form-control" 
                  rows="4"
                  placeholder="Provide detailed description of the complaint..."
                />
                <ErrorMessage name="description" component="div" className="text-danger small" />
              </div>
            </div>

            <div className="form-section">
              <h4>Attach Evidence</h4>
              <div className="image-upload-section">
                <label className="image-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                    className="image-input"
                  />
                  <span className="upload-icon">📷 Click to upload image</span>
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => {
                        setImagePreview(null);
                        setImageBase64(null);
                        setFieldValue('image', null);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">File Complaint</button>
              <button type="reset" className="btn btn-secondary">Clear Form</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ComplaintForm;
