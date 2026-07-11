import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="background:#e7a33e;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">
           <span style="transform:rotate(45deg);font-size:14px;">📍</span>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

const Recenter = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
};

const ClickCatcher = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * props:
 *  - value: {lat, lng} | null
 *  - onChange: (lat, lng) => void
 */
const LocationPicker = ({ value, onChange }) => {
  const [status, setStatus] = useState("");
  const defaultCenter = value ? [value.lat, value.lng] : [28.6139, 77.209];

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }
    setStatus("Fetching your current location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setStatus("Current location set ✔");
      },
      () => setStatus("Could not get location. Please allow location access or pick manually on the map."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-box">
      <div className="location-actions">
        <button type="button" className="btn btn-amber btn-sm" onClick={useCurrentLocation}>
          📡 Use my current location
        </button>
        <span className="field-hint" style={{ alignSelf: "center" }}>
          or click anywhere on the map to drop a pin
        </span>
      </div>

      {status && <p className="field-hint">{status}</p>}

      <div className="leaflet-map" style={{ height: "260px" }}>
        <MapContainer center={defaultCenter} zoom={value ? 15 : 5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={onChange} />
          {value && <Recenter position={[value.lat, value.lng]} />}
          {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
        </MapContainer>
      </div>

      {value && (
        <p className="field-hint">
          Selected coordinates: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
