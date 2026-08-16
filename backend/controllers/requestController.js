// ============================================
// controllers/requestController.js - Learning Requests, feeding
// the Pending / Accepted / Rejected / History tabs on requests.html
// ============================================
const Request = require("../models/Request");
const Skill = require("../models/Skill");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Send a learning request for a skill (browse-skills.html "Send Request")
// @route   POST /api/requests
// @access  Private
const sendRequest = asyncHandler(async (req, res) => {
  const { skillId, message } = req.body;

  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }
  if (skill.user.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot request your own skill");
  }

  const existing = await Request.findOne({ skill: skillId, fromUser: req.user._id, status: "pending" });
  if (existing) {
    throw new ApiError(400, "You already have a pending request for this skill");
  }

  const request = await Request.create({
    skill: skillId,
    fromUser: req.user._id,
    toUser: skill.user,
    message: message || "",
  });

  res.status(201).json({ success: true, message: "Request sent", data: request });
});

// @desc    Every request involving the logged-in user, split by direction
//          (used to build the Pending / Accepted / Rejected / History tabs)
// @route   GET /api/requests/mine
// @access  Private
const getMyRequests = asyncHandler(async (req, res) => {
  const [sent, received] = await Promise.all([
    Request.find({ fromUser: req.user._id })
      .populate("skill", "name category")
      .populate("toUser", "fullName email")
      .sort({ createdAt: -1 }),
    Request.find({ toUser: req.user._id })
      .populate("skill", "name category")
      .populate("fromUser", "fullName email")
      .sort({ createdAt: -1 }),
  ]);

  res.json({ success: true, data: { sent, received } });
});

// @desc    Accept or reject a request (only the recipient/skill owner can respond)
// @route   PUT /api/requests/:id
// @access  Private
const respondToRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // "accepted" or "rejected"
  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiError(400, "Status must be 'accepted' or 'rejected'");
  }

  const request = await Request.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }
  if (request.toUser.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only respond to requests sent to you");
  }
  if (request.status !== "pending") {
    throw new ApiError(400, "This request has already been responded to");
  }

  request.status = status;
  await request.save();

  res.json({ success: true, message: `Request ${status}`, data: request });
});

// @desc    Cancel a request I sent (only while still pending)
// @route   DELETE /api/requests/:id
// @access  Private
const cancelRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) {
    throw new ApiError(404, "Request not found");
  }
  if (request.fromUser.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only cancel requests you sent");
  }
  if (request.status !== "pending") {
    throw new ApiError(400, "Only pending requests can be cancelled");
  }
  await request.deleteOne();
  res.json({ success: true, message: "Request cancelled" });
});

module.exports = { sendRequest, getMyRequests, respondToRequest, cancelRequest };
