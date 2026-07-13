import React, { useState } from "react";
import CameraCapture from "./CameraCapture";
import LibraryPicker from "./LibraryPicker";

/**
 * props:
 *  - onSelect: (file: File, itemName?: string) => void   fires once, modal is expected to close after
 *  - onClose: () => void
 */
const ImageSourceModal = ({ onSelect, onClose }) => {
  const [mode, setMode] = useState("upload"); // "upload" | "camera" | "library"

  const handleSelect = (file, itemName) => {
    onSelect(file, itemName);
    onClose();
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleSelect(file);
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
          <button className={`tab-btn ${mode === "library" ? "active" : ""}`} onClick={() => setMode("library")} type="button">
            🗂️ Item library
          </button>
        </div>

        {mode === "upload" && (
          <div className="field" style={{ marginBottom: 8 }}>
            <label>Choose an image from your device</label>
            <input type="file" accept="image/*" onChange={handleFileInput} />
            <p className="field-hint">JPG, PNG, WEBP or GIF, up to 5MB.</p>
          </div>
        )}

        {mode === "camera" && <CameraCapture onCapture={handleSelect} />}

        {mode === "library" && (
          <>
            <p className="field-hint" style={{ marginTop: -4, marginBottom: 10 }}>
              No product photo handy? Search our list of common items and use a ready-made icon instead.
            </p>
            <LibraryPicker onSelect={handleSelect} />
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