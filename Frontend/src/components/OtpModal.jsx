import React, { useState } from "react";

/**
 * props:
 *  - title
 *  - message
 *  - onConfirm: (otp) => Promise
 *  - onClose: () => void
 */
const OtpModal = ({ title = "Confirm action", message, onConfirm, onClose }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 4) {
      setError("Please enter the OTP sent to your email");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(otp.trim());
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message && <p className="field-hint" style={{ marginBottom: 16 }}>{message}</p>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Enter OTP</label>
            <input
              className="otp-input"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="------"
              autoFocus
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpModal;
