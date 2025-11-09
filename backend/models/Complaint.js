const mongoose = require("mongoose");

// Schema for resolution updates
const ResolutionUpdateSchema = new mongoose.Schema({
  updatedAt: { type: Date, default: Date.now },
  resolutionDays: { type: Number, default: 0 },
  resolutionDescription: String,
  resolutionImages: [String], // Array of image URLs
  departmentNotes: String
});

const ComplaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: [String],
  complaintType: String,
  areaType: String,
  description: String,
  days: Number,
  image: String,
  location: String,
  status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  // Array of resolution updates instead of single resolution fields
  resolutionUpdates: [ResolutionUpdateSchema]
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);