// ============================================
// controllers/skillController.js
// ============================================
const Skill = require("../models/Skill");
const Request = require("../models/Request");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Fields that must stay hidden until the viewer is the owner,
// or a learner whose request for this skill was accepted.
const RESTRICTED_FIELDS = "-meetingLink -contactEmail -resources";

// @desc    Create a skill (matches skill-management.html's modal fields)
// @route   POST /api/skills
// @access  Private
const createSkill = asyncHandler(async (req, res) => {
  const { name, category, level, desc, learningMode, meetingLink, availableSchedule, contactEmail, resources } = req.body;

  const skill = await Skill.create({
    name,
    category,
    level,
    desc,
    user: req.user._id,
    learningMode,
    meetingLink: meetingLink || "",
    availableSchedule,
    // Defaults to the user's registered email, but the form may override it
    contactEmail: contactEmail || req.user.email,
    resources: resources || [],
  });

  res.status(201).json({ success: true, message: "Skill added", data: skill });
});

// @desc    Browse skills (public) - matches browse-skills.html's catalogue view.
//          Never includes meetingLink / contactEmail / resources.
// @route   GET /api/skills?search=&category=&level=
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
  const { search, category, level } = req.query;
  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (level && level !== "all") filter.level = level;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { desc: { $regex: search, $options: "i" } },
    ];
  }

  const skills = await Skill.find(filter)
    .select(RESTRICTED_FIELDS)
    .populate("user", "fullName email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: skills });
});

// @desc    Get a single skill (public preview, restricted fields hidden)
// @route   GET /api/skills/:id
// @access  Public
const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).select(RESTRICTED_FIELDS).populate("user", "fullName email");
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }
  res.json({ success: true, data: skill });
});

// @desc    Get FULL skill details (meeting link, contact email, resources).
//          Security rule: only the skill owner, or a learner with an
//          accepted request for this exact skill, may view this.
// @route   GET /api/skills/:id/full
// @access  Private
const getSkillFull = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).populate("user", "fullName email");
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  const isOwner = skill.user._id.toString() === req.user._id.toString();

  let isAcceptedLearner = false;
  if (!isOwner) {
    const accepted = await Request.findOne({ skill: skill._id, fromUser: req.user._id, status: "accepted" });
    isAcceptedLearner = !!accepted;
  }

  if (!isOwner && !isAcceptedLearner) {
    throw new ApiError(403, "You need an accepted learning request to view these details");
  }

  res.json({ success: true, data: skill });
});

// @desc    Get all skills belonging to the logged-in user (My Skills page)
// @route   GET /api/skills/mine
// @access  Private
const getMySkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: skills });
});

// @desc    Update a skill (owner only - enforces the "only owner can edit" rule)
// @route   PUT /api/skills/:id
// @access  Private
const updateSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }
  if (skill.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own skill");
  }

  const { name, category, level, desc, learningMode, meetingLink, availableSchedule, contactEmail, resources } = req.body;
  if (name) skill.name = name;
  if (category) skill.category = category;
  if (level) skill.level = level;
  if (desc !== undefined) skill.desc = desc;
  if (learningMode) skill.learningMode = learningMode;
  if (meetingLink !== undefined) skill.meetingLink = meetingLink;
  if (availableSchedule) skill.availableSchedule = availableSchedule;
  if (contactEmail) skill.contactEmail = contactEmail;
  if (resources !== undefined) skill.resources = resources;

  await skill.save();
  res.json({ success: true, message: "Skill updated", data: skill });
});

// @desc    Delete a skill (owner only)
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }
  if (skill.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own skill");
  }
  await skill.deleteOne();
  res.json({ success: true, message: "Skill deleted" });
});

module.exports = { createSkill, getSkills, getSkillById, getSkillFull, getMySkills, updateSkill, deleteSkill };
