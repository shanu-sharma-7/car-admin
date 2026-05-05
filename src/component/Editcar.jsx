import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
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
  const [loading, setLoading] = useState(true);

  // Fetch car details
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cars/${id}`);
        const car = res.data;
        setFormData({
          carName: car.make || "",
          price: car.dailyRate || "",
          seats: car.seats || "",
          fuel: car.fuelType || "",
          mileage: car.mileage || "",
          category: car.category || "",
          transmission: car.transmission || "",
          description: car.description || "",
          year: car.year || "",
          color: car.color || "",
        });
        if (car.image) setPreview(`http://localhost:5000/uploads/${car.image}`);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch car details");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

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
      await axios.put(`http://localhost:5000/api/cars/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Car updated successfully!");
      navigate("/"); 
    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err.message);
      alert("Failed to update car!");
    }
  };

  if (loading) return <p className="p-8 text-white">Loading car details...</p>;

  return (
    <div className="flex justify-center items-center text-white">
      <form
        onSubmit={handleSubmit}
        className="w-3/4 bg-gray-800 p-8 rounded-xl mt-5"
      >
        <h2 className="text-center text-xl font-bold mb-6 text-gray-500">
          Edit Car Details
        </h2>

        <div className="flex justify-evenly gap-8">
          <div className="flex flex-col gap-5 w-100">
            <div>
              <label className="text-lg mb-1 flex text-gray-300">Car Name</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="text"
                name="carName"
                value={formData.carName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Daily Price ($)</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Seats</label>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
              >
                <option value="">Select seats</option>
                <option value="2">2 seats</option>
                <option value="5">5 seats</option>
                <option value="7">7 seats</option>
              </select>
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Fuel Type</label>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                name="fuel"
                value={formData.fuel}
                onChange={handleChange}
              >
                <option value="">Select fuel</option>
                <option value="Gasoline">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="text-lg mb-1 flex text-gray-300">Mileage (MPG)</label>
              <input
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
              />
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
                    checked={formData.transmission === "Automatic"}
                    onChange={handleChange}
                  />
                  Automatic
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="transmission"
                    value="Manual"
                    checked={formData.transmission === "Manual"}
                    onChange={handleChange}
                    className="accent-orange-600"
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
                value={formData.year}
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
            className="bg-orange-600 w-50 text-lg font-bold hover:bg-orange-700 px-6 py-2 rounded-lg"
            type="submit"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCar;
