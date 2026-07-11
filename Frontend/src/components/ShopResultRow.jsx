import React from "react";
import { useNavigate } from "react-router-dom";
import { FILE_BASE_URL } from "../api/axios";
import { formatAddress } from "../utils/format";

/**
 * Renders a single shop search result.
 * props:
 *  - result: { shopId, shopName, category, address, contact, ownerName, distanceKm, product? }
 */
const ShopResultRow = ({ result }) => {
  const navigate = useNavigate();
  const photoUrl = result.product?.photo || null;

  return (
    <div className="card shop-result-card">
      <div>
        {result.product ? (
          photoUrl ? (
            <img src={photoUrl} alt={result.product.name} className="product-photo" />
          ) : (
            <div className="product-photo-placeholder">📦</div>
          )
        ) : (
          <div className="product-photo-placeholder">🏪</div>
        )}
      </div>

      <div>
        <div className="shop-result-name">{result.shopName}</div>
        {result.product && (
          <div className="shop-result-meta">
            {result.product.name} · Qty: {result.product.quantity}
          </div>
        )}
        {result.category && <span className="badge" style={{ marginTop: 6 }}>{result.category}</span>}
      </div>

      <div>
        <div className="shop-result-meta">👤 {result.ownerName || "—"}</div>
        <div className="shop-result-meta">📞 {result.contact}</div>
        <div className="shop-result-meta">📍 {formatAddress(result.address) || "Address not provided"}</div>
      </div>

      <div>
        {result.distanceKm !== null && result.distanceKm !== undefined ? (
          <span className="distance-pill">{result.distanceKm.toFixed(1)} km away</span>
        ) : (
          <span className="field-hint">Distance unknown</span>
        )}
      </div>

      <div className="table-actions" style={{ flexDirection: "column" }}>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/shop/${result.shopId}`)}>
          View products
        </button>
      </div>
    </div>
  );
};

export default ShopResultRow;