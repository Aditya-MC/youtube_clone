import express from "express";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// Body parser middleware for comment text limits
router.use(express.json({ limit: '2kb' })); // Limit comment size to 2KB
router.use(express.urlencoded({ limit: '2kb', extended: true }));

// Routes
router.post("/:videoId", protect, addComment);
router.get("/:videoId", getComments);
router.put("/:videoId/:commentId", protect, updateComment);
router.delete("/:videoId/:commentId", protect, deleteComment);

export default router;