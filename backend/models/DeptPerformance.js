const mongoose = require("mongoose");

const DeptPerformanceSchema = new mongoose.Schema({
  departmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  
  // Time Period Details
  periodType: { type: String, enum: ['Monthly', 'Quarterly', 'Half-yearly', 'Yearly'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  year: { type: Number, required: true },
  month: { type: String, enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
  quarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'] },
  
  // Complaint Metrics
  totalComplaints: { type: Number, required: true, min: 0 },
  resolvedComplaints: { type: Number, required: true, min: 0 },
  pendingComplaints: { type: Number, required: true, min: 0 },
  rejectedComplaints: { type: Number, default: 0, min: 0 },
  
  // Resolution Time Metrics
  avgResolutionTime: { type: Number, required: true, min: 0 },
  minResolutionTime: { type: Number, min: 0 },
  maxResolutionTime: { type: Number, min: 0 },
  responseTime: { type: Number, required: true, min: 0 },
  targetResolutionDays: { type: Number, required: true, min: 1 },
  
  // Budget & Resource Metrics
  budgetUtilization: { type: Number, required: true, min: 0, max: 100 },
  allocatedBudget: { type: Number, min: 0 },
  spentBudget: { type: Number, min: 0 },
  
  // Quality & Satisfaction Metrics
  citizenSatisfactionScore: { type: Number, required: true, min: 0, max: 5 },
  complaintResolutionRate: { type: Number, min: 0, max: 100 },
  rework: { type: Number, default: 0, min: 0 },
  
  // Performance Rating & Status
  performanceRating: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'], required: true },
  status: { type: String, enum: ['Ongoing', 'Completed', 'On Hold', 'Archived'], default: 'Completed' },
  
  // Additional Information
  remarks: String,
  staffStrength: { type: Number, min: 0 },
  trainingConducted: { type: Boolean, default: false },
  systemsUpgrade: { type: Boolean, default: false },
  
}, { timestamps: true });

module.exports = mongoose.model("DeptPerformance", DeptPerformanceSchema);
