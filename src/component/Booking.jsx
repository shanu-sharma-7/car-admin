
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaTrash,
  FaSyncAlt,
  FaCar,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const API_URL = "https://carr-backend.onrender.com/api/bookings";

const statusOptions = [
  "pending",
  "upcoming",
  "active",
  "completed",
  "cancelled",
];

const statusStyles = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  upcoming: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  completed: "border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#d7b77d]",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "₹0";

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

const getBookingId = (booking) =>
  booking?._id || booking?.id || "";

const getCustomerName = (booking) =>
  booking?.user?.name ||
  booking?.userId?.name ||
  booking?.customerName ||
  booking?.name ||
  "Guest";

const getCustomerEmail = (booking) =>
  booking?.user?.email ||
  booking?.userId?.email ||
  booking?.email ||
  "";

const getCarName = (booking) =>
  booking?.car?.carName ||
  booking?.carId?.carName ||
  booking?.carName ||
  booking?.car?.name ||
  booking?.carId?.name ||
  "Car details unavailable";

const getBookingStatus = (booking) =>
  String(booking?.status || "pending").toLowerCase();

const getBookingAmount = (booking) => {
  if (booking?.amount != null) {
    return Number(booking.amount) || 0;
  }

  if (booking?.totalAmount != null) {
    return Number(booking.totalAmount) || 0;
  }

  const dailyRate = Number(
    booking?.car?.dailyRate ?? booking?.carId?.dailyRate ?? 0
  );

  const start = new Date(
    booking?.startDate || booking?.pickupDate || booking?.fromDate
  );

  const end = new Date(
    booking?.endDate || booking?.returnDate || booking?.toDate
  );

  if (
    dailyRate > 0 &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime())
  ) {
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000)
    );

    return dailyRate * days;
  }

  return 0;
};

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 transition hover:border-[#c9a96e]/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{value}</h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex whitespace-nowrap items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[status] ||
        "border-white/10 bg-white/5 text-gray-300"
      }`}
    >
      {label}
    </span>
  );
}

function EmptyState({ search, status }) {
  const hasFilters = Boolean(search.trim() || status !== "all");

  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]">
        <FaCalendarAlt size={25} />
      </div>

      <h3 className="mt-5 text-xl font-semibold text-white">
        {hasFilters ? "No Matching Bookings" : "No Bookings Yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
        {hasFilters
          ? "Try changing your search or status filter to see other bookings."
          : "Abhi tak koi booking available nahi hai. Jab user booking karega, uski details yahan dikhenगी."}
      </p>
    </div>
  );
}

export default function Booking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // Bookings load karne ke liye login token ki zaroorat nahi.
  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setActionMessage("");

    try {
      const response = await axios.get(API_URL, {
        params: {
          limit: 100,
          page: 1,
        },
      });

      const responseData = response.data?.data ?? response.data;

      let list = [];

      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (Array.isArray(responseData?.bookings)) {
        list = responseData.bookings;
      } else if (Array.isArray(responseData?.results)) {
        list = responseData.results;
      }

      setBookings(list);
    } catch (err) {
      console.error(
        "FETCH BOOKINGS ERROR:",
        err.response?.data || err.message
      );

      setError(
        "Bookings load nahi ho pa rahi hain. Backend server aur API route check karo."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customer = getCustomerName(booking).toLowerCase();
      const email = getCustomerEmail(booking).toLowerCase();
      const car = getCarName(booking).toLowerCase();
      const id = getBookingId(booking).toLowerCase();
      const status = getBookingStatus(booking);

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        email.includes(query) ||
        car.includes(query) ||
        id.includes(query);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;

    return {
      total,
      pending: bookings.filter(
        (booking) => getBookingStatus(booking) === "pending"
      ).length,
      active: bookings.filter(
        (booking) =>
          ["active", "upcoming"].includes(getBookingStatus(booking))
      ).length,
      completed: bookings.filter(
        (booking) => getBookingStatus(booking) === "completed"
      ).length,
    };
  }, [bookings]);

  // Status update: token header nahi bheja ja raha.
  const handleStatusChange = async (booking, nextStatus) => {
    const id = getBookingId(booking);

    if (!id || nextStatus === getBookingStatus(booking)) return;

    const previousStatus = getBookingStatus(booking);

    setUpdatingId(id);
    setError("");
    setActionMessage("");

    setBookings((current) =>
      current.map((item) =>
        getBookingId(item) === id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await axios.patch(`${API_URL}/${id}/status`, {
        status: nextStatus,
      });

      setActionMessage("Booking status successfully update ho gaya.");
    } catch (err) {
      console.error(
        "UPDATE BOOKING ERROR:",
        err.response?.data || err.message
      );

      setBookings((current) =>
        current.map((item) =>
          getBookingId(item) === id
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setError(
        "Status update nahi hua. Backend route aur permissions check karo."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // Booking delete: token header nahi bheja ja raha.
  const handleDelete = async (booking) => {
    const id = getBookingId(booking);

    if (!id) {
      setError("Booking ID nahi mili, is booking ko delete nahi kar sakte.");
      return;
    }

    const customerName = getCustomerName(booking);

    const confirmed = window.confirm(
      `Kya aap ${customerName} ki booking delete karna chahte ho?`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setActionMessage("");

    try {
      await axios.delete(`${API_URL}/${id}`);

      setBookings((current) =>
        current.filter((item) => getBookingId(item) !== id)
      );

      setActionMessage("Booking successfully delete ho gayi.");
    } catch (err) {
      console.error(
        "DELETE BOOKING ERROR:",
        err.response?.data || err.message
      );

      setError(
        "Booking delete nahi hui. Backend route aur permissions check karo."
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-3 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
              CarArea Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Booking <span className="text-[#c9a96e]">Management</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              View and manage all customer bookings from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchBookings(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-4 py-3 text-sm font-semibold text-[#d7b77d] transition hover:bg-[#c9a96e] hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Bookings"}
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <FaExclamationCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <FaCheckCircle className="mt-0.5 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Bookings"
            value={stats.total}
            icon={FaCalendarAlt}
            description="All customer bookings"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={FaClock}
            description="Waiting for processing"
          />

          <StatCard
            title="Active / Upcoming"
            value={stats.active}
            icon={FaCar}
            description="Current and upcoming rentals"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={FaCheckCircle}
            description="Successfully completed rentals"
          />
        </section>

        {/* Search and filters */}
        <section className="mb-5 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, email, car or booking ID..."
                className="w-full rounded-xl border border-white/10 bg-[#090909] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#c9a96e]/60"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="booking-status"
                className="text-sm text-gray-400"
              >
                Filter status
              </label>

              <select
                id="booking-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a96e]/60"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Bookings table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Customer Bookings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </p>
            </div>

            <span className="text-xs font-medium text-[#c9a96e]">
              LIVE DATA FROM API
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState search={search} status={statusFilter} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    {[
                      "Customer",
                      "Car",
                      "Pickup Date",
                      "Return Date",
                      "Amount",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const id = getBookingId(booking);
                    const status = getBookingStatus(booking);
                    const customer = getCustomerName(booking);
                    const email = getCustomerEmail(booking);

                    const pickupDate =
                      booking?.startDate ||
                      booking?.pickupDate ||
                      booking?.fromDate;

                    const returnDate =
                      booking?.endDate ||
                      booking?.returnDate ||
                      booking?.toDate;

                    return (
                      <tr
                        key={id || `${customer}-${pickupDate}`}
                        className="border-b border-white/[0.06] transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-5">
                          <p className="font-semibold text-white">
                            {customer}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {email || "No email provided"}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-600">
                            ID: {id ? id.slice(-8) : "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]">
                              <FaCar />
                            </div>

                            <span className="max-w-[190px] text-sm text-gray-200">
                              {getCarName(booking)}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-300">
                          {formatDate(pickupDate)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-300">
                          {formatDate(returnDate)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-[#d7b77d]">
                          {formatAmount(getBookingAmount(booking))}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-col items-start gap-2">
                            <StatusBadge status={status} />

                            <select
                              aria-label={`Update status for ${customer}`}
                              value={status}
                              disabled={updatingId === id || !id}
                              onChange={(event) =>
                                handleStatusChange(booking, event.target.value)
                              }
                              className="max-w-[140px] rounded-lg border border-white/10 bg-[#090909] px-2 py-2 text-xs text-gray-300 outline-none focus:border-[#c9a96e]/60 disabled:opacity-50"
                            >
                              {!statusOptions.includes(status) && (
                                <option value={status}>{status}</option>
                              )}

                              {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option.charAt(0).toUpperCase() +
                                    option.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() => handleDelete(booking)}
                            disabled={deletingId === id || !id}
                            title="Delete booking"
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FaTrash />
                            {deletingId === id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredBookings.length > 0 && (
            <div className="border-t border-white/10 px-5 py-4 text-xs text-gray-500">
              Showing {filteredBookings.length} booking
              {filteredBookings.length === 1 ? "" : "s"}.
            </div>
          )}
        </section>

        <p className="mt-5 flex items-center gap-2 text-xs text-gray-600">
          <FaTimesCircle />
          Status changes and deletion require the corresponding backend routes
          to allow these requests.
        </p>
      </div>
    </main>
  );
}
