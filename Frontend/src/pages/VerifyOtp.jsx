import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      login(data.token, data.user);
      navigate("/list-shop");
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="page">
        <div className="container auth-shell">
          <div className="alert alert-error">No email found. Please register again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container auth-shell">
        <div className="card card-pad">
          <h2>Verify your email</h2>
          <p className="field-hint" style={{ marginBottom: 20 }}>
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          {info && <div className="alert alert-success">{info}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Verification code</label>
              <input
                className="otp-input"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                required
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Verify & Continue"}
            </button>
          </form>
          <button className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={handleResend} disabled={resending}>
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
