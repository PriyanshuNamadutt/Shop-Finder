import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      if (err?.response?.data?.needsVerification) {
        navigate("/verify-otp", { state: { email: err.response.data.email } });
        return;
      }
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container auth-shell">
        <div className="card card-pad">
          <h2>Welcome back</h2>
          <p className="field-hint" style={{ marginBottom: 20 }}>Login to list or manage your shop.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@gmail.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Login"}
            </button>
          </form>
          <p className="field-hint" style={{ marginTop: 18, textAlign: "center" }}>
            New here? <Link to="/register" style={{ color: "var(--teal-800)", fontWeight: 700 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
