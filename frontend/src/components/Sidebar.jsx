import React, { useState, useEffect } from "react";

const categories = [
  { name: "All", icon: "home" },
  { name: "Coding", icon: "code" },
  { name: "Music", icon: "music" },
  { name: "Sports", icon: "activity" },
  { name: "Gaming", icon: "controller" },
  { name: "News", icon: "file-text" },
  { name: "Tech", icon: "cpu" },
];

export default function Sidebar({ onSelectCategory }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  return (
    <aside
      className={`bg-white shadow h-screen p-4 transition-all ${
        open ? "w-56" : "w-16"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="mb-4 text-gray-600 hover:text-red-500"
      >
        ☰
      </button>

      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 hover:text-red-600 transition"
          >
            <i data-feather={cat.icon} className="w-5 h-5"></i>
            {open && <span>{cat.name}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}
