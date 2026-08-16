// ============================================
// models/User.js - matches the fields already collected by
// register.html: fullName, studentId, department, uniEmail, password
// ============================================
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    // Stored as "email" in the DB, but this is the same value the
    // frontend collects in the #uniEmail field.
    email: {
      type: String,
      required: [true, "University email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
