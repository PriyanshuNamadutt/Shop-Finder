import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      navigate("/verify-otp", { state: { email: data.email } });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container auth-shell">
        <div className="card card-pad">
          <h2>Create your account</h2>
          <p className="field-hint" style={{ marginBottom: 20 }}>
            We'll email you a one-time code to verify your address before you can list a shop.
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
            </div>
            <div className="field">
              <label>Email address (Gmail recommended)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Send verification code"}
            </button>
          </form>
          <p className="field-hint" style={{ marginTop: 18, textAlign: "center" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--teal-800)", fontWeight: 700 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
