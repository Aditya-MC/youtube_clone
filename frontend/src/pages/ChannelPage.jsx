import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VideoUploadForm from "../components/VideoUploadForm";
import API from "../api/api";

export default function ChannelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [formMode, setFormMode] = useState("upload"); // "upload" or "edit"
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannel();
  }, []);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/channels/mine");
      setChannel(data);
    } catch (error) {
      console.error("Failed to fetch channel:", error);
      setChannel(null);
      navigate("/create-channel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }
    
    try {
      await API.delete(`/videos/${videoId}`);
      fetchChannel();
      alert("Video deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormMode("edit");
    setShowVideoForm(true);
  };

  const handleCloseForm = () => {
    setShowVideoForm(false);
    setFormMode("upload");
    setEditingVideo(null);
  };

  const handleVideoSaved = (updatedVideo) => {
    // Refresh the channel data
    fetchChannel();
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>;
  if (!channel) return <div style={{ textAlign: "center", padding: "50px" }}>Channel not found</div>;

  const isOwner = user && String(user._id) === String(channel.owner);

  return (
    <div className="channel-page" style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      {/* Banner + Logo */}
      <div style={{ position: "relative", width: "100%", height: "200px" }}>
        {channel.channelBanner && (
          <img
            src={channel.channelBanner}
            alt="Channel Banner"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              position: "relative",
              zIndex: 1,
            }}
          />
        )}
        {channel.channelLogo && (
          <img
            src={channel.channelLogo}
            alt="Channel Logo"
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "30px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "4px solid white",
              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              backgroundColor: "#fff",
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* Channel Name & Description */}
      <div style={{ marginLeft: channel.channelLogo ? "170px" : "20px", marginTop: "70px" }}>
        <h1
          style={{
            fontWeight: "bold",
            fontSize: "2.5rem",
            color: "#222",
            letterSpacing: "1px",
          }}
        >
          {channel.channelName}
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>{channel.description}</p>
      </div>

      {/* Add Video Button */}
      {isOwner && (
        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <button
            onClick={() => {
              setFormMode("upload");
              setEditingVideo(null);
              setShowVideoForm(true);
            }}
            style={{
              padding: "12px 30px",
              backgroundColor: "#FF0000",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "25px",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              boxShadow: "0 2px 8px rgba(255,0,0,0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#cc0000";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#FF0000";
              e.target.style.transform = "translateY(0)";
            }}
          >
            + Add Video
          </button>
        </div>
      )}

      {/* Video Upload/Edit Form */}
      {showVideoForm && (
        <VideoUploadForm 
          mode={formMode}
          videoData={editingVideo}
          videoId={editingVideo?._id}
          onClose={handleCloseForm}
          onVideoAdded={handleVideoSaved}
        />
      )}

      {/* Video Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: "25px",
          marginTop: "40px",
          padding: "0 20px",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        {channel.videos && channel.videos.length > 0 ? (
          channel.videos.map((video) => (
            <div
              key={video._id}
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                background: "#fff",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <Link to={`/video/${video._id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <img
                  src={video.thumbnailUrl || "https://via.placeholder.com/300x170?text=No+Thumbnail"}
                  alt={video.title}
                  style={{ 
                    width: "100%", 
                    height: "170px", 
                    objectFit: "cover",
                    display: "block"
                  }}
                />
                <div style={{ padding: "16px" }}>
                  <h3 style={{ 
                    margin: "0 0 8px 0", 
                    fontSize: "1.1rem", 
                    fontWeight: "bold", 
                    color: "#030303",
                    lineHeight: "1.3"
                  }}>
                    {video.title}
                  </h3>
                  <p style={{ 
                    margin: "0 0 6px 0", 
                    color: "#606060", 
                    fontSize: "0.9rem",
                    backgroundColor: "#f0f0f0",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    display: "inline-block",
                    maxWidth: "fit-content"
                  }}>
                    {video.category || "All"}
                  </p>
                  <p style={{ 
                    margin: 0, 
                    color: "#888", 
                    fontSize: "0.85rem" 
                  }}>
                    {video.likes || 0} likes • {video.views || 0} views
                  </p>
                </div>
              </Link>
              
              {/* Action Buttons - Only for Owner */}
              {isOwner && (
                <div style={{ 
                  display: "flex", 
                  gap: "0", 
                  borderTop: "1px solid #eee" 
                }}>
                  <button
                    onClick={() => handleEdit(video)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "none",
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#1565c0"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#1976d2"}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(video._id)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "none",
                      backgroundColor: "#d32f2f",
                      color: "#fff",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#b71c1c"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#d32f2f"}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            padding: "60px 20px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            {isOwner ? (
              <>
                <div style={{ 
                  fontSize: "48px", 
                  color: "#ccc", 
                  marginBottom: "20px" 
                }}>
                  🎥
                </div>
                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "1.5rem" }}>
                  No videos uploaded yet
                </h3>
                <p style={{ margin: "0 0 30px 0", color: "#666" }}>
                  Get started by uploading your first video above!
                </p>
                <button
                  onClick={() => setShowVideoForm(true)}
                  style={{
                    backgroundColor: "#FF0000",
                    color: "#fff",
                    padding: "12px 30px",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem"
                  }}
                >
                  Upload Your First Video
                </button>
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                  No videos available
                </h3>
                <p style={{ margin: 0, color: "#666" }}>
                  This channel hasn't uploaded any videos yet.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add some bottom spacing */}
      <div style={{ height: "50px" }}></div>
    </div>
  );
}