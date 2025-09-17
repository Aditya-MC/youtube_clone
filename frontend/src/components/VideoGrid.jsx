import React from "react";
import VideoCard from "./VideoCard";

export default function VideoGrid({ videos }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((v) => (
        <VideoCard key={v._id} video={v} />
      ))}
    </div>
  );
}
