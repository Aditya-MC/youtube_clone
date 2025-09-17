import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { getUser } from "../utils/auth";

export default function ChannelPage() {
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState(false);
  const [channelForm, setChannelForm] = useState({
    channelName: "",
    description: "",
    channelBanner: "",
  });
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const user = getUser();
  const nav = useNavigate();

  const fetchChannel = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/channels/${id}`);
      setChannel(res.data);
      setVideos(res.data.videos || []);
      setChannelForm({
        channelName: res.data.channelName || "",
        description: res.data.description || "",
        channelBanner: res.data.channelBanner || "",
      });
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, [id]);

  const deleteVideo = async (vidId) => {
    if (!window.confirm("Delete video?")) return;
    await api.delete(`/videos/${vidId}`);
    setVideos(videos.filter((v) => v._id !== vidId));
  };

  const uploadFile = async (file, endpoint, fieldName) => {
    if (!file) {
      alert(`Please select a ${fieldName === "videoFile" ? "video" : "thumbnail"} file`);
      return null;
    }
    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data[fieldName === "videoFile" ? "videoUrl" : "thumbnailUrl"];
    } catch {
      alert(`Failed to upload ${fieldName === "videoFile" ? "video" : "thumbnail"}`);
      return null;
    }
  };

  const addVideo = async () => {
    try {
      const videoUrl = await uploadFile(selectedVideoFile, "/videos/upload", "videoFile");
      if (!videoUrl) return;

      const thumbnailUrl = await uploadFile(selectedThumbnailFile, "/videos/upload-thumbnail", "thumbnailFile");
      if (!thumbnailUrl) return;

      const title = prompt("Video title?");
      if (!title) return alert("Title is required");

      const res = await api.post("/videos", {
        title,
        videoUrl,
        thumbnailUrl,
        channelId: id,
      });

      setVideos([res.data, ...videos]);
      setSelectedVideoFile(null);
      setSelectedThumbnailFile(null);
    } catch {
      alert("Failed to add video");
    }
  };

  const startEditChannel = () => setEditingChannel(true);

  const cancelEditChannel = () => {
    setEditingChannel(false);
    setChannelForm({
      channelName: channel.channelName,
      description: channel.description,
      channelBanner: channel.channelBanner,
    });
  };

  const saveChannel = async () => {
    if (!channelForm.channelName.trim()) {
      return alert("Channel name is required");
    }
    try {
      const res = await api.put(`/channels/${id}`, channelForm);
      setChannel(res.data);
      setEditingChannel(false);
    } catch {
      alert("Failed to update channel");
    }
  };

  const deleteChannel = async () => {
    if (!window.confirm("Delete this channel?")) return;
    try {
      await api.delete(`/channels/${id}`);
      nav("/");
    } catch {
      alert("Failed to delete channel");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  if (!channel) return <div className="p-4 text-center">Channel not found</div>;

  const isOwner = user && user.id === channel.owner;

  return (
    <div>
      <div className="bg-gray-200 p-6 rounded-lg">
        {!editingChannel ? (
          <>
            <h2 className="text-3xl font-bold">{channel.channelName}</h2>
            <p>{channel.description}</p>
            {isOwner && (
              <div className="mt-3 space-x-2">
                <button onClick={startEditChannel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Edit Channel
                </button>
                <button onClick={deleteChannel} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Delete Channel
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={channelForm.channelName}
              onChange={(e) => setChannelForm({ ...channelForm, channelName: e.target.value })}
              placeholder="Channel Name"
              className="border p-2 w-full rounded"
            />
            <textarea
              value={channelForm.description}
              onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
              placeholder="Description"
              className="border p-2 w-full rounded"
              rows={3}
            />
            <input
              type="text"
              value={channelForm.channelBanner}
              onChange={(e) => setChannelForm({ ...channelForm, channelBanner: e.target.value })}
              placeholder="Banner URL"
              className="border p-2 w-full rounded"
            />
            <div className="space-x-2">
              <button onClick={saveChannel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save
              </button>
              <button onClick={cancelEditChannel} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <>
          <label className="block mt-4">
            Select Video File:
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setSelectedVideoFile(e.target.files[0])}
              className="mt-2"
            />
          </label>
          <label className="block mt-4">
            Select Thumbnail Image:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedThumbnailFile(e.target.files[0])}
              className="mt-2"
            />
          </label>
          <button onClick={addVideo} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Video
          </button>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {videos.map((v) => (
          <div key={v._id} className="bg-white rounded shadow">
            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-40 object-cover rounded-t" />
            <div className="p-2">
              <h4 className="font-semibold truncate">{v.title}</h4>
              <p className="text-sm text-gray-600">{v.views} views</p>
              {isOwner && (
                <div className="flex gap-2 mt-2">
                  <button className="bg-green-500 text-white px-2 rounded" onClick={() => nav(`/video/${v._id}`)}>
                    Edit
                  </button>
                  <button className="bg-red-500 text-white px-2 rounded" onClick={() => deleteVideo(v._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
