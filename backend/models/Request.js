// ============================================
// models/Request.js - a learning request sent from one
// student to another for a specific skill
// ============================================
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // the student who wants to learn
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // the student who owns/teaches the skill
    },
    message: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
