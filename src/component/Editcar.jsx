
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCarSide,
  FaImage,
  FaLink,
  FaTimes,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";

const API_URL = "https://carr-backend.onrender.com";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/30";

const labelClass =
  "mb-2 block text-sm font-medium text-gray-300";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") return "";

  const value = image.trim();

  if (/^https?:\/\//i.test(value)) return value;

  if (/^\/?uploads\//i.test(value)) {
    return `${API_URL}/${value.replace(/^\/+/, "")}`;
  }

  return `${API_URL}/uploads/${value.replace(/^\/+/, "")}`;
};

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    carName: "",
    price: "",
    seats: "",
    fuel: "",
    mileage: "",
    category: "",
    transmission: "",
    description: "",
    year: "",
    color: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [originalImage, setOriginalImage] = useState("");
  const [imageUrlTouched, setImageUrlTouched] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";

    const fetchCar = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/cars/${id}`);
        const car = response.data;

        setFormData({
          carName: car.make || car.model || "",
          price: car.dailyRate ?? "",
          seats: car.seats ?? "",
          fuel: car.fuelType || "",
          mileage: car.mileage ?? "",
          category: car.category || "",
          transmission: car.transmission || "",
          description: car.description || "",
          year: car.year ?? "",
          color: car.color || "",
        });

        const savedImage = car.image || "";
        setOriginalImage(savedImage);

        if (/^https?:\/\//i.test(savedImage)) {
          setImageUrl(savedImage);
          setPreview(savedImage);
        } else {
          setImageUrl("");
          setPreview(getImageUrl(savedImage));
        }
      } catch (err) {
        console.error(
          "FETCH CAR ERROR:",
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message || "Failed to fetch car details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCar();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleImageUrlChange = (e) => {
    const value = e.target.value;

    setImageUrl(value);
    setImageUrlTouched(true);
    setImage(null);
    setPreview(value.trim());
    setImageFailed(false);
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    setImage(file);
    setImageUrl("");
    setImageUrlTouched(false);
    setPreview(URL.createObjectURL(file));
    setImageFailed(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.carName.trim()) {
      setError("Please enter the car name.");
      return;
    }

    if (!Number.isFinite(Number(formData.price)) || Number(formData.price) <= 0) {
      setError("Daily price must be greater than zero.");
      return;
    }

    const trimmedImageUrl = imageUrl.trim();

    if (
      imageUrlTouched &&
      trimmedImageUrl &&
      !/^https?:\/\/\S+$/i.test(trimmedImageUrl)
    ) {
      setError("Please enter a valid image URL starting with http:// or https://.");
      return;
    }

    if (imageUrlTouched && trimmedImageUrl && imageFailed) {
      setError("The image URL could not be loaded. Please check the link.");
      return;
    }

    const data = new FormData();

    data.append("make", formData.carName.trim());
    data.append("model", formData.carName.trim());
    data.append("dailyRate", String(formData.price));
    data.append("seats", String(formData.seats));
    data.append("fuelType", formData.fuel);
    data.append("mileage", String(formData.mileage || 0));
    data.append("category", formData.category);
    data.append("transmission", formData.transmission);
    data.append("description", formData.description.trim());
    data.append("year", String(formData.year || ""));
    data.append("color", formData.color.trim());

    if (image) {
      data.append("image", image);
    } else if (imageUrlTouched) {
      // An empty URL explicitly clears the saved image.
      data.append("image", trimmedImageUrl);
    }
    // If image was not changed, omit it to preserve the existing database value.

    try {
      setSaving(true);

      await axios.put(`${API_URL}/api/cars/${id}`, data);

      window.alert("Car updated successfully!");
      navigate("/manage-car");
    } catch (err) {
      console.error(
        "UPDATE CAR ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message || "Failed to update car. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl("");
    setImageUrlTouched(true);
    setPreview("");
    setImageFailed(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-56 rounded bg-[#222]" />
          <div className="mt-6 h-96 rounded-2xl bg-[#111]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] px-3 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/manage-car")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#d7b77d]"
        >
          <FaArrowLeft />
          Back to Manage Cars
        </button>

        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Vehicle Management
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Edit <span className="text-[#c9a96e]">Car</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Update vehicle details or replace its image.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/30"
        >
          <div className="border-b border-white/10 px-5 py-5 sm:px-8">
            <h2 className="font-semibold">Vehicle Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_320px]">
            <div className="grid content-start grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Car Name *</label>
                <input
                  className={inputClass}
                  type="text"
                  name="carName"
                  value={formData.carName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Daily Price ($) *</label>
                <input
                  className={inputClass}
                  type="number"
                  name="price"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Seating Capacity</label>
                <select
                  className={inputClass}
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                >
                  <option value="">Select seats</option>
                  <option value="2">2 Seats</option>
                  <option value="5">5 Seats</option>
                  <option value="7">7 Seats</option>
                  <option value="8">8 Seats</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Fuel Type</label>
                <select
                  className={inputClass}
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleChange}
                >
                  <option value="">Select fuel</option>
                  <option value="Gasoline">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Mileage (KM/L)</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelClass}>Transmission</label>
                <select
                  className={inputClass}
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                >
                  <option value="">Select transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Manufacturing Year</label>
                <input
                  className={inputClass}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Car Color</label>
                <input
                  className={inputClass}
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Pearl White"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a short description about the car..."
                />
              </div>
            </div>

            <aside>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#c9a96e]">
                Vehicle Image
              </h3>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
                {preview && !imageFailed ? (
                  <img
                    src={preview}
                    alt="Car preview"
                    className="h-52 w-full object-cover"
                    onError={() => setImageFailed(true)}
                    onLoad={() => setImageFailed(false)}
                  />
                ) : (
                  <div className="flex h-52 flex-col items-center justify-center px-4 text-center">
                    <FaImage size={32} className="mb-3 text-[#c9a96e]" />
                    <p className="text-sm text-gray-300">
                      {preview ? "Image could not be loaded" : "No image preview"}
                    </p>
                    {originalImage && !imageUrlTouched && (
                      <p className="mt-2 text-xs text-gray-500">
                        The saved image may be unavailable.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <label className={labelClass}>
                  <FaLink className="mr-2 inline text-[#c9a96e]" />
                  Image URL
                </label>
                <input
                  className={inputClass}
                  type="url"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/car.jpg"
                />
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Paste a direct image link. Leave it unchanged if you want to
                  keep the existing image.
                </p>
              </div>

              <div className="my-4 text-center text-xs text-gray-500">
                OR UPLOAD A FILE
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c9a96e]/30 px-4 py-3 text-sm font-semibold text-[#d7b77d] transition hover:bg-[#c9a96e]/10">
                <FaImage />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400 transition hover:border-red-500/40 hover:text-red-400"
              >
                <FaTimes />
                Remove Image
              </button>
            </aside>
          </div>

          {error && (
            <div className="mx-5 mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 sm:mx-8">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0d0d0d] px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={() => navigate("/manage-car")}
              disabled={saving}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300 transition hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#d7b77d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCar;
