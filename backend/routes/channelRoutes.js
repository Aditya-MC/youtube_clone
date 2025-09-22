import express from "express";
import multer from "multer";
import fs from "fs";  // ✅ ES Module import (at top)
import {
  getMyChannel,
  createChannel,
  updateChannel,
  getChannelById,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "../controllers/channelController.js";
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

// File size limit (5MB for images)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

const fileFilter = (req, file, cb) => {
  // Only allow image files for channel banner/logo
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for channel banner and logo'), false);
  }
};

const upload = multer({ 
  storage,
  limits,
  fileFilter
});

// Routes
router.get("/mine", protect, getMyChannel);
router.get("/:id", getChannelById);  // Public route

// Protected routes - subscribe/unsubscribe
router.post("/:id/subscribe", protect, subscribeToChannel);
router.delete("/:id/subscribe", protect, unsubscribeFromChannel);

// Create channel with file upload
router.post("/", protect, upload.fields([
  { name: "channelBanner", maxCount: 1 },
  { name: "channelLogo", maxCount: 1 },
]), createChannel);

// Update channel with file upload
router.put("/:id", protect, upload.fields([
  { name: "channelBanner", maxCount: 1 },
  { name: "channelLogo", maxCount: 1 },
]), updateChannel);

export default router;