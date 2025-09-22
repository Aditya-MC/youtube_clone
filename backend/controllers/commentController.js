import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// Add comment to video (authenticated)
export const addComment = async (req, res) => {
  const { text } = req.body;
  const videoId = req.params.videoId;

  const comment = new Comment({
    videoId,
    userId: req.user._id,
    text,
  });
  const savedComment = await comment.save();

  // Add comment reference to video
  await Video.findByIdAndUpdate(videoId, { $push: { comments: savedComment._id } });

  res.status(201).json(savedComment);
};

// Get comments for video
export const getComments = async (req, res) => {
  const videoId = req.params.videoId;
  const comments = await Comment.find({ videoId }).populate("userId", "username");
  res.json(comments);
};

// Update comment (only comment owner)
export const updateComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  if (comment.userId.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Not authorized" });

  comment.text = req.body.text || comment.text;
  const updatedComment = await comment.save();
  res.json(updatedComment);
};

// Delete comment (only comment owner) - FIXED
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    // ✅ FIXED: Replaced comment.remove() with comment.deleteOne()
    await comment.deleteOne();
    
    // Remove comment reference from video
    await Video.findByIdAndUpdate(comment.videoId, { $pull: { comments: comment._id } });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: "Server error" });
  }
};