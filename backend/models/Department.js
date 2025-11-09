const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, trim: true },
  headName: { type: String, required: true, trim: true },
  contactEmail: { type: String, required: true, lowercase: true, trim: true },
  contactNumber: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  establishedYear: { type: Number, required: true, min: 1900 },
  employeeCount: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);
