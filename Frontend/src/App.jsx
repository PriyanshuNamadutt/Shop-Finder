import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ListShop from "./pages/ListShop";
import ShopDetail from "./pages/ShopDetail";
import Search from "./pages/Search";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/list-shop"
          element={
            <PrivateRoute>
              <ListShop />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<div className="page container state-box"><h3>404</h3><p>Page not found.</p></div>} />
      </Routes>
      <footer className="footer">
        <div className="container">
          Built with OpenStreetMap &amp; Leaflet · <a href="/about">About this project</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
