import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductTable from "../components/ProductTable";
import OtpModal from "../components/OtpModal";
import { formatAddress } from "../utils/format";

const emptyProductForm = { name: "", quantity: "", photo: null, productId: null };

const ShopDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  const [showDeleteOtp, setShowDeleteOtp] = useState(false);
  const [deleteRequesting, setDeleteRequesting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  const fetchShop = async () => {
    try {
      const { data } = await api.get(`/shops/${id}`);
      setShop(data);
    } catch (err) {
      setError("Shop not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = user && shop && (shop.owner?._id === user.id || shop.owner === user.id);

  const filteredProducts = (shop?.products || []).filter((p) =>
    p.name.toLowerCase().includes(appliedSearch.toLowerCase())
  );

  const openAddForm = () => {
    setProductForm(emptyProductForm);
    setProductError("");
    setShowProductForm(true);
  };

  const openEditForm = (product) => {
    setProductForm({ name: product.name, quantity: product.quantity, photo: null, productId: product._id });
    setProductError("");
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductError("");
    if (!productForm.name || productForm.quantity === "") {
      setProductError("Product name and quantity are required");
      return;
    }
    setSavingProduct(true);
    try {
      const fd = new FormData();
      fd.append("name", productForm.name);
      fd.append("quantity", productForm.quantity);
      if (productForm.photo) fd.append("photo", productForm.photo);

      if (productForm.productId) {
        await api.put(`/shops/${id}/products/${productForm.productId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/shops/${id}/products`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowProductForm(false);
      fetchShop();
    } catch (err) {
      setProductError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const requestDeleteOtp = async () => {
    setDeleteRequesting(true);
    setDeleteMsg("");
    try {
      await api.post(`/shops/${id}/request-delete-otp`);
      setShowDeleteOtp(true);
    } catch (err) {
      setDeleteMsg(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setDeleteRequesting(false);
    }
  };

  const confirmDelete = async (otp) => {
    await api.delete(`/shops/${id}`, { data: { otp } });
    setShowDeleteOtp(false);
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container state-box">
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">{error || "Shop not found"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="shop-card-top">
            <div>
              <h2 style={{ marginBottom: 6 }}>{shop.name}</h2>
              <span className="badge">{shop.category}</span>
            </div>
            {isOwner && (
              <button className="btn btn-danger btn-sm" onClick={requestDeleteOtp} disabled={deleteRequesting}>
                {deleteRequesting ? "Sending OTP..." : "🗑 Delete shop"}
              </button>
            )}
          </div>
          <p className="shop-card-meta">👤 Owner: {shop.owner?.name}</p>
          <p className="shop-card-meta">📞 Contact: {shop.contact}</p>
          <p className="shop-card-meta">📍 {formatAddress(shop.address) || "Address not provided"}</p>
          {deleteMsg && <div className="alert alert-error" style={{ marginTop: 12 }}>{deleteMsg}</div>}
        </div>

        <div className="section-head">
          <h2>Products</h2>
          {isOwner && (
            <button className="btn btn-primary" onClick={openAddForm}>
              + Add / Update product
            </button>
          )}
        </div>

        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="field" style={{ marginBottom: 0, flex: 3 }}>
              <input
                placeholder="Search a product in this shop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setAppliedSearch(search)}
              />
            </div>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setAppliedSearch(search)}>
              🔍 Search
            </button>
            {appliedSearch && (
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch("");
                  setAppliedSearch("");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <ProductTable products={filteredProducts} isOwner={isOwner} onEdit={openEditForm} />
      </div>

      {showProductForm && (
        <div className="modal-backdrop" onClick={() => setShowProductForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{productForm.productId ? "Update product" : "Add new product"}</h3>
            {productError && <div className="alert alert-error">{productError}</div>}
            <form onSubmit={handleProductSubmit}>
              <div className="field">
                <label>Product name</label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Basmati Rice 5kg"
                  required
                />
              </div>
              <div className="field">
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                  placeholder="Available quantity"
                  required
                />
              </div>
              <div className="field">
                <label>Product photo {productForm.productId ? "(optional - replaces current)" : ""}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductForm({ ...productForm, photo: e.target.files[0] })}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setShowProductForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block" disabled={savingProduct}>
                  {savingProduct ? <span className="spinner" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteOtp && (
        <OtpModal
          title="Confirm shop deletion"
          message={`An OTP was sent to your registered email. Enter it to permanently delete "${shop.name}".`}
          onConfirm={confirmDelete}
          onClose={() => setShowDeleteOtp(false)}
        />
      )}
    </div>
  );
};

export default ShopDetail;