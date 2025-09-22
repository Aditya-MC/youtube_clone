import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function CreateChannel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    channelName: "",
    description: "",
  });
  const [channelBannerFile, setChannelBannerFile] = useState(null);
  const [channelLogoFile, setChannelLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [channelExists, setChannelExists] = useState(false);

  useEffect(() => {
    // Check if channel exists to disable creation
    async function checkChannel() {
      try {
        await API.get("/channels/mine");
        setChannelExists(true);
      } catch {
        setChannelExists(false);
      }
    }
    checkChannel();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBannerChange = (e) => {
    setChannelBannerFile(e.target.files[0]);
  };

  const handleLogoChange = (e) => {
    setChannelLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (channelExists) {
      setError("User already has a channel.");
      return;
    }
    if (!formData.channelName.trim()) {
      setError("Channel name is required.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("channelName", formData.channelName);
      data.append("description", formData.description);
      if (channelBannerFile) data.append("channelBanner", channelBannerFile);
      if (channelLogoFile) data.append("channelLogo", channelLogoFile);

      await API.post("/channels", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      navigate("/my-channel");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Create channel failed");
    }
  };

  if (channelExists) {
    return <div>You have already created a channel.</div>;
  }

  return (
    <div className="auth-container">
      <h2>Create Channel</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="channelName"
          placeholder="Channel Name"
          value={formData.channelName}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <label>
          Channel Banner:
          <input type="file" accept="image/*" onChange={handleBannerChange} />
        </label>
        <label>
          Channel Logo:
          <input type="file" accept="image/*" onChange={handleLogoChange} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Channel"}
        </button>
      </form>
    </div>
  );
}
