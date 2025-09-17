import express from "express";
import Channel from "../models/Channel.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Create channel
router.post("/", verifyToken, async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;
    const owner = req.user.userId;
    const channel = new Channel({ channelName, description, channelBanner, owner });
    await channel.save();

    // add channel to user
    await User.findByIdAndUpdate(owner, { $push: { channels: channel._id } });

    return res.status(201).json(channel);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get channel by id
router.get("/:id", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate("videos");
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    return res.json(channel);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Edit channel
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (String(channel.owner) !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });
    Object.assign(channel, req.body);
    await channel.save();
    return res.json(channel);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete channel
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    if (String(channel.owner) !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });
    await channel.deleteOne();
    await User.findByIdAndUpdate(req.user.userId, { $pull: { channels: channel._id } });
    return res.json({ message: 'Channel deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});



export default router;
