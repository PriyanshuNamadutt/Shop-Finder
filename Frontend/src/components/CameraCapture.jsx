import React, { useEffect, useRef, useState } from "react";

/**
 * props:
 *  - onCapture: (file: File) => void
 */
const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported in this browser.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setReady(true);
        }
      } catch (err) {
        setError("Could not access your camera. Please allow camera permission, or use another option.");
      }
    };

    start();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}
      {!error && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", borderRadius: 12, background: "#000", maxHeight: 280, objectFit: "cover" }}
          />
          <button type="button" className="btn btn-amber btn-block" style={{ marginTop: 12 }} onClick={capture} disabled={!ready}>
            📸 Capture photo
          </button>
          <p className="field-hint" style={{ marginTop: 8 }}>
            Frame the product in the preview above, then tap capture.
          </p>
        </>
      )}
    </div>
  );
};

export default CameraCapture;