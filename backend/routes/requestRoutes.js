const express = require("express");
const router = express.Router();
const { sendRequest, getMyRequests, respondToRequest, cancelRequest } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

router.post("/", protect, validateRequest, sendRequest);
router.get("/mine", protect, getMyRequests);
router.put("/:id", protect, respondToRequest);
router.delete("/:id", protect, cancelRequest);

module.exports = router;
