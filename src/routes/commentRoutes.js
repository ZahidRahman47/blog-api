const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

router.get("/", getComments);
router.post("/", protect, createComment);
router.put("/:commentId", protect, updateComment);
router.delete("/:commentId", protect, deleteComment);

module.exports = router;