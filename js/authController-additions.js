// ============================================
// ADD THESE TWO FUNCTIONS to controllers/authController.js
// (paste them above the final `module.exports` line, then add
//  checkEmail and resetPassword to the exports list)
// ============================================

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

// @desc    Reset password directly (simple version — no email link/token).
//          NOTE: this is intentionally simple for a class project.
//          A production app would email a signed, expiring reset token
//          instead of resetting the password immediately after an
//          email-exists check.
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

// ============================================
// UPDATE your existing module.exports line to:
// ============================================
// module.exports = { registerUser, loginUser, getMe, checkEmail, resetPassword };
