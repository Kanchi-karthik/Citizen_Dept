const mongoose = require("mongoose");

const ComplaintStatusSchema = new mongoose.Schema({
  complaintID: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  departmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  status: { type: String, enum: ["Pending", "In Progress", "On Hold", "Resolved", "Closed"], required: true, default: "Pending" },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Critical'], required: true },
  resolutionDays: { type: Number, required: true, min: 1 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  progressPercentage: { type: Number, required: true, min: 0, max: 100 },
  remarks: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("ComplaintStatus", ComplaintStatusSchema);
