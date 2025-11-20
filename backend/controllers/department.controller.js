const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const DeptPerformance = require("../models/DeptPerformance");
const ResourceAllocation = require("../models/ResourceAllocation");
const ComplaintStatus = require("../models/ComplaintStatus");

// Department Login
exports.loginDepartment = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Find department by email or contact number
    const department = await Department.findOne({
      $or: [
        { contactEmail: username },
        { contactNumber: username }
      ]
    });
    
    if (!department) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, department.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email/phone or password" });
    }
    
    // Return department data without password
    const departmentData = department.toObject();
    delete departmentData.password;
    
    res.json({ success: true, department: departmentData });
  } catch (err) {
    next(err);
  }
};

// Get all departments
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

// Create new department
exports.createDepartment = async (req, res, next) => {
  try {
    const departmentData = { ...req.body };
    
    // Hash password
    if (departmentData.password) {
      departmentData.password = await bcrypt.hash(departmentData.password, 10);
    }
    
    const department = new Department(departmentData);
    await department.save();
    
    // Return department data without password
    const departmentObj = department.toObject();
    delete departmentObj.password;
    
    res.status(201).json(departmentObj);
  } catch (err) {
    next(err);
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Return department data without password
    const departmentObj = department.toObject();
    delete departmentObj.password;
    
    res.json(departmentObj);
  } catch (err) {
    next(err);
  }
};

// Update department
exports.updateDepartment = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Return department data without password
    const departmentObj = department.toObject();
    delete departmentObj.password;
    
    res.json(departmentObj);
  } catch (err) {
    next(err);
  }
};

// Delete department
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    // Also delete related data
    await Promise.all([
      DeptPerformance.deleteMany({ department: req.params.id }),
      ResourceAllocation.deleteMany({ department: req.params.id }),
      ComplaintStatus.deleteMany({ department: req.params.id })
    ]);
    
    res.json({ message: "Department and related data deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // In a real app, you would send a password reset email here
    res.json({ message: "Password reset instructions sent to your email" });
  } catch (err) {
    next(err);
  }
};

// Delete all departments (for testing)
exports.deleteAllDepartments = async (req, res, next) => {
  try {
    await Department.deleteMany({});
    await DeptPerformance.deleteMany({});
    await ResourceAllocation.deleteMany({});
    await ComplaintStatus.deleteMany({});
    
    res.json({ message: "All departments and related data deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get department complaint count
exports.getDepartmentComplaintCount = async (req, res, next) => {
  try {
    // This would typically involve joining with complaints collection
    // For now, returning a placeholder
    res.json({ departmentId: req.params.id, complaintCount: 0 });
  } catch (err) {
    next(err);
  }
};

// ========== PERFORMANCE CONTROLLERS ==========

exports.getPerformances = async (req, res, next) => {
  try {
    const performances = await DeptPerformance.find().populate('department');
    res.json(performances);
  } catch (err) {
    next(err);
  }
};

exports.createPerformance = async (req, res, next) => {
  try {
    const performance = new DeptPerformance(req.body);
    await performance.save();
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
    );
    
    if (!performance) {
      return res.status(404).json({ message: "Performance record not found" });
    }
    
    res.json(performance);
  } catch (err) {
    next(err);
  }
};

exports.deletePerformance = async (req, res, next) => {
  try {
    const performance = await DeptPerformance.findByIdAndDelete(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: "Performance record not found" });
    }
    
    res.json({ message: "Performance record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ========== ALLOCATION CONTROLLERS ==========

exports.getAllocations = async (req, res, next) => {
  try {
    const allocations = await ResourceAllocation.find().populate('department');
    res.json(allocations);
  } catch (err) {
    next(err);
  }
};

exports.createAllocation = async (req, res, next) => {
  try {
    const allocation = new ResourceAllocation(req.body);
    await allocation.save();
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
    );
    
    if (!allocation) {
      return res.status(404).json({ message: "Allocation record not found" });
    }
    
    res.json(allocation);
  } catch (err) {
    next(err);
  }
};

exports.deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await ResourceAllocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation record not found" });
    }
    
    res.json({ message: "Allocation record deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ========== STATUS CONTROLLERS ==========

exports.getStatuses = async (req, res, next) => {
  try {
    const statuses = await ComplaintStatus.find().populate('department');
    res.json(statuses);
  } catch (err) {
    next(err);
  }
};

exports.getStatusesByDepartment = async (req, res, next) => {
  try {
    const statuses = await ComplaintStatus.find({ department: req.params.departmentId });
    res.json(statuses);
  } catch (err) {
    next(err);
  }
};

exports.createStatus = async (req, res, next) => {
  try {
    const status = new ComplaintStatus(req.body);
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const status = await ComplaintStatus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!status) {
      return res.status(404).json({ message: "Status record not found" });
    }
    
    res.json(status);
  } catch (err) {
    next(err);
  }
};

exports.deleteStatus = async (req, res, next) => {
  try {
    const status = await ComplaintStatus.findByIdAndDelete(req.params.id);
    if (!status) {
      return res.status(404).json({ message: "Status record not found" });
    }
    
    res.json({ message: "Status record deleted successfully" });
  } catch (err) {
    next(err);
  }
};