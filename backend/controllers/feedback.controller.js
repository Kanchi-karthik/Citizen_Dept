const Feedback = require("../models/Feedback");

exports.getFeedbacks = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter by user ID if provided
    if (req.query.userId) {
      query.user = req.query.userId;
    }
    
    const feedbacks = await Feedback.find(query)
      .populate("user", "fullName email")
      .populate("complaint", "title complaintId")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    next(err);
  }
};
