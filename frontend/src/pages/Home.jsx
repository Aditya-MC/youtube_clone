import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VideoGrid from "../components/VideoGrid";
import api from "../api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState("All"); // Additional filter example
  const [loading, setLoading] = useState(false);
  const q = useQuery().get("q") || "";

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category !== "All") params.category = category;
      if (filter !== "All") params.filter = filter; // use additional filter in API call if needed
      const res = await api.get("/videos", { params });
      setVideos(res.data);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [q, category, filter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 fixed top-0 left-0 h-full bg-white shadow-md border-r border-gray-200 flex flex-col">
        <Sidebar onSelectCategory={setCategory} selectedCategory={category} />
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg">Filter Options</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All</option>
            <option value="Recent">Recent</option>
            <option value="Popular">Popular</option>
            <option value="Trending">Trending</option>
          </select>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-6">
        {loading ? (
          <div className="text-center text-gray-600 font-medium">Loading videos...</div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
}
