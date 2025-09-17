import express from "express";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Add comment
router.post("/", verifyToken, async (req, res) => {
  try {
    const { videoId, text } = req.body;
    if (!text) return res.status(400).json({ message: "Empty comment" });

    const comment = new Comment({ userId: req.user.userId, videoId, text });
    await comment.save();

    await Video.findByIdAndUpdate(videoId, { $push: { comments: comment._id } });

    return res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get comments for video
router.get("/:videoId", async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId }).sort({ createdAt: -1 }).populate("userId", "username avatar");
    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Edit comment
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Not found" });
    if (String(comment.userId) !== req.user.userId) return res.status(403).json({ message: "Forbidden" });
    comment.text = req.body.text || comment.text;
    await comment.save();
    return res.json(comment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete comment
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Not found" });
    if (String(comment.userId) !== req.user.userId) return res.status(403).json({ message: "Forbidden" });
    await Comment.findByIdAndDelete(req.params.id);
    await Video.findByIdAndUpdate(comment.videoId, { $pull: { comments: comment._id } });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
