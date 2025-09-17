import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import User from "./models/User.js";
import Channel from "./models/Channel.js";
import Video from "./models/Video.js";
import Comment from "./models/Comment.js";
import bcrypt from "bcryptjs";

dotenv.config();

const run = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    console.log("DB cleared");

    // create users
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash("password123", salt);

    const user1 = await User.create({ username: "JohnDoe", email: "john@example.com", password: pass, avatar: "https://i.pravatar.cc/150?img=1" });
    const user2 = await User.create({ username: "Alice", email: "alice@example.com", password: pass, avatar: "https://i.pravatar.cc/150?img=2" });

    // channel
    const channel1 = await Channel.create({ channelName: "Code with John", owner: user1._id, description: "Coding tutorials", channelBanner: "" });

    user1.channels.push(channel1._id);
    await user1.save();

    // videos
    const video1 = await Video.create({
      title: "Learn React in 30 Minutes",
      thumbnailUrl: "https://via.placeholder.com/320x180.png?text=React+30min",
      description: "A quick tutorial to get started with React.",
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      channelId: channel1._id,
      uploader: user1._id,
      category: "Coding",
      views: 15200,
      likes: 1023,
      dislikes: 45
    });

    const video2 = await Video.create({
      title: "Intro to Node.js",
      thumbnailUrl: "https://via.placeholder.com/320x180.png?text=Node+Intro",
      description: "Node.js basics.",
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      channelId: channel1._id,
      uploader: user1._id,
      category: "Tech",
      views: 5400
    });

    channel1.videos.push(video1._id, video2._id);
    await channel1.save();

    // comments
    const comment1 = await Comment.create({ userId: user2._id, videoId: video1._id, text: "Great video! Very helpful." });
    video1.comments.push(comment1._id);
    await video1.save();

    console.log("Seed complete");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
