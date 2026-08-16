// ============================================
// controllers/authController.js
// ============================================
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Register (matches register.html's fields exactly)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, studentId, department, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, "An account with this email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    studentId,
    department,
    email: email.toLowerCase(),
    password: hashedPassword,
  });
  res.status(201).json({
    success: true,
    message: "Account created",
    data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
  });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        department: user.department,
        email: user.email,
        bio: user.bio,
        role: user.role,
      },
    },
  });
});

// @desc    Get the currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      fullName: req.user.fullName,
      studentId: req.user.studentId,
      department: req.user.department,
      email: req.user.email,
      bio: req.user.bio,
      role: req.user.role,
    },
  });
});

// @desc    Check if an email exists (used by "Forgot Password")
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  res.json({
    success: true,
    exists: !!user,
  });
});

// @desc    Reset password directly (simple version — no email link/token)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    throw new ApiError(400, "Email and new password are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "No account found with that email");
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({
    success: true,
    message: "Password reset successful",
  });
});

module.exports = { registerUser, loginUser, getMe, checkEmail, resetPassword };