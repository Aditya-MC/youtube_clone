import express from "express";
import multer from "multer";
import path from "path";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/videos/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const videoUpload = multer({ 
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const thumbStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/thumbnails/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const thumbUpload = multer({
  storage: thumbStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/upload", verifyToken, videoUpload.single("videoFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No video file uploaded" });
  const videoUrl = `http://localhost:5000/uploads/videos/${req.file.filename}`;
  res.json({ videoUrl });
});

router.post("/upload-thumbnail", verifyToken, thumbUpload.single("thumbnailFile"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No thumbnail file uploaded" });
  const thumbnailUrl = `http://localhost:5000/uploads/thumbnails/${req.file.filename}`;
  res.json({ thumbnailUrl });
});

// Get all videos
router.get("/", async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (category && category !== "All") filter.category = category;
  const videos = await Video.find(filter).sort({ createdAt: -1 }).populate("channelId", "channelName");
  res.json(videos);
});

// Get single video with comments populated
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("comments");
    if (!video) return res.status(404).json({ message: "Video not found" });
    return res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Video creation
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, category, channelId } = req.body;
    const uploader = req.user.userId;

    const video = new Video({ title, description, thumbnailUrl, videoUrl, category, channelId, uploader });
    await video.save();

    if (channelId) {
      await Channel.findByIdAndUpdate(channelId, { $push: { videos: video._id } });
    }

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// Like a video
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    return res.json(video);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Dislike a video
router.post("/:id/dislike", verifyToken, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    return res.json(video);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Other routes like update/delete/like/dislike unchanged

export default router;
