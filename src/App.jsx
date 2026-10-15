import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Navbar from "./component/Navbar";
import Addcar from "./component/Addcar";
import Managecar from "./component/Managecar";
import EditCar from "./component/Editcar";
import Booking from "./component/Booking";

import Login from "./component/Login";
import Register from "./component/Register";
import ContactMessages from "./component/ContactMessages";

const isAdminLoggedIn = () => Boolean(localStorage.getItem("adminToken"));

function ProtectedRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  const loggedIn = isAdminLoggedIn();

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {loggedIn && <Navbar />}

      <main className={loggedIn ? "px-2 py-5 sm:px-4 lg:px-6" : ""}>
        <Routes>
          <Route
            path="/login"
            element={loggedIn ? <Navigate to="/" replace /> : <Login />}
          />

          <Route
            path="/register"
            element={loggedIn ? <Navigate to="/" replace /> : <Register />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Addcar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-car"
            element={
              <ProtectedRoute>
                <Managecar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-car/:id"
            element={
              <ProtectedRoute>
                <EditCar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contact-messages"
            element={
              <ProtectedRoute>
                <ContactMessages />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;