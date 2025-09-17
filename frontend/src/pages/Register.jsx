import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      nav("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Register</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          className="border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none 
            focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none 
            focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none 
            focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold 
            transition-shadow shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <p className="text-red-600 text-center font-medium">{error}</p>}
      </form>
    </div>
  );
}
