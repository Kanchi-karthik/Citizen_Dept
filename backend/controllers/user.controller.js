const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    console.log('getUserById called with ID:', req.params.id);
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log('User found:', user);
    res.json(user);
  } catch (err) {
    console.error('Error in getUserById:', err);
    next(err);
  }
};
