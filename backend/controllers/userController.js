// ============================================
// controllers/userController.js
// ============================================
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Update the logged-in user's profile
//          (matches profile.html's #editProfileForm: epName, epDept, epBio)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { fullName, department, bio } = req.body;
  if (fullName) user.fullName = fullName;
  if (department) user.department = department;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated",
    data: {
      id: user._id,
      fullName: user.fullName,
      studentId: user.studentId,
      department: user.department,
      email: user.email,
      bio: user.bio,
      role: user.role,
    },
  });
});

// @desc    Get a public profile by id
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json({
    success: true,
    data: { id: user._id, fullName: user.fullName, department: user.department, bio: user.bio },
  });
});

module.exports = { updateProfile, getUserProfile };
