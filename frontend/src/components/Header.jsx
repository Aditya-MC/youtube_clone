import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

export default function Header() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const user = getUser();

  const onSearch = (e) => {
    e.preventDefault();
    nav(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <img
          src="https://www.svgrepo.com/show/13671/youtube.svg"
          alt="Logo"
          className="w-8 h-8 text-red-600"
        />
        <span className="font-bold text-xl">
          <span className="text-red-600">YouTube</span>{" "}
          <span className="text-black">Clone</span>
        </span>
      </Link>
      <form onSubmit={onSearch} className="flex flex-1 mx-4 max-w-xl">
        <input
          className="flex-1 border rounded-l px-3 py-1 focus:outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
        />
        <button className="bg-gray-100 hover:bg-gray-300 px-4 rounded-r border">
          🔍
        </button>
      </form>
      {user ? (
        <div className="flex items-center gap-3">
          {user.channels?.length > 0 ? (
            <Link
              to={`/channel/${user.channels[0]}`}
              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded"
            >
              My Channel
            </Link>
          ) : (
            <Link
              to="/create-channel"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Create Channel
            </Link>
          )}
          <span>{user.username}</span>
          <button
            onClick={() => {
              logout();
              nav("/");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
