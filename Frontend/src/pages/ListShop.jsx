import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LocationPicker from "../components/LocationPicker";

const ListShop = () => {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    category: "general",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleLocationChange = (lat, lng) => setLocation({ lat, lng });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.addressLine || !form.city || !form.state || !form.pincode) {
      setError("Please fill in the complete address, including pincode.");
      return;
    }
    if (!location) {
      setError("Please set your shop location using current location or by clicking on the map.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/shops", { ...form, lat: location.lat, lng: location.lng });
      navigate(`/shop/${data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to list shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card card-pad">
          <h2>List your shop</h2>
          <p className="field-hint" style={{ marginBottom: 20 }}>
            Add your shop details below. You can add products right after this step.
          </p>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Shop name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sharma General Store" required />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Contact number</label>
                <input name="contact" value={form.contact} onChange={handleChange} placeholder="+91 98765 43210" required />
              </div>
              <div className="field">
                <label>Category (optional)</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="general">General Store</option>
                  <option value="medicine">Medicine</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="grocery">Grocery</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Address line (house no., street, locality)</label>
              <input
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                placeholder="e.g. 12/3 MG Road, Near Bus Stand"
                required
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Gorakhpur" required />
              </div>
              <div className="field">
                <label>State</label>
                <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Uttar Pradesh" required />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 273001"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Shop location</label>
              <LocationPicker value={location} onChange={handleLocationChange} />
            </div>

            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "List my shop"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListShop;