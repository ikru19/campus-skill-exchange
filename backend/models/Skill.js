// ============================================
// models/Skill.js - matches the fields already collected by
// skill-management.html's Add/Edit modal: name, category, level, desc
// ...plus the new Learning System fields.
// ============================================
const mongoose = require("mongoose");

// These match the <option> values already in skill-management.html / browse-skills.html
const CATEGORIES = ["Programming", "Design", "Language", "Music", "Business", "Lifestyle"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: LEVELS,
    },
    desc: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ---------- Learning System fields ----------
    learningMode: {
      type: String,
      required: [true, "Learning mode is required"],
      enum: ["Online", "Offline", "Hybrid"],
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
      // required only when learningMode is Online/Hybrid - enforced in the controller/validation
    },
    availableSchedule: {
      type: String,
      required: [true, "Available schedule is required"],
      trim: true,
      maxlength: 200,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid contact email"],
    },
    resources: {
      type: [
        {
          title: { type: String, required: true, trim: true, maxlength: 120 },
          type: {
            type: String,
            required: true,
            enum: ["YouTube", "GitHub", "Google Drive", "PDF", "Website"],
          },
          url: { type: String, required: true, trim: true, maxlength: 500 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.LEVELS = LEVELS;
