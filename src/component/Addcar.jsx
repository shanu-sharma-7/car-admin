import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Addcar = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
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
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("make", formData.carName);
    data.append("model", formData.carName);
    data.append("dailyRate", formData.price);
    data.append("seats", formData.seats);
    data.append("fuelType", formData.fuel);
    data.append("mileage", formData.mileage);
    data.append("category", formData.category);
    data.append("transmission", formData.transmission);
    data.append("description", formData.description);
    data.append("year", formData.year);
    data.append("color", formData.color);
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/cars", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Car added successfully!");
      navigate("/car"); 
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert("Error uploading car!");
    }
  };

  return (
    <div className="flex justify-center items-center text-white bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-3/4 bg-gray-800 p-8 rounded-xl mt-5"
      >
        <h2 className="text-center text-xl font-bold mb-6 text-gray-500">
          Share your vehicle with the world and start earning today.
        </h2>

        <div className="flex justify-evenly gap-8">
        
          <div className="flex flex-col gap-5 w-100">
            <div>
              <label className="text-lg mb-1 flex text-gray-300">Car Name</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="text"
                name="carName"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Daily Price ($)</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="number"
                name="price"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Seats</label>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                name="seats"
                onChange={handleChange}
                required
              >
                <option value="">Select seats</option>
                <option value="5">5 seats</option>
                <option value="7">7 seats</option>
                <option value="2">2 seats</option>
              </select>
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Fuel Type</label>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                name="fuel"
                onChange={handleChange}
                required
              >
                <option value="">Select fuel</option>
                <option value="Gasoline">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Mileage (KM/L)</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="number"
                name="mileage"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Category</label>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                name="category"
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Transmission</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    className="accent-orange-600"
                    type="radio"
                    name="transmission"
                    value="Automatic"
                    onChange={handleChange}
                  />
                  Automatic
                </label>
                <label className="flex items-center gap-2">
                  <input
                    className="accent-orange-600"
                    type="radio"
                    name="transmission"
                    value="Manual"
                    onChange={handleChange}
                  />
                  Manual
                </label>
              </div>
            </div>
          </div>

          
          <div className="space-y-4">
            <div>
              <label className="text-lg mb-1 flex text-gray-300">Year</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="number"
                name="year"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Car Image</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="file"
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  className="mt-3 rounded-lg shadow-md w-full h-48 object-cover"
                  src={preview}
                  alt="Preview"
                />
              )}
            </div>

            
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className="bg-orange-600 text-lg font-bold hover:bg-orange-700 px-6 py-2 rounded-lg"
            type="submit"
          >
            Add Car
          </button>
        </div>
      </form>
    </div>
  );
};

export default Addcar;
