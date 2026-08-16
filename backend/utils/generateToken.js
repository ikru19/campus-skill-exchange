// ============================================
// utils/generateToken.js - signs a JWT for a logged-in user
// ============================================
const jwt = require("jsonwebtoken");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

module.exports = generateToken;
