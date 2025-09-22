import Channel from "../models/Channel.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Helper function to delete files
const deleteFile = (fileUrl) => {
  if (!fileUrl || fileUrl === "") return;
  try {
    const filename = fileUrl.split("/").pop();
    const fullPath = path.join("uploads", filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted channel file: ${fullPath}`);
    }
  } catch (error) {
    console.error("Failed to delete channel file:", error);
  }
};

// ✅ Get current user's channel
export const getMyChannel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;

    const channel = await Channel.findOne({ owner: userId }).populate({
      path: "videos",
      select: "title thumbnailUrl videoUrl category views likes createdAt",
      options: { sort: { createdAt: -1 }, limit: 50 },
      populate: { path: "uploader", select: "username avatar" },
    });

    if (!channel) {
      return res.status(404).json({ message: "No channel found for user" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    if (channel.channelBanner && !channel.channelBanner.startsWith("http")) {
      channel.channelBanner = `${baseUrl}${channel.channelBanner.split("/").pop()}`;
    }
    if (channel.channelLogo && !channel.channelLogo.startsWith("http")) {
      channel.channelLogo = `${baseUrl}${channel.channelLogo.split("/").pop()}`;
    }

    res.json(channel);
  } catch (err) {
    console.error("Error in getMyChannel:", err);
    res.status(500).json({ message: "Failed to fetch channel" });
  }
};

// ✅ Create channel
export const createChannel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;
    const { channelName, description = "" } = req.body;

    if (!channelName || !channelName.trim()) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    const trimmedName = channelName.trim();
    if (trimmedName.length < 3) {
      return res.status(400).json({ message: "Channel name must be at least 3 characters" });
    }
    if (trimmedName.length > 50) {
      return res.status(400).json({ message: "Channel name cannot exceed 50 characters" });
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc && trimmedDesc.length > 500) {
      return res.status(400).json({ message: "Description must be less than 500 characters" });
    }

    const existing = await Channel.findOne({ owner: userId });
    if (existing) {
      return res.status(400).json({ message: "Channel already exists" });
    }

    let channelBanner = null;
    let channelLogo = null;

    if (req.files?.channelBanner?.length > 0) {
      const bannerFile = req.files["channelBanner"][0];
      channelBanner = `${req.protocol}://${req.get("host")}/uploads/${bannerFile.filename}`;
    }
    if (req.files?.channelLogo?.length > 0) {
      const logoFile = req.files["channelLogo"][0];
      channelLogo = `${req.protocol}://${req.get("host")}/uploads/${logoFile.filename}`;
    }

    const channel = new Channel({
      channelName: trimmedName,
      description: trimmedDesc,
      channelBanner,
      channelLogo,
      owner: userId,
      subscribers: [],
      subscribersCount: 0,
      videos: [],
    });

    const createdChannel = await channel.save();
    const populatedChannel = await Channel.findById(createdChannel._id)
      .populate("videos", "title thumbnailUrl category views likes createdAt");

    res.status(201).json(populatedChannel);
  } catch (err) {
    console.error("🚨 Error in createChannel:", err);
    res.status(500).json({ message: "Failed to create channel" });
  }
};

// ✅ Update channel
export const updateChannel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (String(channel.owner) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to update this channel" });
    }

    const { channelName, description } = req.body;

    if (channelName !== undefined) {
      const trimmedName = channelName.trim();
      if (trimmedName.length < 3) {
        return res.status(400).json({ message: "Channel name must be at least 3 characters" });
      }
      if (trimmedName.length > 50) {
        return res.status(400).json({ message: "Channel name cannot exceed 50 characters" });
      }
      channel.channelName = trimmedName;
    }

    if (description !== undefined) {
      const trimmedDesc = description.trim();
      if (trimmedDesc.length > 500) {
        return res.status(400).json({ message: "Description must be less than 500 characters" });
      }
      channel.description = trimmedDesc;
    }

    if (req.files?.channelBanner?.length > 0) {
      if (channel.channelBanner) deleteFile(channel.channelBanner);
      channel.channelBanner = `${req.protocol}://${req.get("host")}/uploads/${req.files["channelBanner"][0].filename}`;
    }
    if (req.files?.channelLogo?.length > 0) {
      if (channel.channelLogo) deleteFile(channel.channelLogo);
      channel.channelLogo = `${req.protocol}://${req.get("host")}/uploads/${req.files["channelLogo"][0].filename}`;
    }

    const updatedChannel = await channel.save();
    const populatedChannel = await Channel.findById(updatedChannel._id)
      .populate("videos", "title thumbnailUrl category views likes createdAt");

    res.json(populatedChannel);
  } catch (err) {
    console.error("🚨 Error in updateChannel:", err);
    res.status(500).json({ message: "Failed to update channel" });
  }
};

// ✅ Public get channel by ID
export const getChannelById = async (req, res) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId)
      .populate({
        path: "videos",
        select: "title thumbnailUrl videoUrl category views likes createdAt",
        options: { sort: { createdAt: -1 }, limit: 12 },
      })
      .populate("owner", "username avatar");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    if (channel.channelBanner && !channel.channelBanner.startsWith("http")) {
      channel.channelBanner = `${baseUrl}${channel.channelBanner.split("/").pop()}`;
    }
    if (channel.channelLogo && !channel.channelLogo.startsWith("http")) {
      channel.channelLogo = `${baseUrl}${channel.channelLogo.split("/").pop()}`;
    }

    res.json(channel);
  } catch (err) {
    console.error("Error in getChannelById:", err);
    res.status(500).json({ message: "Failed to fetch channel" });
  }
};

// ✅ Subscribe
export const subscribeToChannel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const channelId = req.params.id;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isSubscribed = channel.subscribers.some(
      (sub) => String(sub._id || sub) === String(userId)
    );

    if (isSubscribed) {
      return res.status(400).json({ message: "Already subscribed to this channel" });
    }

    channel.subscribers.push(new mongoose.Types.ObjectId(userId));
    await channel.save();

    res.json({
      message: "Subscribed successfully",
      subscribersCount: channel.subscribersCount,
    });
  } catch (err) {
    console.error("Error in subscribeToChannel:", err);
    res.status(500).json({ message: "Failed to subscribe" });
  }
};

// ✅ Unsubscribe
export const unsubscribeFromChannel = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const channelId = req.params.id;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const initialCount = channel.subscribers.length;
    channel.subscribers = channel.subscribers.filter(
      (sub) => String(sub._id || sub) !== String(userId)
    );

    if (channel.subscribers.length === initialCount) {
      return res.status(400).json({ message: "Not subscribed to this channel" });
    }

    await channel.save();

    res.json({
      message: "Unsubscribed successfully",
      subscribersCount: channel.subscribersCount,
    });
  } catch (err) {
    console.error("Error in unsubscribeFromChannel:", err);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
};

// ✅ Get all channels
export const getAllChannels = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, sort = "subscribersCount" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { channelName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {
      subscribersCount: { subscribersCount: -1 },
      newest: { createdAt: -1 },
      alphabetical: { channelName: 1 },
    };

    const channels = await Channel.find(query)
      .select("channelName description channelBanner channelLogo subscribersCount videos")
      .populate("owner", "username")
      .sort(sortOptions[sort] || sortOptions.subscribersCount)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const channelsWithUrls = channels.map((channel) => ({
      ...channel,
      channelBanner:
        channel.channelBanner && !channel.channelBanner.startsWith("http")
          ? `${baseUrl}${channel.channelBanner.split("/").pop()}`
          : channel.channelBanner,
      channelLogo:
        channel.channelLogo && !channel.channelLogo.startsWith("http")
          ? `${baseUrl}${channel.channelLogo.split("/").pop()}`
          : channel.channelLogo,
    }));

    const total = await Channel.countDocuments(query);

    res.json({
      channels: channelsWithUrls,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Error in getAllChannels:", err);
    res.status(500).json({ message: "Failed to fetch channels" });
  }
};
