import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import VideoCard from "../components/VideoCard";
import FilterButtons from "../components/FilterButtons";

const categories = [
  "All",
  "Education",
  "Comedy",
  "Music",
  "Technology",
  "Gaming",
  "News",
];

export default function Home({ searchQuery, isSidebarOpen, onToggleSidebar }) {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Reset selected category to "All" when searchQuery is cleared
  useEffect(() => {
    if (!searchQuery) {
      setSelectedCategory("All");
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedCategory]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const categoryParam = selectedCategory === "All" ? "" : selectedCategory;
      const searchParam = searchQuery ? encodeURIComponent(searchQuery) : "";

      const url = `/videos?search=${searchParam}&category=${encodeURIComponent(categoryParam)}`;
      const { data } = await API.get(url);

      setVideos(data || []);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError("Failed to load videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVideoClick = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) {
    return (
      <div
        className="home-content"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #FF0000",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#666", fontSize: "16px" }}>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-content">
      {/* Filter Buttons */}
      <div
        style={{
          marginBottom: "20px",
          padding: "0 20px",
          backgroundColor: "#fff",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <FilterButtons
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryClick}
        />

        {/* Category Info */}
        {selectedCategory !== "All" && (
          <p
            style={{
              margin: "10px 0 0 0",
              color: "#606060",
              fontSize: "14px",
              paddingLeft: "20px",
            }}
          >
            Showing {videos.length} {videos.length === 1 ? "video" : "videos"} in{" "}
            {selectedCategory}
          </p>
        )}
      </div>

      {/* Videos Grid */}
      <div
        className="video-grid"
        style={{
          padding: "0 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#ff4444",
              backgroundColor: "#fff5f5",
              borderRadius: "8px",
              margin: "20px 0",
              border: "1px solid #ffe6e6",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", color: "#cc0000" }}>
              Oops! Something went wrong
            </h3>
            <p style={{ margin: "0 0 20px 0" }}>{error}</p>
            <button
              onClick={fetchVideos}
              style={{
                backgroundColor: "#FF0000",
                color: "#fff",
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {videos.length === 0 && !loading && !error ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
              gridColumn: "1 / -1",
            }}
          >
            {searchQuery ? (
              <>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                  No videos found for "{searchQuery}"
                </h3>
                <p style={{ margin: "0 0 20px 0" }}>
                  Try searching for something else or browse by category
                </p>
              </>
            ) : selectedCategory !== "All" ? (
              <>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                  No videos in {selectedCategory} yet
                </h3>
                <p style={{ margin: "0 0 20px 0" }}>
                  Be the first to upload a {selectedCategory.toLowerCase()} video!
                </p>
              </>
            ) : (
              <>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                  No videos available
                </h3>
                <p style={{ margin: "0 0 20px 0" }}>
                  Start exploring by selecting a category above
                </p>
              </>
            )}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => setSelectedCategory("All")}
                style={{
                  backgroundColor: "#f2f2f2",
                  color: "#333",
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Show All Categories
              </button>
              {searchQuery && (
                <button
                  onClick={() => navigate("/my-channel")}
                  style={{
                    backgroundColor: "#FF0000",
                    color: "#fff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Upload Video
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onClick={() => handleVideoClick(video._id)}
              />
            ))}
          </>
        )}
      </div>

      {/* Add CSS animation for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
