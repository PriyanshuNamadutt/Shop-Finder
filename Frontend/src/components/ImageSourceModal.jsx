import React, { useState } from "react";
import CameraCapture from "./CameraCapture";
import WebImageSearch from "./WebImageSearch";

/**
 * props:
 *  - onSelect: (payload: { file?: File, url?: string, itemName?: string }) => void
 *              fires once, modal is expected to close after
 *  - onClose: () => void
 *  - initialQuery: string - optional pre-fill for the web photo search box
 */
const ImageSourceModal = ({ onSelect, onClose, initialQuery = "" }) => {
  const [mode, setMode] = useState("upload"); // "upload" | "camera" | "search"

  const handleFileSelect = (file) => {
    onSelect({ file });
    onClose();
  };

  const handleUrlSelect = (url, itemName) => {
    onSelect({ url, itemName });
    onClose();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3>Add product photo</h3>

        <div className="tabs">
          <button className={`tab-btn ${mode === "upload" ? "active" : ""}`} onClick={() => setMode("upload")} type="button">
            📁 Upload
          </button>
          <button className={`tab-btn ${mode === "camera" ? "active" : ""}`} onClick={() => setMode("camera")} type="button">
            📷 Camera
          </button>
          <button className={`tab-btn ${mode === "search" ? "active" : ""}`} onClick={() => setMode("search")} type="button">
            🌐 Search photos
          </button>
        </div>

        {mode === "upload" && (
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Choose an image from your device</label>
            <input type="file" accept="image/*" onChange={handleFileInput} />
            <p className="field-hint">JPG, PNG, WEBP or GIF, up to 5MB.</p>
          </div>
        )}

        {mode === "camera" && <CameraCapture onCapture={handleFileSelect} />}

        {mode === "search" && (
          <>
            <p className="field-hint" style={{ marginTop: -4, marginBottom: 10 }}>
              No product photo handy? Search the web for a free, ready-to-use photo instead.
            </p>
            <WebImageSearch onSelect={handleUrlSelect} initialQuery={initialQuery} />
          </>
        )}

        <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 18 }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageSourceModal;
