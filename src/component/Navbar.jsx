import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCar,
  FaPlus,
  FaBook,
  FaEnvelope,
  FaSignOutAlt,
} from "react-icons/fa";

import logocar from "../assets/logocar.png";

const navItems = [
  { name: "Add Car", path: "/", icon: FaPlus },
  { name: "Manage Car", path: "/manage-car", icon: FaCar },
  { name: "Booking", path: "/booking", icon: FaBook },
  {
    name: "Contact Messages",
    path: "/contact-messages",
    icon: FaEnvelope,
  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="border-b border-[#c9a96e]/20 bg-[#090909] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex w-fit items-center gap-3">
          <img
            src={logocar}
            alt="CarArea logo"
            className="h-12 w-20 object-contain"
          />

          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-[#c9a96e]">
              CARAREA
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.25em] text-gray-500">
              ADMIN PANEL
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map(({ name, path, icon: Icon }) => {
            const isActive =
              location.pathname === path ||
              (path !== "/" && location.pathname.startsWith(`${path}/`));

            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 sm:px-4 ${
                  isActive
                    ? "bg-[#c9a96e] text-black"
                    : "text-gray-300 hover:bg-white/5 hover:text-[#d7b77d]"
                }`}
              >
                <Icon size={15} />
                <span>{name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 sm:px-4"
          >
            <FaSignOutAlt size={15} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;