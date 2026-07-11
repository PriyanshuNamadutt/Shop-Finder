import React from "react";

/**
 * props:
 *  - products: array sorted alphabetically [{_id, name, quantity, photo}]
 *  - isOwner: boolean - show update button
 *  - onEdit: (product) => void
 */
const ProductTable = ({ products = [], isOwner = false, onEdit }) => {
  if (!products.length) {
    return (
      <div className="state-box">
        <h3>No products listed yet</h3>
        <p>Nothing matches, or this shop hasn't added any items yet.</p>
      </div>
    );
  }

  const photoUrl = (p) => p.photo || null;

  return (
    <>
      {/* Desktop / tablet table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Product Name</th>
            <th>Quantity</th>
            {isOwner && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {photoUrl(p) ? (
                  <img src={photoUrl(p)} alt={p.name} className="product-photo" />
                ) : (
                  <div className="product-photo-placeholder">📦</div>
                )}
              </td>
              <td>
                <strong>{p.name}</strong>
              </td>
              <td>{p.quantity}</td>
              {isOwner && (
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => onEdit(p)}>
                    Update
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card list */}
      <div className="card-list">
        {products.map((p) => (
          <div className="card-list-item" key={p._id}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {photoUrl(p) ? (
                <img src={photoUrl(p)} alt={p.name} className="product-photo" />
              ) : (
                <div className="product-photo-placeholder">📦</div>
              )}
              <div>
                <strong>{p.name}</strong>
                <div className="field-hint">Qty: {p.quantity}</div>
              </div>
            </div>
            {isOwner && (
              <div className="card-list-actions">
                <button className="btn btn-outline btn-sm" onClick={() => onEdit(p)}>
                  Update
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ProductTable;