const express = require("express");
const router = express.Router();
const {
  createSkill,
  getSkills,
  getSkillById,
  getSkillFull,
  getMySkills,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const { protect } = require("../middleware/authMiddleware");
const { validateSkill } = require("../middleware/validateMiddleware");

router.get("/mine", protect, getMySkills);       // must come before /:id
router.get("/:id/full", protect, getSkillFull);  // must come before /:id
router.get("/", getSkills);
router.get("/:id", getSkillById);
router.post("/", protect, validateSkill, createSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

module.exports = router;
