import React, { useState } from "react";
import api from "../api/axios";
import ShopResultRow from "../components/ShopResultRow";

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "general", label: "General Store" },
  { value: "medicine", label: "Medicine" },
  { value: "fertilizer", label: "Fertilizer" },
  { value: "grocery", label: "Grocery" },
  { value: "other", label: "Other" },
];

const Search = () => {
  const [tab, setTab] = useState("product"); // "product" | "location"

  // --- Product name search state ---
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productSearched, setProductSearched] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [productUserLocation, setProductUserLocation] = useState(null);

  // --- Location + category search state ---
  const [userLocation, setUserLocation] = useState(null);
  const [category, setCategory] = useState("all");
  const [radius, setRadius] = useState(10);
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearched, setLocationSearched] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const [detecting, setDetecting] = useState(false);

  const detectLocationFor = (setter, setErr) => {
    if (!navigator.geolocation) {
      setErr && setErr("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    setErr && setErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDetecting(false);
      },
      () => {
        setErr && setErr("Could not detect your location. Please allow location access and try again.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const runProductSearch = async (e) => {
    e?.preventDefault();
    if (!productQuery.trim()) return;
    setProductLoading(true);
    setProductSearched(true);
    try {
      const params = { name: productQuery.trim() };
      if (productUserLocation) {
        params.lat = productUserLocation.lat;
        params.lng = productUserLocation.lng;
      }
      const { data } = await api.get("/search/product", { params });
      setProductResults(data);
    } catch (err) {
      setProductResults([]);
    } finally {
      setProductLoading(false);
    }
  };

  const runLocationSearch = async () => {
    if (!userLocation) {
      setLocError("Please share your current location first.");
      return;
    }
    setLocError("");
    setLocationLoading(true);
    setLocationSearched(true);
    try {
      const { data } = await api.get("/search/location", {
        params: { lat: userLocation.lat, lng: userLocation.lng, category, radius },
      });
      setLocationResults(data);
    } catch (err) {
      setLocationResults([]);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-head">
          <h2>Search shops</h2>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === "product" ? "active" : ""}`} onClick={() => setTab("product")}>
            🔎 By product name
          </button>
          <button className={`tab-btn ${tab === "location" ? "active" : ""}`} onClick={() => setTab("location")}>
            📍 By location & category
          </button>
        </div>

        {tab === "product" && (
          <>
            <div className="card card-pad" style={{ marginBottom: 22 }}>
              <form onSubmit={runProductSearch} className="form-row" style={{ marginBottom: 0 }}>
                <div className="field" style={{ marginBottom: 0, flex: 3 }}>
                  <label>Product name</label>
                  <input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="e.g. rice, paracetamol, urea..."
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn btn-primary" type="submit" disabled={productLoading}>
                    {productLoading ? <span className="spinner" /> : "Search"}
                  </button>
                </div>
              </form>
              <p className="field-hint" style={{ marginTop: 10 }}>
                {productUserLocation
                  ? "✔ Location shared — results are sorted nearest-first."
                  : "Share your location to see distances, sorted nearest-first."}{" "}
                <button
                  className="btn btn-outline btn-sm"
                  style={{ marginLeft: 8 }}
                  onClick={() => detectLocationFor(setProductUserLocation)}
                  type="button"
                  disabled={detecting}
                >
                  📡 Use my location
                </button>
              </p>
            </div>

            {productSearched && !productLoading && (
              <div className="shop-result-grid">
                {productResults.length === 0 && (
                  <div className="state-box">
                    <h3>No shops found</h3>
                    <p>No shop currently lists a product matching "{productQuery}".</p>
                  </div>
                )}
                {productResults.map((r, idx) => (
                  <ShopResultRow key={`${r.shopId}-${r.product.id}-${idx}`} result={r} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "location" && (
          <>
            <div className="card card-pad" style={{ marginBottom: 22 }}>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Radius (km)</label>
                  <input type="number" min="1" max="50" value={radius} onChange={(e) => setRadius(e.target.value)} />
                </div>
              </div>

              {locError && <div className="alert alert-error">{locError}</div>}

              <div className="location-box">
                <button
                  type="button"
                  className="btn btn-amber"
                  onClick={() => detectLocationFor(setUserLocation, setLocError)}
                  disabled={detecting}
                >
                  📡 {detecting ? "Detecting location..." : "Use my current location"}
                </button>
                {userLocation && (
                  <p className="field-hint" style={{ marginTop: 10 }}>
                    ✔ Location set: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                  </p>
                )}
              </div>

              <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={runLocationSearch} disabled={locationLoading}>
                {locationLoading ? <span className="spinner" /> : `Find shops within ${radius} km`}
              </button>
            </div>

            {locationSearched && !locationLoading && (
              <div className="shop-result-grid">
                {locationResults.length === 0 && (
                  <div className="state-box">
                    <h3>No shops found nearby</h3>
                    <p>Try increasing the radius or removing the category filter.</p>
                  </div>
                )}
                {locationResults.map((r) => (
                  <ShopResultRow key={r.shopId} result={r} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;