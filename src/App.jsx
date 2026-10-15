
import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./component/Navbar";
import Addcar from "./component/Addcar";
import Managecar from "./component/Managecar";
import EditCar from "./component/Editcar";
import Booking from "./component/Booking";

function App() {
  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <Navbar />

      <main className="px-2 py-5 sm:px-4 lg:px-6">
        <Routes>
          <Route path="/" element={<Addcar />} />
          <Route path="/manage-car" element={<Managecar />} />
          <Route path="/edit-car/:id" element={<EditCar />} />
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
