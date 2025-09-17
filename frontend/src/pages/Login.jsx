import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { saveAuth } from "../utils/auth";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { emailOrUsername, password });
      saveAuth(res.data);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Login</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          className="border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 px-4 py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-shadow shadow-md hover:shadow-lg"
        >
          Login
        </button>
        {error && <p className="text-red-600 text-center font-medium">{error}</p>}
      </form>
      <p className="mt-6 text-center text-gray-600">
        No account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
