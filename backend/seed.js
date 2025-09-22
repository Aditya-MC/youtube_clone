// seed.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import User from './models/User.js';
import Channel from './models/Channel.js';
import Video from './models/Video.js';
import Comment from './models/Comment.js';

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/youtubeClone';
const UPLOADS_BASE_URL = 'http://localhost:5000/uploads';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB!');

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Channel.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});

    console.log('🌱 Starting seeding process...');

    // USERS
    console.log('👤 Seeding users...');
    const usersData = [
      { username: 'JohnDoe', email: 'john@example.com', password: 'password123', avatar: `${UPLOADS_BASE_URL}/avatars/john.jpg`, channels: [] },
      { username: 'JaneSmith', email: 'jane@example.com', password: 'password456', avatar: `${UPLOADS_BASE_URL}/avatars/jane.jpg`, channels: [] },
      { username: 'TechGuru', email: 'techguru@example.com', password: 'password789', avatar: `${UPLOADS_BASE_URL}/avatars/techguru.jpg`, channels: [] },
      { username: 'AliceW', email: 'alice@example.com', password: 'password321', avatar: `${UPLOADS_BASE_URL}/avatars/alice.jpg`, channels: [] },
      { username: 'BobK', email: 'bob@example.com', password: 'password654', avatar: `${UPLOADS_BASE_URL}/avatars/bob.jpg`, channels: [] },
    ];

    const users = await User.insertMany(usersData);
    console.log(`✅ Seeded ${users.length} users`);

    // CHANNELS
    console.log('📺 Seeding channels...');
    const channelsData = [
      { channelName: 'Code with John', owner: users[0]._id, description: 'Coding tutorials and tech reviews.', channelBanner: `${UPLOADS_BASE_URL}/banners/channel1_banner.jpg`, channelLogo: `${UPLOADS_BASE_URL}/logos/channel1_logo.jpg`, subscribers: 5200, subscribersCount: 5200, videos: [] },
      { channelName: "Jane's Art Studio", owner: users[1]._id, description: 'Digital art tutorials and creative inspiration.', channelBanner: `${UPLOADS_BASE_URL}/banners/channel2_banner.jpg`, channelLogo: `${UPLOADS_BASE_URL}/logos/channel2_logo.jpg`, subscribers: 3200, subscribersCount: 3200, videos: [] },
      { channelName: 'TechGuru Reviews', owner: users[2]._id, description: 'Latest tech gadgets and software reviews.', channelBanner: `${UPLOADS_BASE_URL}/banners/channel3_banner.jpg`, channelLogo: `${UPLOADS_BASE_URL}/logos/channel3_logo.jpg`, subscribers: 7500, subscribersCount: 7500, videos: [] },
      { channelName: 'Alice World', owner: users[3]._id, description: 'Fun, lifestyle & vlogs.', channelBanner: `${UPLOADS_BASE_URL}/banners/channel4_banner.jpg`, channelLogo: `${UPLOADS_BASE_URL}/logos/channel4_logo.jpg`, subscribers: 4100, subscribersCount: 4100, videos: [] },
      { channelName: 'Bob Gaming', owner: users[4]._id, description: 'All about gaming and entertainment.', channelBanner: `${UPLOADS_BASE_URL}/banners/channel5_banner.jpg`, channelLogo: `${UPLOADS_BASE_URL}/logos/channel5_logo.jpg`, subscribers: 2900, subscribersCount: 2900, videos: [] },
    ];

    const channels = await Channel.insertMany(channelsData);
    await users.forEach((u, idx) => User.findByIdAndUpdate(u._id, { $push: { channels: channels[idx]?._id || [] } }));

    // BASE VIDEOS (reuse your 10 video/thumbnail files)
    const baseVideos = [
      { videoFile: 'video1.mp4', thumb: 'thumb1.jpg' },
      { videoFile: 'video2.mp4', thumb: 'thumb2.jpg' },
      { videoFile: 'video3.mp4', thumb: 'thumb3.jpg' },
      { videoFile: 'video4.mp4', thumb: 'thumb4.jpg' },
      { videoFile: 'video5.mp4', thumb: 'thumb5.jpg' },
      { videoFile: 'video6.mp4', thumb: 'thumb6.jpg' },
      { videoFile: 'video7.mp4', thumb: 'thumb7.jpg' },
      { videoFile: 'video8.mp4', thumb: 'thumb8.jpg' },
      { videoFile: 'video9.mp4', thumb: 'thumb9.jpg' },
      { videoFile: 'video10.mp4', thumb: 'thumb10.jpg' },
    ];

    // Generate 35 fake videos by combining base videos with new titles/descriptions/categories
    console.log('🎥 Seeding 35+ videos...');
    const categories = ['Education', 'Comedy', 'Music', 'Technology', 'Gaming', 'News'];
    const videosData = [];

    let counter = 1;
    for (let i = 0; i < 35; i++) {
      const base = baseVideos[i % baseVideos.length];
      const channel = channels[i % channels.length];
      const user = users[i % users.length];
      const category = categories[i % categories.length];

      videosData.push({
        title: `${category} Video #${counter}`,
        description: `This is a sample description for ${category} Video #${counter}. Learn and enjoy!`,
        thumbnailUrl: `${UPLOADS_BASE_URL}/thumbnails/${base.thumb}`,
        videoUrl: `${UPLOADS_BASE_URL}/videos/${base.videoFile}`,
        channelId: channel._id,
        uploader: user._id,
        views: Math.floor(Math.random() * 20000) + 1000,
        likes: Math.floor(Math.random() * 2000),
        dislikes: Math.floor(Math.random() * 100),
        category,
        comments: [],
        uploadDate: new Date(Date.now() - i * 86400000), // past i days
      });
      counter++;
    }

    const videos = await Video.insertMany(videosData);
    console.log(`✅ Seeded ${videos.length} videos`);

    // Add videos to channels
    for (let i = 0; i < channels.length; i++) {
      const vids = videos.filter(v => v.channelId.toString() === channels[i]._id.toString());
      await Channel.findByIdAndUpdate(channels[i]._id, { $push: { videos: { $each: vids.map(v => v._id) } } });
    }

    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
    process.exit(1);
  }
};

seedDatabase();
