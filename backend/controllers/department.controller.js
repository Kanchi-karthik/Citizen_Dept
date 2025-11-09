const Department = require("../models/Department");
const DeptPerformance = require("../models/DeptPerformance");
const ResourceAllocation = require("../models/ResourceAllocation");
const ComplaintStatus = require("../models/ComplaintStatus");

// ========== DEPARTMENT CRUD ==========
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ========== PERFORMANCE CRUD ==========
exports.getPerformances = async (req, res, next) => {
  try {
    const performances = await DeptPerformance.find()
      .populate("departmentID", "departmentName")
      .sort({ createdAt: -1 });
    res.json(performances);
  } catch (err) {
    next(err);
  }
};

exports.createPerformance = async (req, res, next) => {
  try {
    const performance = new DeptPerformance(req.body);
    await performance.save();
    await performance.populate("departmentID", "departmentName");
    res.status(201).json(performance);
  } catch (err) {
    next(err);
  }
};

exports.updatePerformance = async (req, res, next) => {
  try {
    const performance = await DeptPerformance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("departmentID", "departmentName");
    if (!performance) return res.status(404).json({ message: "Performance record not found" });
    res.json(performance);
  } catch (err) {
    next(err);
  }
};

exports.deletePerformance = async (req, res, next) => {
  try {
    const performance = await DeptPerformance.findByIdAndDelete(req.params.id);
    if (!performance) return res.status(404).json({ message: "Performance record not found" });
    res.json({ message: "Performance record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ========== RESOURCE ALLOCATION CRUD ==========
exports.getAllocations = async (req, res, next) => {
  try {
    const allocations = await ResourceAllocation.find()
      .populate("departmentID", "departmentName")
      .populate("allocatedBy", "fullName email")
      .sort({ createdAt: -1 });
    res.json(allocations);
  } catch (err) {
    next(err);
  }
};

exports.createAllocation = async (req, res, next) => {
  try {
    const allocation = new ResourceAllocation(req.body);
    await allocation.save();
    await allocation.populate([{ path: "departmentID", select: "departmentName" }, { path: "allocatedBy", select: "fullName email" }]);
    res.status(201).json(allocation);
  } catch (err) {
    next(err);
  }
};

exports.updateAllocation = async (req, res, next) => {
  try {
    const allocation = await ResourceAllocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([{ path: "departmentID", select: "departmentName" }, { path: "allocatedBy", select: "fullName email" }]);
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    res.json(allocation);
  } catch (err) {
    next(err);
  }
};

exports.deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await ResourceAllocation.findByIdAndDelete(req.params.id);
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    res.json({ message: "Allocation deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ========== COMPLAINT STATUS CRUD ==========
exports.getStatuses = async (req, res, next) => {
  try {
    const statuses = await ComplaintStatus.find()
      .populate("complaintID", "title complaintType")
      .populate("departmentID", "departmentName")
      .populate("assignedTo", "fullName email role")
      .sort({ createdAt: -1 });
    res.json(statuses);
  } catch (err) {
    next(err);
  }
};

exports.createStatus = async (req, res, next) => {
  try {
    console.log('Creating status with data:', req.body); // Debug log
    const status = new ComplaintStatus(req.body);
    await status.save();
    console.log('Status saved successfully:', status._id); // Debug log
    await status.populate([
      { path: "complaintID", select: "title complaintType" },
      { path: "departmentID", select: "departmentName" },
      { path: "assignedTo", select: "fullName email role" }
    ]);
    console.log('Status populated:', status); // Debug log
    res.status(201).json(status);
  } catch (err) {
    console.error('Error creating status:', err); // Debug log
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const status = await ComplaintStatus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: "complaintID", select: "title complaintType" },
      { path: "departmentID", select: "departmentName" },
      { path: "assignedTo", select: "fullName email role" }
    ]);
    if (!status) return res.status(404).json({ message: "Status not found" });
    res.json(status);
  } catch (err) {
    next(err);
  }
};

exports.deleteStatus = async (req, res, next) => {
  try {
    const status = await ComplaintStatus.findByIdAndDelete(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found" });
    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// New function to fetch status updates by department ID
exports.getStatusesByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    console.log('Fetching status updates for department:', departmentId); // Debug log
    const statuses = await ComplaintStatus.find({ departmentID: departmentId })
      .populate("complaintID", "title complaintType")
      .populate("departmentID", "departmentName")
      .populate("assignedTo", "fullName email role")
      .sort({ createdAt: -1 });
    console.log('Found status updates:', statuses.length); // Debug log
    res.json(statuses);
  } catch (err) {
    console.error('Error fetching status updates by department:', err); // Debug log
    next(err);
  }
};
