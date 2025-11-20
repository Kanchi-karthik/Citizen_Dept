const Complaint = require("../models/Complaint");

// ✅ list all complaints
exports.getComplaints = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by user ID if provided
    if (req.query.userId) {
      query.user = req.query.userId;
    }
    
    // Filter by department ID if provided
    if (req.query.departmentId) {
      query.department = req.query.departmentId;
    }
    
    const complaints = await Complaint.find(query).populate("user", "fullName email").populate("department", "departmentName").sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

// ✅ create new complaint
exports.createComplaint = async (req, res, next) => {
  try {
    const complaintData = req.body;
    
    // Handle base64 image
    if (req.body.image && req.body.image.startsWith('data:image')) {
      // Image is already in base64 format, keep it as is
      complaintData.image = req.body.image;
    }
    
    const complaint = new Complaint(complaintData);
    await complaint.save();
    await complaint.populate([{ path: "user", select: "fullName email" }, { path: "department", select: "departmentName" }]);
    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
};

// ✅ get complaint details
exports.getComplaintDetails = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user", "fullName email").populate("department", "departmentName");
    if (!complaint) return res.status(404).json({ message: "Not found" });
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// ✅ update complaint status
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['New', 'Accepted', 'Working', 'On Hold', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      id, 
      { status },
      { new: true, runValidators: true }
    ).populate("user", "fullName email").populate("department", "departmentName");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

// ✅ add complaint resolution update
exports.addComplaintResolutionUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionDays, resolutionDescription, resolutionImages, departmentNotes } = req.body;
    
    // Handle base64 resolution images
    let images = [];
    if (Array.isArray(resolutionImages)) {
      images = resolutionImages.filter(img => img && img.startsWith('data:image'));
    }
    
    const resolutionUpdate = {
      resolutionDays: resolutionDays || 0,
      resolutionDescription: resolutionDescription || '',
      resolutionImages: images,
      departmentNotes: departmentNotes || ''
    };
    
    const complaint = await Complaint.findByIdAndUpdate(
      id, 
      { $push: { resolutionUpdates: resolutionUpdate } },
      { new: true, runValidators: true }
    ).populate("user", "fullName email").populate("department", "departmentName");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    // Return the newly added resolution update
    const newUpdate = complaint.resolutionUpdates[complaint.resolutionUpdates.length - 1];
    res.json(newUpdate);
  } catch (err) {
    next(err);
  }
};

// ✅ get complaint resolution updates
exports.getComplaintResolutionUpdates = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id, 'resolutionUpdates').populate("user", "fullName email").populate("department", "departmentName");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    
    res.json(complaint.resolutionUpdates);
  } catch (err) {
    next(err);
  }
};