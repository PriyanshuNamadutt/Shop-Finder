import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={close}>
          <span className="brand-mark">📍</span>
          Local Shops Finder
        </NavLink>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
            Map
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
            Search
          </NavLink>
          {user && (
            <NavLink to="/list-shop" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
              List Your Shop
            </NavLink>
          )}
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
              My Shops
            </NavLink>
          )}
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
            About
          </NavLink>

          {user ? (
            <button className="nav-link" onClick={handleLogout} style={{ border: "none", cursor: "pointer" }}>
              Logout ({user.name.split(" ")[0]})
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={close}>
              Login / Register
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
