import React, { useState } from "react";
import api from "../api/axios";

/**
 * props:
 *  - onSelect: (imageUrl: string, query: string) => void
 *  - initialQuery: string - pre-fill the search box (e.g. with the product name already typed)
 */
const WebImageSearch = ({ onSelect, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const { data } = await api.get("/search/product-image", { params: { q: query.trim() } });
      setResults(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Image search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={runSearch} className="form-row" style={{ marginBottom: 12 }}>
        <div className="field" style={{ marginBottom: 0, flex: 3 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product name e.g. Basmati Rice, Paracetamol..."
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : "🔍 Search"}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {searched && !loading && !error && results.length === 0 && (
        <p className="field-hint">
          No free-to-use photos found for "{query}". Try a more generic name, or upload/capture your own photo instead.
        </p>
      )}

      {results.length > 0 && (
        <div
          style={{
            maxHeight: 280,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 10,
            paddingRight: 4,
          }}
        >
          {results.map((img) => (
            <button
              type="button"
              key={img.id}
              onClick={() => onSelect(img.fullUrl, query.trim())}
              title={img.title}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 4,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <img
                src={img.thumbnail}
                alt={img.title || "product"}
                style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6 }}
              />
            </button>
          ))}
        </div>
      )}

      <p className="field-hint" style={{ marginTop: 12 }}>
        Results are Creative Commons licensed photos from{" "}
        <a href="https://openverse.org" target="_blank" rel="noreferrer" style={{ color: "var(--teal-800)", fontWeight: 700 }}>
          Openverse
        </a>{" "}
        — a free, keyless search of Wikimedia Commons, Flickr and other open sources.
      </p>
    </div>
  );
};

export default WebImageSearch;