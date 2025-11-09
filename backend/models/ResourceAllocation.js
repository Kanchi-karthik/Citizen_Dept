const mongoose = require("mongoose");

const ResourceAllocationSchema = new mongoose.Schema({
  departmentID: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  resourceType: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  cost: { type: Number, required: true, min: 0 },
  allocationDate: { type: Date, required: true, default: Date.now },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Allocated', 'In Use', 'Returned'], required: true },
  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model("ResourceAllocation", ResourceAllocationSchema);
