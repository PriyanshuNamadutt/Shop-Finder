import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const { data } = await api.get("/shops/mine");
        setShops(data);
      } catch (err) {
        setError("Failed to load your shops");
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <h2>My Shops</h2>
          <Link to="/list-shop" className="btn btn-amber">+ List another shop</Link>
        </div>

        {loading && <div className="state-box"><span className="spinner" /></div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && shops.length === 0 && (
          <div className="state-box">
            <h3>You haven't listed any shop yet</h3>
            <p>Get discovered by nearby customers in minutes.</p>
            <Link to="/list-shop" className="btn btn-primary" style={{ marginTop: 14 }}>List your shop</Link>
          </div>
        )}

        {!loading && shops.length > 0 && (
          <div className="shop-grid">
            {shops.map((shop) => (
              <div className="card shop-card" key={shop._id}>
                <div className="shop-card-top">
                  <h3>{shop.name}</h3>
                  <span className="badge">{shop.category}</span>
                </div>
                <p className="shop-card-meta">📞 {shop.contact}</p>
                <p className="shop-card-meta">📦 {shop.products?.length || 0} products</p>
                <Link to={`/shop/${shop._id}`} className="btn btn-outline btn-sm btn-block" style={{ marginTop: 10 }}>
                  Manage shop
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
