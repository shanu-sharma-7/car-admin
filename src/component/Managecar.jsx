import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCar } from "react-icons/fa";
import { FaGasPump, FaTachometerAlt, FaUserFriends, FaCogs } from "react-icons/fa";


const ManageCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cars");
        setCars(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch cars.");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/cars/${carId}`);
      setCars(cars.filter((car) => car._id !== carId));
      alert("Car deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete car.");
    }
  };

  const handleEdit = (carId) => {
    navigate(`/edit-car/${carId}`);
  };

  if (loading) return <p className="p-8 text-white">Loading cars...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8 bg-gray-900  text-white">
      <h2 className="text-4xl font-bold mb-3 text-center text-orange-300">Fleet Management</h2>
<p className="flex text-center justify-center text-gray-400 mb-6">Manage your entire fleet, Track booking and monitor vehical status in real time</p>

  <p  className=" text-gray-200 mb-6 text-2xl flex flex-col gap-2 border-1 border-gray-700 w-90 p-4 pl-6 bg-gray-800 rounded-xl ml-5">
    Total Cars <span className="font-bold">{cars.length}</span>  <span className="absolute pl-70 pt-2 text-orange-600"><FaCar/></span>
  </p>
      {cars.length === 0 ? (
        <p className="text-center text-gray-400">No cars available.</p>
      ) : (
        <div className="grid grid-cols-3 gap-6 w-250">
          {cars.map((car) => (
            <div className="bg-gray-800 rounded-xl  p-4 flex flex-col"
              key={car._id}
              
            >
              {car.image ? (
                <img  className="w-full h-40 object-cover rounded-lg mb-3"
                  src={`http://localhost:5000/uploads/${car.image}`}
                  alt={car.make || "Car"}
                 
                />
              ) : (
                <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-lg mb-3">
                  No Image
                </div>
              )}
<div className="flex justify-between mr-5 ">
  <div>
             <h3 className="text-xl font-semibold">
  {car.make && car.model
    ? car.make === car.model
      ? car.make
      : `${car.make} ${car.model}`
    : car.make || car.model || "Unknown"}
</h3>

              <p className="text-gray-400">
                {car.year || "N/A"}
              </p>

              </div>
              <p className="mt-2 font-bold text-orange-400">
                ${car.dailyRate || 0}/day
              </p>

              </div>

            
               <div className="flex gap-30 mt-6 ">
                
                <p className="ml-4 flex gap-2"> <span className="mt-1 text-orange-400"><FaUserFriends/></span> {car.seats || "N/A"} </p>
                <p className="flex gap-2"> <span className="mt-1 text-orange-400"><FaGasPump/></span>{car.fuelType || "N/A"}</p>

                </div>

 <div className="flex gap-30 mt-3">
                
                <p className="ml-3 flex gap-2"> <span className="mt-1 text-orange-400"><FaTachometerAlt/></span>  {car.mileage || "N/A"}  </p>
                <p className="flex gap-2"> <span className="mt-1 text-orange-400"><FaCogs/></span> {car.transmission || "N/A"}</p>

                </div>


              <div className="flex gap-3 mt-4">
                <button className="bg-blue-600 px-6 py-1 rounded-lg hover:bg-blue-700"
                  onClick={() => handleEdit(car._id)}
                  
                >
                  Edit
                </button>
                <button  className="bg-red-600 px-4 ml-6 py-1 rounded-lg hover:bg-red-700"
                  onClick={() => handleDelete(car._id)}
                 
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCar;
