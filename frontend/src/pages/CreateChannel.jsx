import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateChannel() {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [channelBanner, setChannelBanner] = useState("");
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!channelName.trim()) {
      setError("Channel name is required");
      return;
    }

    try {
      const res = await api.post("/channels", {
        channelName,
        description,
        channelBanner,
      });
      // Redirect to new channel page after create
      nav(`/channel/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create channel");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Channel</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
          rows={3}
        />
        <input
          type="text"
          placeholder="Banner Image URL"
          value={channelBanner}
          onChange={(e) => setChannelBanner(e.target.value)}
          className="border p-2 rounded"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Create Channel
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}
