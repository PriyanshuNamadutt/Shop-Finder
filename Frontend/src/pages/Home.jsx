import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import MapView from "../components/MapView";

const CATEGORY_LABELS = {
  medicine: "💊 Medicine",
  fertilizer: "🌾 Fertilizer",
  grocery: "🛒 Grocery",
  general: "🏬 General Store",
  other: "🏷️ Other",
};

const Home = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await api.get("/shops");
        setShops(data);
      } catch (err) {
        setError("Could not load shops right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };
    fetchShops();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : shops[0]?.location?.coordinates
    ? [shops[0].location.coordinates[1], shops[0].location.coordinates[0]]
    : [28.6139, 77.209];

  return (
    <div className="page">
      <div className="container">
        <section className="hero">
          <div>
            <span className="hero-eyebrow">🗺️ Built on OpenStreetMap</span>
            <h1>Find the shop next door — before you drive across town.</h1>
            <p>
              Local Shops Finder maps every neighborhood store, medical shop, and fertilizer depot near you.
              Search by product, filter by category, and see exactly what's in stock, in real time.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary">
                🔍 Search shops
              </Link>
              <Link to="/list-shop" className="btn btn-amber">
                🏪 List your shop, free
              </Link>
            </div>
          </div>
          <div className="hero-map-frame">
            <MapView shops={shops.slice(0, 30)} center={mapCenter} zoom={userLocation ? 13 : 5} height="320px" userLocation={userLocation} />
          </div>
        </section>

        <section>
          <div className="section-head">
            <h2>All listed shops</h2>
            <span className="field-hint">{shops.length} shop{shops.length !== 1 ? "s" : ""} on the map</span>
          </div>

          {loading && (
            <div className="state-box">
              <span className="spinner" />
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          {!loading && !error && (
            <div className="card" style={{ padding: 8, marginBottom: 28 }}>
              <MapView shops={shops} center={mapCenter} zoom={userLocation ? 12 : 5} height="460px" userLocation={userLocation} />
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <div className="shop-grid">
              {shops.map((shop) => (
                <Link to={`/shop/${shop._id}`} key={shop._id} className="card shop-card">
                  <div className="shop-card-top">
                    <h3>{shop.name}</h3>
                    <span className="badge">{CATEGORY_LABELS[shop.category] || shop.category}</span>
                  </div>
                  <p className="shop-card-meta">👤 {shop.owner?.name}</p>
                  <p className="shop-card-meta">📞 {shop.contact}</p>
                  <p className="shop-card-meta">📦 {shop.products?.length || 0} products listed</p>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && shops.length === 0 && (
            <div className="state-box">
              <h3>No shops listed yet</h3>
              <p>Be the first to put your shop on the map!</p>
              <Link to="/list-shop" className="btn btn-primary" style={{ marginTop: 14 }}>
                List your shop
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
