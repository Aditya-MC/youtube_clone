import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoPage from "./pages/VideoPage";
import ChannelPage from "./pages/ChannelPage";
import Header from "./components/Header";
import CreateChannel from "./pages/CreateChannel";

export default function App() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-4 min-h-[calc(100vh-60px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/channel/:id" element={<ChannelPage />} />
          <Route path="/create-channel" element={<CreateChannel />} />
        </Routes>
      </div>
    </>
  );
}
