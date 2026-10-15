import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FaEnvelope,
  FaPhone,
  FaSyncAlt,
  FaTrash,
  FaUser,
  FaCar,
  FaSearch,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://carr-backend.onrender.com";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  },
});

const statusStyles = {
  new: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  read: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  contacted: "border-green-500/30 bg-green-500/10 text-green-300",
};

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/contacts`,
        getAuthConfig()
      );

      setMessages(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        window.location.href = "/login";
        return;
      }

      setError(
        err.response?.data?.message ||
          "Messages load nahi ho sake. Backend URL check karo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const updateStatus = async (id, status) => {
    setError("");
    setNotice("");

    try {
      await axios.patch(
        `${API_URL}/api/contacts/${id}/status`,
        { status },
        getAuthConfig()
      );

      setMessages((current) =>
        current.map((message) =>
          message._id === id ? { ...message, status } : message
        )
      );

      setNotice("Message status updated.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Status update nahi ho paya."
      );
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Kya tum is contact message ko permanently delete karna chahte ho?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await axios.delete(
        `${API_URL}/api/contacts/${id}`,
        getAuthConfig()
      );

      setMessages((current) =>
        current.filter((message) => message._id !== id)
      );

      setNotice("Contact message deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Message delete nahi ho paya."
      );
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = [
      message.name,
      message.email,
      message.phone,
      message.carName,
      message.message,
    ].some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch)
    );

    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const newCount = messages.filter((message) => message.status === "new").length;
  const readCount = messages.filter((message) => message.status === "read").length;
  const contactedCount = messages.filter(
    (message) => message.status === "contacted"
  ).length;

  return (
    <section className="mx-auto max-w-[1500px] space-y-6 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Customer enquiries
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Contact Messages
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Website ke contact form se aayi enquiries manage karo.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMessages}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-xl border border-[#c9a96e]/30 px-4 py-3 text-sm text-[#d7b77d] transition hover:bg-[#c9a96e]/10 disabled:opacity-50"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Messages", value: messages.length },
          { label: "New", value: newCount },
          { label: "Read", value: readCount },
          { label: "Contacted", value: contactedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#c9a96e]/15 bg-[#111111] p-5"
          >
            <p className="text-sm text-gray-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#c9a96e]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
          <FaSearch className="text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone or car..."
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-gray-200 outline-none focus:border-[#c9a96e]"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="contacted">Contacted</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4 text-sm text-[#e0c18b]">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 text-center text-gray-400">
          Loading contact messages...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 text-center">
          <FaEnvelope className="mx-auto text-3xl text-[#c9a96e]" />
          <h2 className="mt-4 text-lg font-semibold">No messages found</h2>
          <p className="mt-2 text-sm text-gray-400">
            {messages.length === 0
              ? "Customer enquiries will appear here after the contact form is connected to the backend."
              : "Search ya status filter change karke dekho."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredMessages.map((message) => (
            <article
              key={message._id}
              className="rounded-2xl border border-[#c9a96e]/15 bg-[#111111] p-5 transition hover:border-[#c9a96e]/35 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c9a96e]/10 text-[#c9a96e]">
                    <FaUser />
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold">
                      {message.name}
                    </h2>
                    <p className="mt-1 break-all text-sm text-gray-400">
                      {message.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                    statusStyles[message.status] || statusStyles.new
                  }`}
                >
                  {message.status || "new"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${message.phone}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl bg-black/60 p-3 text-sm text-gray-300 hover:text-[#d7b77d]"
                >
                  <FaPhone className="shrink-0 text-[#c9a96e]" />
                  <span className="break-all">{message.phone}</span>
                </a>

                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-black/60 p-3 text-sm text-gray-300">
                  <FaCar className="shrink-0 text-[#c9a96e]" />
                  <span className="break-words">
                    {message.carName || "No car specified"}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-wider text-[#c9a96e]">
                  Customer message
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
                  {message.message}
                </p>
              </div>

              <div className="mt-4 flex flex-col justify-between gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="mt-1 text-sm text-gray-300">
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label={`Status for ${message.name}`}
                    value={message.status || "new"}
                    onChange={(event) =>
                      updateStatus(message._id, event.target.value)
                    }
                    className="min-w-0 rounded-lg border border-white/10 bg-black px-3 py-2 text-xs text-gray-200 outline-none focus:border-[#c9a96e]"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="contacted">Contacted</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteMessage(message._id)}
                    className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ContactMessages;