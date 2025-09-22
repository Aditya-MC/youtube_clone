import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  channelName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  channelBanner: { 
    type: String 
  },
  channelLogo: { 
    type: String 
  },
  // ✅ TEMPORARY FIX: Allow ANYTHING for subscribers during migration
  subscribers: { 
    type: mongoose.Schema.Types.Mixed,  // This allows numbers, arrays, anything!
    default: 0 
  },
  subscribersCount: { 
    type: Number, 
    default: 0 
  },
  videos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Video" 
  }],
}, { timestamps: true });

export default mongoose.model("Channel", channelSchema);