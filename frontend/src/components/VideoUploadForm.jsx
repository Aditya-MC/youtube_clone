import { useState, useEffect } from "react";
import API from "../api/api";

const SUGGESTED_CATEGORIES = [
  "All",
  "Education", 
  "Comedy", 
  "Music",
  "Technology",
  "Gaming",
  "News"
];

function VideoUploadForm({ 
  onClose, 
  onVideoAdded, 
  mode = "upload",  // "upload" or "edit"
  videoData = null,  // For edit mode
  videoId = null    // For edit mode
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Initialize form with existing data for edit mode
  useEffect(() => {
    if (mode === "edit" && videoData) {
      setTitle(videoData.title || "");
      setDescription(videoData.description || "");
      setCategory(videoData.category || "");
    } else {
      // Reset form for upload mode
      setTitle("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setThumbnailFile(null);
    }
  }, [mode, videoData]);

  // Filter category suggestions
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);

    if (value.trim() === "") {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    } else {
      const filtered = SUGGESTED_CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(value.toLowerCase()) && cat !== "All"
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === "upload" && (!title.trim() || !videoFile)) {
      setError("Title and Video file are required.");
      return;
    }
    
    if (mode === "edit" && !title.trim()) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      
      // Always include text fields
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category || "All");

      // Handle files based on mode
      if (mode === "upload") {
        formData.append("videoFile", videoFile);
        if (thumbnailFile) formData.append("thumbnailFile", thumbnailFile);
      } else if (mode === "edit") {
        // Only append files if new ones are selected
        if (videoFile) formData.append("videoFile", videoFile);
        if (thumbnailFile) formData.append("thumbnailFile", thumbnailFile);
      }

      let response;
      if (mode === "upload") {
        response = await API.post("/videos", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await API.put(`/videos/${videoId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setLoading(false);
      
      // Reset form
      if (mode === "upload") {
        setTitle("");
        setDescription("");
        setCategory("");
        setVideoFile(null);
        setThumbnailFile(null);
      }

      onVideoAdded?.(response.data);
      onClose();
      
      // Show success message
      alert(mode === "upload" ? "Video uploaded successfully!" : "Video updated successfully!");
      
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 
                      (mode === "upload" ? "Failed to upload video" : "Failed to update video");
      setError(errorMsg);
      console.error(`${mode} failed:`, err);
    }
  };

  const isEditMode = mode === "edit";

  return (
    <div
      style={{
        margin: "20px auto",
        maxWidth: "500px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ margin: "0 0 20px 0", textAlign: "center" }}>
        {isEditMode ? "Edit Video" : "Upload Video"}
      </h2>
      
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          backgroundColor: "#ffebee", 
          padding: "10px", 
          borderRadius: "4px", 
          marginBottom: "15px",
          borderLeft: "4px solid #f44336"
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder={isEditMode ? "Video Title *" : "Title *"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ 
              display: "block", 
              width: "100%", 
              padding: "12px", 
              border: "2px solid #ddd", 
              borderRadius: "6px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "15px" }}>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ 
              display: "block", 
              width: "100%", 
              padding: "12px", 
              border: "2px solid #ddd", 
              borderRadius: "6px",
              fontSize: "16px",
              resize: "vertical",
              minHeight: "80px",
              boxSizing: "border-box"
            }}
            rows="3"
          />
        </div>

        {/* Category Input with Suggestions */}
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Category (e.g., Education, Comedy, Music...)"
            value={category}
            onChange={handleCategoryChange}
            onFocus={() => {
              if (category === "") {
                setFilteredSuggestions(SUGGESTED_CATEGORIES.filter(cat => cat !== "All"));
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            style={{ 
              display: "block", 
              width: "100%", 
              padding: "12px", 
              border: "2px solid #ddd", 
              borderRadius: "6px",
              fontSize: "16px",
              boxSizing: "border-box"
            }}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                zIndex: 10,
                maxHeight: "150px",
                overflowY: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                marginTop: "2px"
              }}
            >
              {filteredSuggestions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  style={{
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#333",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video File Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "5px", 
            fontWeight: "500", 
            color: "#333" 
          }}>
            {isEditMode ? "New Video File (leave empty to keep current)" : "Video File *"}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            required={!isEditMode}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "2px dashed #ddd", 
              borderRadius: "6px",
              backgroundColor: "#fafafa"
            }}
          />
          {isEditMode && videoData?.videoUrl && !videoFile && (
            <p style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginTop: "5px" 
            }}>
              Current: {videoData.videoUrl.split('/').pop().substring(0, 20)}...
            </p>
          )}
        </div>
        
        {/* Thumbnail File Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "5px", 
            fontWeight: "500", 
            color: "#333" 
          }}>
            {isEditMode ? "New Thumbnail (leave empty to keep current)" : "Thumbnail (optional)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "2px dashed #ddd", 
              borderRadius: "6px",
              backgroundColor: "#fafafa"
            }}
          />
          {isEditMode && videoData?.thumbnailUrl && !thumbnailFile && (
            <p style={{ 
              fontSize: "12px", 
              color: "#666", 
              marginTop: "5px" 
            }}>
              Current thumbnail in use
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ 
              padding: "12px 24px",
              backgroundColor: "#f5f5f5",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              flex: 1,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e0e0e0";
              e.target.style.color = "#333";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
              e.target.style.color = "#666";
            }}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              backgroundColor: loading ? "#ccc" : "#FF0000",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              flex: 1,
              transition: "all 0.2s"
            }}
          >
            {loading ? "Processing..." : (isEditMode ? "Update Video" : "Upload Video")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VideoUploadForm;