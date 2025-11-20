const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, trim: true },
  departmentCode: { type: String, required: true, trim: true, unique: true },
  headName: { type: String, required: true, trim: true },
  contactEmail: { type: String, required: true, lowercase: true, trim: true, unique: true },
  contactNumber: { type: String, required: true, unique: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  website: { type: String, trim: true },
  establishedYear: { type: Number, required: true, min: 1900 },
  employeeCount: { type: Number, required: true, min: 1 },
  isActive: { type: Boolean, default: true },
  // Login credentials - made optional to handle cases where no login is needed
  password: { type: String, required: false },
}, { timestamps: true });

// Add index options
DepartmentSchema.set('autoIndex', true);

module.exports = mongoose.model("Department", DepartmentSchema);