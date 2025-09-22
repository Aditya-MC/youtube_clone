import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import fs from "fs";
import path from "path";

// Helper function to delete files
const deleteFile = (fileUrl) => {
  if (!fileUrl || fileUrl === "") return;
  
  try {
    // Extract filename from URL (remove base URL)
    const filename = fileUrl.split('/').pop();
    const fullPath = path.join('uploads', filename);
    
    // Check if file exists before deleting
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted file: ${fullPath}`);
    } else {
      console.log(`ℹ️ File not found for deletion: ${fullPath}`);
    }
  } catch (error) {
    console.error('❌ Failed to delete file:', error.message);
  }
};

// Get all videos with optional search and category filters
export const getVideos = async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const query = {};
    
    // Search in title and description
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    // Category filter
    if (category && category.trim() !== "All") {
      query.category = category.trim();
    }
    
    const videos = await Video.find(query)
      .populate("channelId", "channelName channelLogo")
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`📺 Found ${videos.length} videos matching query`);
    res.json(videos);
  } catch (error) {
    console.error("🚨 Get videos error:", error.message);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("channelId", "channelName channelLogo description")
      .populate({ 
        path: "comments", 
        populate: { path: "userId", select: "username avatar" },
        options: { sort: { createdAt: -1 } }
      });
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment view count safely
    video.views = (video.views || 0) + 1;
    await video.save();

    console.log(`👁️ Video viewed: ${video.title} (views: ${video.views})`);
    res.json(video);
  } catch (error) {
    console.error("🚨 Get video by ID error:", error.message);
    res.status(500).json({ message: "Failed to fetch video" });
  }
};

// Create video with uploaded files - ERROR-FREE VERSION
export const createVideo = async (req, res) => {
  try {
    console.log("🚀 Creating new video...");
    
    const { title, description, category = "All" } = req.body;
    const userId = req.user._id;

    // Get files safely
    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnailFile?.[0];

    console.log("📄 Form data:", { title, category });
    console.log("🎥 Video file:", videoFile?.filename);
    console.log("🖼️ Thumbnail:", thumbnailFile?.filename);

    // Basic validation
    if (!title?.trim()) {
      console.log("❌ Title is required");
      return res.status(400).json({ message: "Title is required" });
    }

    if (!videoFile) {
      console.log("❌ Video file is required");
      return res.status(400).json({ message: "Video file is required" });
    }

    // Find user's channel SAFELY
    const userChannels = await Channel.find({ owner: userId });
    if (userChannels.length === 0) {
      console.log("❌ User has no channel");
      return res.status(400).json({ 
        message: "Please create a channel first before uploading videos" 
      });
    }
    
    const channel = userChannels[0];
    console.log("📺 Using channel:", channel.channelName);

    // Generate URLs safely
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const baseUrl = `${protocol}://${host}/uploads/`;

    const videoUrl = `${baseUrl}${videoFile.filename}`;
    const thumbnailUrl = thumbnailFile 
      ? `${baseUrl}${thumbnailFile.filename}` 
      : null;

    console.log("🔗 Generated URLs:", { videoUrl, thumbnailUrl });

    // Create video document
    const videoData = {
      title: title.trim(),
      description: description ? description.trim() : "",
      videoUrl,
      thumbnailUrl,
      channelId: channel._id,
      uploader: userId,
      category: category.trim() || "All",
      views: 0,
      likes: 0,
      dislikes: 0
    };

    console.log("📝 Creating video with data:", videoData.title);
    const createdVideo = await Video.create(videoData);
    console.log("✅ Video created successfully:", createdVideo._id);

    // Update channel videos array SAFELY
    try {
      // Check if video is already in channel
      if (!channel.videos.includes(createdVideo._id)) {
        channel.videos = channel.videos || [];
        channel.videos.push(createdVideo._id);
        
        // Save channel with error handling
        await channel.save().catch(channelError => {
          console.error("⚠️ Could not update channel videos:", channelError.message);
          // Don't fail the entire operation
        });
        
        console.log("📺 Video added to channel");
      }
    } catch (channelError) {
      console.error("⚠️ Channel update failed:", channelError.message);
      // Video creation succeeded, so we don't fail the response
    }

    // Return video with populated channel data
    const populatedVideo = await Video.findById(createdVideo._id)
      .populate("channelId", "channelName channelLogo channelBanner")
      .populate("uploader", "username");

    console.log("🎉 Video upload COMPLETED successfully!");
    res.status(201).json(populatedVideo);

  } catch (error) {
    console.error("🚨 Create video ERROR:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid data format" });
    }

    res.status(500).json({ 
      message: "Failed to create video",
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message 
      })
    });
  }
};

// Update video details (with file upload support)
export const updateVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check authorization
    if (String(video.uploader) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to edit this video" });
    }

    console.log("🔄 Updating video:", video.title);

    // Update text fields safely
    if (req.body.title) {
      video.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) {
      video.description = req.body.description.trim();
    }
    if (req.body.category) {
      video.category = req.body.category.trim() || "All";
    }

    let filesUpdated = false;

    // Handle new video file upload
    const videoFile = req.files?.videoFile?.[0];
    if (videoFile) {
      console.log("🎥 Replacing video file:", videoFile.filename);
      
      // Delete old video file safely
      if (video.videoUrl) {
        deleteFile(video.videoUrl);
      }
      
      video.videoUrl = `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}`;
      filesUpdated = true;
    }

    // Handle new thumbnail file upload
    const thumbnailFile = req.files?.thumbnailFile?.[0];
    if (thumbnailFile) {
      console.log("🖼️ Replacing thumbnail:", thumbnailFile.filename);
      
      // Delete old thumbnail safely
      if (video.thumbnailUrl) {
        deleteFile(video.thumbnailUrl);
      }
      
      video.thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/${thumbnailFile.filename}`;
      filesUpdated = true;
    }

    // Save updated video
    const updatedVideo = await video.save();
    console.log(`✅ Video updated: ${filesUpdated ? 'Files + metadata' : 'Metadata only'}`);

    // Return updated video with populated data
    const populatedVideo = await Video.findById(videoId)
      .populate("channelId", "channelName channelLogo")
      .populate("uploader", "username");

    res.json(populatedVideo);
  } catch (error) {
    console.error("🚨 Update video error:", error.message);
    res.status(500).json({ message: "Failed to update video" });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    console.log("🗑️ Deleting video:", videoId, "by user:", userId);

    const video = await Video.findById(videoId);
    if (!video) {
      console.log("❌ Video not found");
      return res.status(404).json({ message: "Video not found" });
    }

    // Check authorization
    if (String(video.uploader) !== String(userId)) {
      console.log("🚫 Unauthorized delete attempt");
      return res.status(403).json({ message: "Not authorized" });
    }

    console.log("📹 Deleting files for:", video.title);

    // Delete video file
    if (video.videoUrl) {
      deleteFile(video.videoUrl);
    }

    // Delete thumbnail file
    if (video.thumbnailUrl) {
      deleteFile(video.thumbnailUrl);
    }

    // Delete video document
    await Video.findByIdAndDelete(videoId);
    console.log("✅ Video document deleted");

    // Remove from channel videos array
    await Channel.findByIdAndUpdate(
      video.channelId,
      { $pull: { videos: videoId } }
    ).catch(err => {
      console.error("⚠️ Could not update channel:", err.message);
    });

    console.log("🎉 Video deleted successfully");
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("🚨 Delete video error:", error.message);
    res.status(500).json({ message: "Failed to delete video" });
  }
};

// Like video
export const likeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.likes = (video.likes || 0) + 1;
    await video.save();

    console.log(`👍 Video liked: ${video.title} (likes: ${video.likes})`);
    res.json({ likes: video.likes, message: "Video liked successfully" });
  } catch (error) {
    console.error("🚨 Like video error:", error.message);
    res.status(500).json({ message: "Failed to like video" });
  }
};

// Dislike video
export const dislikeVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const video = await Video.findById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.dislikes = (video.dislikes || 0) + 1;
    await video.save();

    console.log(`👎 Video disliked: ${video.title} (dislikes: ${video.dislikes})`);
    res.json({ dislikes: video.dislikes, message: "Video disliked successfully" });
  } catch (error) {
    console.error("🚨 Dislike video error:", error.message);
    res.status(500).json({ message: "Failed to dislike video" });
  }
};

// Get user's videos (for channel page)
export const getUserVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("👤 Fetching videos for user:", userId);
    
    // Find user's channel and populate videos
    const channel = await Channel.findOne({ owner: userId })
      .populate({
        path: 'videos',
        select: 'title description thumbnailUrl videoUrl category views likes dislikes createdAt',
        options: { 
          sort: { createdAt: -1 },
          limit: 100 
        },
        populate: {
          path: 'uploader',
          select: 'username'
        }
      });
    
    if (!channel) {
      console.log("❌ No channel found for user");
      return res.status(404).json({ message: "Channel not found" });
    }

    console.log(`📺 Found ${channel.videos.length} videos for channel: ${channel.channelName}`);
    res.json(channel);
  } catch (error) {
    console.error("🚨 Get user videos error:", error.message);
    res.status(500).json({ message: "Failed to fetch user videos" });
  }
};