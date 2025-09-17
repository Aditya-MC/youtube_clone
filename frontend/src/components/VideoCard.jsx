import React from "react";
import { Link } from "react-router-dom";

export default function VideoCard({ video }) {
  return (
    <Link to={`/video/${video._id}`} className="bg-white rounded-lg overflow-hidden shadow hover:scale-105 hover:shadow-lg transition">
      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
      <div className="p-3 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">
          {video.channelId?.channelName?.[0] || "C"}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-600">{video.channelId?.channelName}</p>
          <p className="text-sm text-gray-500">{video.views} views</p>
        </div>
      </div>
    </Link>
  );
}
