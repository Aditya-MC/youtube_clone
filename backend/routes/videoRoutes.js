import express from "express";
import multer from "multer";
import fs from "fs";  // ✅ ES Module import (at top)
import path from "path";  // ✅ ES Module import (at top)
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  likeVideo,
  dislikeVideo,
  getUserVideos,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ ES Module version of multer configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // ✅ Use import instead of require
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${uniqueSuffix}-${file.fieldname}.${ext}`);
  },
});

// File size limits (100MB for video, 5MB for thumbnail)
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB
};

const fileFilter = (req, file, cb) => {
  // Allow video files
  if (file.fieldname === 'videoFile') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
  // Allow image files
  else if (file.fieldname === 'thumbnailFile') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({ 
  storage,
  limits,
  fileFilter
});

// Routes
router.get("/", getVideos);
router.get("/:id", getVideoById);

// Protected routes - Create video with file upload
router.post(
  "/",
  protect,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  createVideo
);

// Protected routes - Update video with optional file upload
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  updateVideo
);

// Protected routes
router.delete("/:id", protect, deleteVideo);
router.post("/:id/like", protect, likeVideo);
router.post("/:id/dislike", protect, dislikeVideo);

// New route - Get user's videos for channel page
router.get("/user", protect, getUserVideos);

export default router;