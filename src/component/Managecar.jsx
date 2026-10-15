
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaTachometerAlt,
  FaUserFriends,
  FaCogs,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaPalette,
  FaSyncAlt,
} from "react-icons/fa";

const API_URL = "https://carr-backend.onrender.com";

const ManageCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/cars`);
      const responseData = response.data?.data ?? response.data;

      if (!Array.isArray(responseData)) {
        throw new Error("Invalid cars response");
      }

      setCars(responseData);
    } catch (err) {
      console.error(
        "FETCH CARS ERROR:",
        err.response?.data || err.message
      );

      setError("Unable to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(cars.map((car) => car.category).filter(Boolean)),
    ];

    return ["All", ...uniqueCategories];
  }, [cars]);

  const filteredCars = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return cars.filter((car) => {
      const name = `${car.make || ""} ${car.model || ""}`.toLowerCase();

      const matchesSearch =
        name.includes(searchText) ||
        String(car.year || "").includes(searchText) ||
        String(car.category || "").toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || car.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [cars, search, category]);

  const handleDelete = async (carId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(carId);

      await axios.delete(`${API_URL}/api/cars/${carId}`);

      setCars((previousCars) =>
        previousCars.filter((car) => car._id !== carId)
      );
    } catch (err) {
      console.error(
        "DELETE CAR ERROR:",
        err.response?.data || err.message
      );

      window.alert(
        err.response?.data?.message || "Failed to delete the vehicle."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (carId) => {
    navigate(`/edit-car/${carId}`);
  };

  const getCarName = (car) => {
    if (car.make && car.model) {
      return car.make === car.model
        ? car.make
        : `${car.make} ${car.model}`;
    }

    return car.make || car.model || "Unnamed Vehicle";
  };

  // Supports absolute URLs, /uploads/file.png and filename-only values.
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") {
      return "";
    }

    const imagePath = image.trim();

    if (!imagePath) return "";

    // Do not modify an already complete URL.
    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    // Handle paths saved as uploads/file.png or /uploads/file.png.
    if (/^\/?uploads\//i.test(imagePath)) {
      return `${API_URL}/${imagePath.replace(/^\/+/, "")}`;
    }

    // Handle a filename saved without its uploads directory.
    return `${API_URL}/uploads/${imagePath.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] px-4 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-[#1b1b1b]" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-4"
              >
                <div className="h-48 rounded-xl bg-[#222222]" />
                <div className="mt-5 h-5 w-2/3 rounded bg-[#222222]" />
                <div className="mt-3 h-4 w-1/3 rounded bg-[#222222]" />
                <div className="mt-6 h-10 rounded-lg bg-[#222222]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] px-3 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Vehicle Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Manage Your <span className="text-[#c9a96e]">Fleet</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              View, update and manage all vehicles available in your rental
              fleet.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={fetchCars}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-[#c9a96e]/50 hover:text-[#c9a96e]"
            >
              <FaSyncAlt />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c9a96e] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#d7b77d]"
            >
              <FaPlus />
              Add Car
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Vehicles"
            value={cars.length}
            icon={<FaCar size={20} />}
          />

          <StatCard
            title="Categories"
            value={categories.length - 1}
            icon={<FaCogs size={20} />}
          />

          <StatCard
            title="Search Results"
            value={filteredCars.length}
            icon={<FaSearch size={20} />}
          />
        </div>

        {/* Search and category filter */}
        <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by car name, year or category..."
              className="w-full rounded-xl border border-white/10 bg-[#090909] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#c9a96e]"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-sm text-gray-300 outline-none focus:border-[#c9a96e] sm:min-w-44"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {/* API error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-300">{error}</p>

            <button
              type="button"
              onClick={fetchCars}
              className="w-fit rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Car listing */}
        {!error && filteredCars.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111111] px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a96e]/10 text-[#c9a96e]">
              <FaCar size={28} />
            </div>

            <h2 className="text-xl font-semibold">
              {cars.length === 0 ? "No Vehicles Added Yet" : "No Matching Cars"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {cars.length === 0
                ? "Your fleet is empty. Add your first vehicle to get started."
                : "Try changing your search text or selecting another category."}
            </p>

            {cars.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-6 rounded-xl bg-[#c9a96e] px-5 py-3 text-sm font-bold text-black hover:bg-[#d7b77d]"
              >
                Add Your First Car
              </button>
            )}
          </div>
        ) : (
          !error && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <article
                  key={car._id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/40 hover:shadow-xl hover:shadow-black/30"
                >
                  {/* Car image */}
                  <CarImage
                    image={car.image}
                    name={getCarName(car)}
                    category={car.category}
                    year={car.year}
                  />

                  {/* Car details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-bold text-white">
                          {getCarName(car)}
                        </h2>

                        <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <FaCalendarAlt className="text-[#c9a96e]" />
                          Model year: {car.year || "N/A"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold text-[#c9a96e]">
                          ${Number(car.dailyRate || 0).toLocaleString("en-US")}
                        </p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                    </div>

                    <div className="my-5 grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                      <Detail
                        icon={<FaUserFriends />}
                        label="Seats"
                        value={car.seats || "N/A"}
                      />

                      <Detail
                        icon={<FaGasPump />}
                        label="Fuel"
                        value={car.fuelType || "N/A"}
                      />

                      <Detail
                        icon={<FaTachometerAlt />}
                        label="Mileage"
                        value={car.mileage ? `${car.mileage} km/L` : "N/A"}
                      />

                      <Detail
                        icon={<FaCogs />}
                        label="Transmission"
                        value={car.transmission || "N/A"}
                      />

                      <Detail
                        icon={<FaPalette />}
                        label="Color"
                        value={car.color || "N/A"}
                      />
                    </div>

                    {car.description && (
                      <p className="mb-5 line-clamp-2 text-sm leading-6 text-gray-500">
                        {car.description}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(car._id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#c9a96e]/30 py-3 text-sm font-semibold text-[#d7b77d] transition hover:bg-[#c9a96e] hover:text-black"
                      >
                        <FaEdit />
                        Edit Car
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(car._id)}
                        disabled={deletingId === car._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaTrash />
                        {deletingId === car._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Image fallback is handled separately for every car.
const CarImage = ({ image, name, category, year }) => {
  const [failed, setFailed] = useState(false);

  const imageUrl = useMemo(() => {
    if (!image || typeof image !== "string") return "";

    const path = image.trim();

    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    if (/^\/?uploads\//i.test(path)) {
      return `${API_URL}/${path.replace(/^\/+/, "")}`;
    }

    return `${API_URL}/uploads/${path.replace(/^\/+/, "")}`;
  }, [image]);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <div className="relative h-52 overflow-hidden bg-[#1b1b1b]">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => {
            console.error("Car image failed to load:", imageUrl);
            setFailed(true);
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-600">
          <FaCar size={40} />
          <span className="text-sm">
            {imageUrl ? "Image unavailable" : "No image available"}
          </span>
        </div>
      )}

      <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/75 px-3 py-1.5 text-xs font-semibold text-[#e0c18b] backdrop-blur">
        {category || "Vehicle"}
      </div>

      {year && (
        <div className="absolute right-3 top-3 rounded-lg bg-black/75 px-3 py-1.5 text-xs text-white backdrop-blur">
          {year}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111111] p-5">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>

    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a96e]/10 text-[#c9a96e]">
      {icon}
    </div>
  </div>
);

const Detail = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-start gap-3">
    <span className="mt-0.5 shrink-0 text-[#c9a96e]">{icon}</span>

    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-200">
        {value}
      </p>
    </div>
  </div>
);

export default ManageCar;
