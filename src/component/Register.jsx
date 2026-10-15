import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaCar, FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://carr-backend.onrender.com";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    registrationKey: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/admin-auth/register`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        registrationKey: formData.registrationKey,
      });

      setSuccess("Admin account created. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration nahi hui. Backend configuration check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090909] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#c9a96e]/25 bg-[#111111] p-6 shadow-2xl sm:p-9">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/10">
            <FaUserShield className="text-3xl text-[#c9a96e]" />
          </div>

          <h1 className="text-2xl font-bold tracking-[0.15em] text-[#c9a96e]">
            CREATE ADMIN
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Registration key is required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Full name
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <FaCar className="text-[#c9a96e]" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Admin name"
                autoComplete="name"
                required
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Email</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <FaEnvelope className="text-[#c9a96e]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600"
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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Private registration key
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <FaUserShield className="text-[#c9a96e]" />
              <input
                type="password"
                name="registrationKey"
                value={formData.registrationKey}
                onChange={handleChange}
                placeholder="Enter the private key"
                autoComplete="off"
                required
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c9a96e] py-3.5 font-semibold text-black transition hover:bg-[#d7b77d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-[#d7b77d] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;