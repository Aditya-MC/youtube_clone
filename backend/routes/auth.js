import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Channel from "../models/Channel.js";
import { verifyToken } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User/email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashed, avatar });
    await user.save();
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Fetch channels owned by user
    const channels = await Channel.find({ owner: user._id }).select("_id");
    const channelIds = channels.map(c => c._id);

    const payload = { userId: user._id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        channels: channelIds,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Edit profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) delete updates.password; // Do not allow direct password change here
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
