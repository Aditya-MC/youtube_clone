import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import CommentSection from "../components/CommentSection";

export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchVideo();
    fetchRecommendations();
  }, [id]);

  const fetchVideo = async () => {
    const { data } = await API.get(`/videos/${id}`);
    setVideo(data);
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };

  const fetchRecommendations = async () => {
    const { data } = await API.get("/videos"); // get all videos
    // filter out the current video
    setRecommendations(data.filter((vid) => vid._id !== id));
  };

  const handleLike = async () => {
    await API.post(`/videos/${id}/like`);
    setLikes(likes + 1);
  };

  const handleDislike = async () => {
    await API.post(`/videos/${id}/dislike`);
    setDislikes(dislikes + 1);
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="video-page-container" style={{ display: "flex", gap: "20px" }}>
      {/* Left: Main Video */}
      <div className="video-main" style={{ flex: 3 }}>
        <video
          src={video.videoUrl}
          controls
          className="video-player"
          poster={video.thumbnailUrl}
          style={{ width: "100%", borderRadius: "8px" }}
        />
        <h2>{video.title}</h2>
        <p>{video.description}</p>
        <p>Channel: {video.channelId?.channelName}</p>
        <div className="video-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
  <div style={{ display: "flex", gap: "10px" }}>
    <button onClick={handleLike}>👍 {likes}</button>
    <button onClick={handleDislike}>👎 {dislikes}</button>
  </div>
  <button style={{
    backgroundColor: "#FF0000",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  }}>
    Subscribe
  </button>
</div>
        <CommentSection videoId={id} />
      </div>

      {/* Right: Recommendations */}
      <div className="video-recommendations" style={{ flex: 1 }}>
        <h3>Recommended</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recommendations.map((rec) => (
            <Link
              to={`/video/${rec._id}`}
              key={rec._id}
              style={{ display: "flex", gap: "10px", textDecoration: "none", color: "inherit" }}
            >
              <img
                src={rec.thumbnailUrl}
                alt={rec.title}
                style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
              />
              <div>
                <p style={{ fontWeight: "bold", fontSize: "14px" }}>{rec.title}</p>
                <p style={{ fontSize: "12px", color: "gray" }}>
                  {rec.channelId?.channelName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
