import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "../services/api";
import { Edit, Trash2, Plus, X } from "lucide-react";

const PerfSchema = Yup.object().shape({
  departmentID: Yup.string().required('Department is required'),
  periodType: Yup.string().required('Period type is required').oneOf(['Monthly', 'Quarterly', 'Half-yearly', 'Yearly']),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End date must be after start date'),
  year: Yup.number().required('Year is required').min(1900).max(new Date().getFullYear()),
  month: Yup.string().nullable(),
  quarter: Yup.string().nullable(),
  
  totalComplaints: Yup.number().required('Total complaints required').min(0, 'Must be >= 0'),
  resolvedComplaints: Yup.number().required('Resolved complaints required').min(0, 'Must be >= 0'),
  pendingComplaints: Yup.number().required('Pending complaints required').min(0, 'Must be >= 0'),
  rejectedComplaints: Yup.number().min(0, 'Must be >= 0'),
  
  minResolutionTime: Yup.number().min(0, 'Must be >= 0'),
  maxResolutionTime: Yup.number().min(0, 'Must be >= 0'),
  responseTime: Yup.number().required('Response time required').min(0, 'Must be >= 0'),
  targetResolutionDays: Yup.number().required('Target resolution days required').min(1, 'Must be >= 1'),
  
  allocatedBudget: Yup.number().min(0, 'Must be >= 0'),
  spentBudget: Yup.number().min(0, 'Must be >= 0'),
  
  citizenSatisfactionScore: Yup.number().required('Satisfaction score required').min(0, 'Must be >= 0').max(5, 'Must be <= 5'),
  rework: Yup.number().min(0, 'Must be >= 0'),
  
  performanceRating: Yup.string().required('Performance rating required'),
  status: Yup.string().required('Status required'),
  staffStrength: Yup.number().min(0, 'Must be >= 0'),
  
  remarks: Yup.string(),
  trainingConducted: Yup.boolean(),
  systemsUpgrade: Yup.boolean(),
});

export default function PerformanceForm({ departmentId }) {
  const defaultValues = {
    departmentID: departmentId || '',
    periodType: 'Monthly',
    startDate: '',
    endDate: '',
    year: new Date().getFullYear(),
    month: 'January',
    quarter: 'Q1',
    
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    rejectedComplaints: 0,
    
    minResolutionTime: 0,
    maxResolutionTime: 0,
    responseTime: 0,
    targetResolutionDays: 0,
    
    allocatedBudget: 0,
    spentBudget: 0,
    
    citizenSatisfactionScore: 0,
    rework: 0,
    
    performanceRating: 'Good',
    status: 'Completed',
    staffStrength: 0,
    
    remarks: '',
    trainingConducted: false,
    systemsUpgrade: false,
  };

  const [depts, setDepts] = useState([]);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({ ...defaultValues });

  const loadData = async () => {
    try {
      setLoading(true);
      const d = await API.get("/departments");
      const p = await API.get("/departments/performance/all");
      setDepts(d.data);
      setRecords(p.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (record) => {
    const editData = {
      departmentID: record.departmentID || '',
      periodType: record.periodType || 'Monthly',
      startDate: record.startDate ? record.startDate.split('T')[0] : '',
      endDate: record.endDate ? record.endDate.split('T')[0] : '',
      year: record.year || new Date().getFullYear(),
      month: record.month || 'January',
      quarter: record.quarter || 'Q1',
      totalComplaints: record.totalComplaints || 0,
      resolvedComplaints: record.resolvedComplaints || 0,
      pendingComplaints: record.pendingComplaints || 0,
      rejectedComplaints: record.rejectedComplaints || 0,
      minResolutionTime: record.minResolutionTime || 0,
      maxResolutionTime: record.maxResolutionTime || 0,
      responseTime: record.responseTime || 0,
      targetResolutionDays: record.targetResolutionDays || 0,
      allocatedBudget: record.allocatedBudget || 0,
      spentBudget: record.spentBudget || 0,
      citizenSatisfactionScore: record.citizenSatisfactionScore || 0,
      rework: record.rework || 0,
      performanceRating: record.performanceRating || 'Good',
      status: record.status || 'Completed',
      staffStrength: record.staffStrength || 0,
      remarks: record.remarks || '',
      trainingConducted: record.trainingConducted || false,
      systemsUpgrade: record.systemsUpgrade || false,
    };
    setInitialValues(editData);
    setEditId(record._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditId(null);
    setInitialValues({ ...defaultValues });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this performance record?')) {
      try {
        await API.delete(`/departments/performance/${id}`);
        alert('Record deleted successfully!');
        loadData();
      } catch (err) {
        console.error('Error deleting:', err);
        alert('Error deleting record!');
      }
    }
  };

  return (
    <div>
      <div className="form-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--primary-light)' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>Department Performance Management</h2>
        {editId && (
          <button className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} /> Cancel Edit
          </button>
        )}
      </div>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={PerfSchema}
        onSubmit={async (vals, { setSubmitting }) => {
          try {
            if (editId) {
              await API.put(`/departments/performance/${editId}`, vals);
              alert('Performance record updated successfully!');
              setEditId(null);
              setInitialValues({ ...defaultValues });
            } else {
              await API.post('/departments/performance', vals);
              alert('Performance record saved successfully!');
              setInitialValues({ ...defaultValues });
            }
            loadData();
          } catch (err) {
            console.error('Error:', err);
            alert('Error saving record: ' + (err.response?.data?.message || err.message));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="form-container performance-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Department *</label>
                <Field as="select" name="departmentID" className="form-control">
                  <option value="">Select department</option>
                  {depts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.departmentName}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="departmentID" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Period Type *</label>
                <Field as="select" name="periodType" className="form-control">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-yearly">Half-yearly</option>
                  <option value="Yearly">Yearly</option>
                </Field>
                <ErrorMessage name="periodType" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Year *</label>
                <Field name="year" type="number" className="form-control" min="1900" max={new Date().getFullYear()} />
                <ErrorMessage name="year" component="div" className="text-danger small" />
              </div>

              {values.periodType === 'Monthly' && (
                <div className="form-group">
                  <label>Month *</label>
                  <Field as="select" name="month" className="form-control">
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </Field>
                  <ErrorMessage name="month" component="div" className="text-danger small" />
                </div>
              )}

              {values.periodType === 'Quarterly' && (
                <div className="form-group">
                  <label>Quarter *</label>
                  <Field as="select" name="quarter" className="form-control">
                    <option value="Q1">Q1 (Jan-Mar)</option>
                    <option value="Q2">Q2 (Apr-Jun)</option>
                    <option value="Q3">Q3 (Jul-Sep)</option>
                    <option value="Q4">Q4 (Oct-Dec)</option>
                  </Field>
                  <ErrorMessage name="quarter" component="div" className="text-danger small" />
                </div>
              )}

              <div className="form-group">
                <label>Start Date *</label>
                <Field name="startDate" type="date" className="form-control" />
                <ErrorMessage name="startDate" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <Field name="endDate" type="date" className="form-control" />
                <ErrorMessage name="endDate" component="div" className="text-danger small" />
              </div>

              {/* COMPLAINT METRICS SECTION */}
              <div className="form-group">
                <label>Total Complaints Received *</label>
                <Field name="totalComplaints" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="totalComplaints" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Resolved Complaints *</label>
                <Field name="resolvedComplaints" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="resolvedComplaints" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Pending Complaints *</label>
                <Field name="pendingComplaints" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="pendingComplaints" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Rejected Complaints</label>
                <Field name="rejectedComplaints" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="rejectedComplaints" component="div" className="text-danger small" />
              </div>

              {/* RESOLUTION TIME METRICS */}
              <div className="form-group">
                <label>Min Resolution Time (days)</label>
                <Field name="minResolutionTime" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="minResolutionTime" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Max Resolution Time (days)</label>
                <Field name="maxResolutionTime" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="maxResolutionTime" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Response Time (hours) *</label>
                <Field name="responseTime" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="responseTime" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Target Resolution Days *</label>
                <Field name="targetResolutionDays" type="number" className="form-control" min="1" step="any" />
                <ErrorMessage name="targetResolutionDays" component="div" className="text-danger small" />
              </div>

              {/* BUDGET & RESOURCE METRICS */}
              <div className="form-group">
                <label>Allocated Budget (₹)</label>
                <Field name="allocatedBudget" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="allocatedBudget" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Spent Budget (₹)</label>
                <Field name="spentBudget" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="spentBudget" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Staff Strength</label>
                <Field name="staffStrength" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="staffStrength" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Rework Count</label>
                <Field name="rework" type="number" className="form-control" min="0" step="any" />
                <ErrorMessage name="rework" component="div" className="text-danger small" />
              </div>

              {/* QUALITY & SATISFACTION METRICS */}
              <div className="form-group">
                <label>Citizen Satisfaction Score (0-5) *</label>
                <Field name="citizenSatisfactionScore" type="number" className="form-control" min="0" max="5" step="any" />
                <ErrorMessage name="citizenSatisfactionScore" component="div" className="text-danger small" />
              </div>

              <div className="form-group">
                <label>Performance Rating *</label>
                <Field as="select" name="performanceRating" className="form-control">
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </Field>
                <ErrorMessage name="performanceRating" component="div" className="text-danger small" />
              </div>

              {/* INITIATIVES & STATUS */}
              <div className="form-group">
                <label>Record Status *</label>
                <Field as="select" name="status" className="form-control">
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Archived">Archived</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-danger small" />
              </div>

              <div className="form-group checkbox-group">
                <label className="form-check">
                  <Field type="checkbox" name="trainingConducted" className="form-check-input" />
                  <span className="form-check-label">Training Conducted</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="form-check">
                  <Field type="checkbox" name="systemsUpgrade" className="form-check-input" />
                  <span className="form-check-label">Systems Upgrade Done</span>
                </label>
              </div>

              {/* REMARKS SECTION */}
              <div className="form-group full-width">
                <label>Remarks</label>
                <Field as="textarea" name="remarks" className="form-control" rows="4" placeholder="Add any additional notes, observations, or action items..." />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                <Plus size={16} /> {editId ? 'Update Record' : 'Save Performance'}
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
      <h3>Performance Records</h3>
      {loading ? (
        <div className="text-center"><p>Loading...</p></div>
      ) : records.length === 0 ? (
        <div className="empty-state"><p>No performance records yet.</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Period</th>
                <th>Date Range</th>
                <th>Total Complaints</th>
                <th>Resolved/Pending</th>
                <th>Rating</th>
                <th>Satisfaction</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const periodLabel = r.periodType === 'Monthly' ? r.month : r.periodType === 'Quarterly' ? r.quarter : r.year;
                const dateRange = r.startDate && r.endDate ? `${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}` : 'N/A';
                return (
                  <tr key={r._id}>
                    <td><strong>{r.departmentID?.departmentName}</strong></td>
                    <td>{periodLabel} {r.year}</td>
                    <td><small>{dateRange}</small></td>
                    <td>{r.totalComplaints}</td>
                    <td>{r.resolvedComplaints}/{r.pendingComplaints}</td>
                    <td>
                      <span className="badge" style={{backgroundColor: r.performanceRating === 'Excellent' ? '#27ae60' : r.performanceRating === 'Very Good' ? '#2ecc71' : r.performanceRating === 'Good' ? '#005b5f' : r.performanceRating === 'Satisfactory' ? '#f39c12' : '#e74c3c'}}>
                        {r.performanceRating}
                      </span>
                    </td>
                    <td><Star size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    <span>{r.citizenSatisfactionScore}/5</span></td>
                    <td>
                      <span className="badge" style={{backgroundColor: r.status === 'Completed' ? '#27ae60' : r.status === 'Ongoing' ? '#3498db' : r.status === 'On Hold' ? '#f39c12' : '#95a5a6'}}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(r)} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(r._id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
