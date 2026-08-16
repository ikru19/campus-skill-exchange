const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, checkEmail, resetPassword } = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/me", protect, getMe);
router.post("/check-email", checkEmail);
router.post("/reset-password", resetPassword);

module.exports = router;