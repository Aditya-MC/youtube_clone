import { Link } from "react-router-dom";

export default function VideoCard({ video }) {
  return (
    <div className="video-card">
      <Link to={`/video/${video._id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <img 
          src={video.thumbnailUrl || "https://via.placeholder.com/300x170?text=No+Thumbnail"} 
          alt={video.title} 
          className="thumbnail" 
        />
        <div style={{ padding: "8px 0" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: "bold" }}>
            {video.title}
          </h3>
          <p style={{ margin: "0 0 2px 0", color: "#606060", fontSize: "0.85rem" }}>
            {video.category || "All"}
          </p>
          <p style={{ margin: "0 0 4px 0", color: "#606060", fontSize: "0.85rem" }}>
            {video.channelId?.channelName || "Unknown Channel"}
          </p>
          <p style={{ margin: 0, color: "#606060", fontSize: "0.85rem" }}>
            {video.views || 0} views
          </p>
        </div>
      </Link>
    </div>
  );
}