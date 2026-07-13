import React, { useState } from "react";
import { PRODUCT_LIBRARY } from "../data/productLibrary";

const roundRectPath = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const drawItemIcon = (item) => {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = item.color || "#e2efe9";
  roundRectPath(ctx, 0, 0, 300, 300, 36);
  ctx.fill();
  ctx.font = "150px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.emoji, 150, 160);
  return canvas;
};

const canvasToFile = (canvas, filename) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(new File([blob], filename, { type: "image/png" })), "image/png");
  });

/**
 * props:
 *  - onSelect: (file: File, itemName: string) => void
 */
const LibraryPicker = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");

  const filtered = PRODUCT_LIBRARY.filter((item) => item.name.toLowerCase().includes(applied.toLowerCase()));

  const handlePick = async (item) => {
    const canvas = drawItemIcon(item);
    const file = await canvasToFile(canvas, `${item.name.replace(/\s+/g, "-").toLowerCase()}.png`);
    onSelect(file, item.name);
  };

  return (
    <div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="field" style={{ marginBottom: 0, flex: 3 }}>
          <input
            placeholder="Search item e.g. rice, soap, paracetamol..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setApplied(query)}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setApplied(query)}>
          🔍 Search
        </button>
      </div>

      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: 10,
          paddingRight: 4,
        }}
      >
        {filtered.map((item) => (
          <button
            type="button"
            key={item.name}
            onClick={() => handlePick(item)}
            className="btn-outline"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: 8,
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 24,
                background: item.color,
                borderRadius: 10,
                width: 46,
                height: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.emoji}
            </span>
            <span style={{ fontSize: 11, textAlign: "center", color: "var(--ink-soft)", lineHeight: 1.2 }}>{item.name}</span>
          </button>
        ))}

        {filtered.length === 0 && (
          <p className="field-hint" style={{ gridColumn: "1 / -1" }}>
            No matching items. Try a different search, or upload / capture your own photo instead.
          </p>
        )}
      </div>
    </div>
  );
};

export default LibraryPicker;