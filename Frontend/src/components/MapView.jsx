import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { formatAddress } from "../utils/format";

// Custom divIcon markers (avoids broken default marker image imports under bundlers)
const shopIcon = L.divIcon({
  className: "",
  html: `<div style="background:#146356;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">
           <span style="transform:rotate(45deg);font-size:14px;">🏪</span>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
  popupAnchor: [0, -26],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="background:#e7a33e;width:22px;height:22px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Helper to re-center map when center prop changes
const RecenterOnChange = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  shops = [],
  center = [28.6139, 77.209], // default: New Delhi
  zoom = 12,
  height = "420px",
  userLocation = null,
  onShopClick = null,
  showViewLink = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="leaflet-map" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange center={center} zoom={zoom} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {shops.map((shop) => {
          if (!shop.location?.coordinates) return null;
          const [lng, lat] = shop.location.coordinates;
          return (
            <Marker
              key={shop._id || shop.shopId}
              position={[lat, lng]}
              icon={shopIcon}
              eventHandlers={{ click: () => onShopClick && onShopClick(shop) }}
            >
              <Popup>
                <div className="map-popup">
                  <h4>{shop.name || shop.shopName}</h4>
                  {shop.category && <p>Category: {shop.category}</p>}
                  {shop.contact && <p>Contact: {shop.contact}</p>}
                  {shop.address && <p>{formatAddress(shop.address)}</p>}
                  {showViewLink && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => navigate(`/shop/${shop._id || shop.shopId}`)}
                    >
                      View products
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;