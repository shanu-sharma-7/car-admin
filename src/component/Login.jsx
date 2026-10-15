import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaCar, FaEnvelope, FaLock } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://carr-backend.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/admin-auth/login`, {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, admin } = response.data;

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(admin));

      navigate("/", { replace: true });
      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login nahi hua. Backend connection check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090909] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#c9a96e]/25 bg-[#111111] p-6 shadow-2xl sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/10">
            <FaCar className="text-3xl text-[#c9a96e]" />
          </div>

          <h1 className="text-2xl font-bold tracking-[0.18em] text-[#c9a96e]">
            CARAREA
          </h1>
          <p className="mt-2 text-sm text-gray-400">Admin Panel Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email address
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <FaEnvelope className="text-[#c9a96e]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="username"
                required
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <FaLock className="text-[#c9a96e]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c9a96e] py-3.5 font-semibold text-black transition hover:bg-[#d7b77d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login to Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Need to create the first admin?{" "}
          <Link
            to="/register"
            className="font-medium text-[#d7b77d] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;