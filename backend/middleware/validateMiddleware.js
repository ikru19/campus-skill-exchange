// ============================================
// middleware/validateMiddleware.js - Lightweight validation for
// the exact fields register.html, login.html and
// skill-management.html's modal actually send
// ============================================
const ApiError = require("../utils/ApiError");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const VALID_LEARNING_MODES = ["Online", "Offline", "Hybrid"];
const VALID_RESOURCE_TYPES = ["YouTube", "GitHub", "Google Drive", "PDF", "Website"];

const validateRegister = (req, res, next) => {
  const { fullName, studentId, department, email, password } = req.body;
  if (!fullName || fullName.trim().length < 2) {
    throw new ApiError(400, "Please enter your full name (min 2 characters)");
  }
  if (!studentId || studentId.trim().length < 3) {
    throw new ApiError(400, "Please enter a valid student ID");
  }
  if (!department) {
    throw new ApiError(400, "Please select your department");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Please enter a valid university email");
  }
  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  next();
};

const validateSkill = (req, res, next) => {
  const { name, category, level, learningMode, availableSchedule, contactEmail, meetingLink, resources } = req.body;

  if (!name || name.trim().length < 2) {
    throw new ApiError(400, "Please enter a skill name");
  }
  if (!category) {
    throw new ApiError(400, "Please choose a category");
  }
  if (!level) {
    throw new ApiError(400, "Please choose a level");
  }
  if (!learningMode || !VALID_LEARNING_MODES.includes(learningMode)) {
    throw new ApiError(400, "Learning mode must be Online, Offline, or Hybrid");
  }
  if ((learningMode === "Online" || learningMode === "Hybrid") && (!meetingLink || !meetingLink.trim())) {
    throw new ApiError(400, "Meeting link is required for Online or Hybrid learning mode");
  }
  if (!availableSchedule || !availableSchedule.trim()) {
    throw new ApiError(400, "Available schedule is required");
  }
  if (contactEmail && !EMAIL_REGEX.test(contactEmail)) {
    throw new ApiError(400, "Please provide a valid contact email");
  }
  if (resources !== undefined) {
    if (!Array.isArray(resources)) {
      throw new ApiError(400, "Resources must be a list");
    }
    resources.forEach((r, i) => {
      if (!r.title || !r.title.trim()) throw new ApiError(400, `Resource #${i + 1}: title is required`);
      if (!r.type || !VALID_RESOURCE_TYPES.includes(r.type)) {
        throw new ApiError(400, `Resource #${i + 1}: type must be one of ${VALID_RESOURCE_TYPES.join(", ")}`);
      }
      if (!r.url || !r.url.trim()) throw new ApiError(400, `Resource #${i + 1}: URL is required`);
    });
  }
  next();
};

const validateRequest = (req, res, next) => {
  const { skillId } = req.body;
  if (!skillId) {
    throw new ApiError(400, "skillId is required");
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateSkill, validateRequest };
