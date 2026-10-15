
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCarSide,
  FaImage,
  FaGasPump,
  FaUsers,
  FaCalendarAlt,
  FaPalette,
  FaTachometerAlt,
  FaCog,
  FaMoneyBillWave,
  FaPlus,
  FaTimes,
  FaLink,
} from "react-icons/fa";

const API_URL = "https://carr-backend.onrender.com";

const initialFormData = {
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
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/30";

const labelClass =
  "mb-2 flex items-center gap-2 text-sm font-medium text-gray-300";

const Addcar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
    setPreview(URL.createObjectURL(file));
    setImageFailed(false);
    setError("");
  };

  const handleImageUrlChange = (e) => {
    const value = e.target.value;

    setImageUrl(value);
    setImage(null);
    setPreview("");
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

    if (
      formData.year &&
      (Number(formData.year) < 1900 ||
        Number(formData.year) > new Date().getFullYear() + 1)
    ) {
      setError("Please enter a valid manufacturing year.");
      return;
    }

    const trimmedImageUrl = imageUrl.trim();

    if (
      trimmedImageUrl &&
      !/^https?:\/\/\S+$/i.test(trimmedImageUrl)
    ) {
      setError("Please enter a valid image URL starting with http:// or https://.");
      return;
    }

    if (trimmedImageUrl && imageFailed) {
      setError("The image URL could not be loaded. Please check the link first.");
      return;
    }

    if (!image && !trimmedImageUrl) {
      setError("Please upload a car image or enter an image URL.");
      return;
    }

    const data = new FormData();

    data.append("make", formData.carName.trim());
    data.append("model", formData.carName.trim());
    data.append("dailyRate", formData.price);
    data.append("seats", formData.seats);
    data.append("fuelType", formData.fuel);
    data.append("mileage", formData.mileage || "0");
    data.append("category", formData.category);
    data.append("transmission", formData.transmission);
    data.append("description", formData.description.trim());
    data.append("year", formData.year);
    data.append("color", formData.color.trim());

    // A selected file takes priority over the URL.
    if (image) {
      data.append("image", image);
    } else {
      data.append("image", trimmedImageUrl);
    }

    try {
      setLoading(true);

      await axios.post(`${API_URL}/api/cars`, data);

      window.alert("Car added successfully!");
      navigate("/manage-car");
    } catch (err) {
      console.error("ADD CAR ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          "Unable to add the car. Please check your server and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setImage(null);
    setImageUrl("");
    setPreview("");
    setImageFailed(false);
    setError("");
  };

  const displayedImage = preview || imageUrl.trim();

  return (
    <div className="min-h-screen bg-[#090909] px-3 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Vehicle Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Add New <span className="text-[#c9a96e]">Car</span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              Add a vehicle to your fleet by entering its details and choosing
              an image.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-[#c9a96e]/20 bg-[#111111] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a96e]/10 text-[#c9a96e]">
              <FaCarSide size={21} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Fleet Management</p>
              <p className="text-sm font-semibold">New Vehicle</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-black/30">
            <div className="border-b border-white/10 px-5 py-5 sm:px-8">
              <h2 className="text-lg font-semibold">Vehicle Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Fields marked with * are required.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_300px]">
              <div className="space-y-7">
                <section>
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#c9a96e]">
                    <FaCarSide />
                    Basic Details
                  </h3>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        <FaCarSide className="text-[#c9a96e]" />
                        Car Name *
                      </label>
                      <input
                        className={inputClass}
                        type="text"
                        name="carName"
                        placeholder="e.g. Toyota Fortuner"
                        value={formData.carName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaMoneyBillWave className="text-[#c9a96e]" />
                        Daily Price ($) *
                      </label>
                      <input
                        className={inputClass}
                        type="number"
                        name="price"
                        placeholder="Enter daily rental price"
                        min="1"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaUsers className="text-[#c9a96e]" />
                        Seating Capacity *
                      </label>
                      <select
                        className={inputClass}
                        name="seats"
                        value={formData.seats}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select seats</option>
                        <option value="2">2 Seats</option>
                        <option value="5">5 Seats</option>
                        <option value="7">7 Seats</option>
                        <option value="8">8 Seats</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaGasPump className="text-[#c9a96e]" />
                        Fuel Type *
                      </label>
                      <select
                        className={inputClass}
                        name="fuel"
                        value={formData.fuel}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select fuel type</option>
                        <option value="Gasoline">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaTachometerAlt className="text-[#c9a96e]" />
                        Mileage (KM/L)
                      </label>
                      <input
                        className={inputClass}
                        type="number"
                        name="mileage"
                        placeholder="e.g. 15"
                        min="0"
                        value={formData.mileage}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaCog className="text-[#c9a96e]" />
                        Transmission *
                      </label>
                      <select
                        className={inputClass}
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select transmission</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        <FaCarSide className="text-[#c9a96e]" />
                        Category *
                      </label>
                      <select
                        className={inputClass}
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
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
                      <label className={labelClass}>
                        <FaCalendarAlt className="text-[#c9a96e]" />
                        Manufacturing Year
                      </label>
                      <input
                        className={inputClass}
                        type="number"
                        name="year"
                        placeholder="e.g. 2024"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        <FaPalette className="text-[#c9a96e]" />
                        Car Color
                      </label>
                      <input
                        className={inputClass}
                        type="text"
                        name="color"
                        placeholder="e.g. Pearl White"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Description</label>
                      <textarea
                        className={`${inputClass} min-h-28 resize-y`}
                        name="description"
                        placeholder="Write a short description about the car..."
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                      />
                    </div>
                  </div>
                </section>

                <section className="lg:hidden">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#c9a96e]">
                    Vehicle Image
                  </h3>

                  <ImageUploader
                    imageUrl={imageUrl}
                    displayedImage={displayedImage}
                    imageFailed={imageFailed}
                    onImageUrlChange={handleImageUrlChange}
                    onImageError={() => setImageFailed(true)}
                    onImageLoad={() => setImageFailed(false)}
                    onImageChange={handleImageChange}
                    onRemove={() => {
                      setImage(null);
                      setImageUrl("");
                      setPreview("");
                      setImageFailed(false);
                    }}
                  />
                </section>
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#c9a96e]">
                    Vehicle Image
                  </h3>

                  <ImageUploader
                    imageUrl={imageUrl}
                    displayedImage={displayedImage}
                    imageFailed={imageFailed}
                    onImageUrlChange={handleImageUrlChange}
                    onImageError={() => setImageFailed(true)}
                    onImageLoad={() => setImageFailed(false)}
                    onImageChange={handleImageChange}
                    onRemove={() => {
                      setImage(null);
                      setImageUrl("");
                      setPreview("");
                      setImageFailed(false);
                    }}
                  />

                  <div className="mt-5 rounded-xl border border-white/5 bg-[#0b0b0b] p-4">
                    <p className="mb-2 text-sm font-medium text-gray-300">
                      Image guidelines
                    </p>
                    <ul className="space-y-2 text-xs leading-5 text-gray-500">
                      <li>• Use a clear vehicle photo.</li>
                      <li>• JPG, PNG or WebP recommended.</li>
                      <li>• Uploaded file limit: 5 MB.</li>
                      <li>• Use a direct image URL, not a Google search URL.</li>
                      <li>• Landscape images work best.</li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>

            {error && (
              <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 sm:mx-8">
                <FaTimes className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0d0d0d] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:opacity-50"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#d7b77d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Adding Car...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Car to Fleet
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImageUploader = ({
  imageUrl,
  displayedImage,
  imageFailed,
  onImageUrlChange,
  onImageError,
  onImageLoad,
  onImageChange,
  onRemove,
}) => (
  <div className="space-y-4">
    <div className="relative min-h-44 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
      {displayedImage && !imageFailed ? (
        <img
          src={displayedImage}
          alt="Car preview"
          className="h-52 w-full object-cover"
          onError={onImageError}
          onLoad={onImageLoad}
        />
      ) : (
        <div className="flex min-h-44 flex-col items-center justify-center px-4 py-8 text-center">
          <FaImage size={30} className="mb-3 text-[#c9a96e]" />
          <p className="text-sm font-semibold text-gray-200">
            {displayedImage ? "Image could not be loaded" : "Car image preview"}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Upload a photo or paste an image URL below.
          </p>
        </div>
      )}
    </div>

    <div>
      <label className={labelClass}>
        <FaLink className="text-[#c9a96e]" />
        Image URL
      </label>
      <input
        type="url"
        value={imageUrl}
        onChange={onImageUrlChange}
        placeholder="https://example.com/car-image.jpg"
        className={inputClass}
      />
      <p className="mt-2 text-xs leading-5 text-gray-500">
        Paste a direct link to the image. Some Google image links may expire or
        block external websites.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-gray-500">OR UPLOAD A FILE</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>

    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c9a96e]/30 px-4 py-3 text-sm font-semibold text-[#d7b77d] transition hover:bg-[#c9a96e]/10">
      <FaImage />
      Choose Image
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageChange}
      />
    </label>

    {(displayedImage || imageUrl) && (
      <button
        type="button"
        onClick={onRemove}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-gray-400 transition hover:border-red-500/40 hover:text-red-400"
      >
        <FaTimes />
        Remove Image
      </button>
    )}
  </div>
);

export default Addcar;
