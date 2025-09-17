import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import channelsRoutes from "./routes/channels.js";
import videosRoutes from "./routes/videos.js";
import commentsRoutes from "./routes/comments.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/uploads/videos", express.static("uploads/videos"));
app.use("/uploads/thumbnails", express.static("uploads/thumbnails"));

(async () => {
  await connectDB(process.env.MONGO_URI);
})();

app.get("/", (req, res) => res.send("YouTube clone API running"));

app.use("/api/auth", authRoutes);
app.use("/api/channels", channelsRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/comments", commentsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
