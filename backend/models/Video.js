import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  thumbnailUrl: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, default: "Coding" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export default mongoose.model("Video", videoSchema);