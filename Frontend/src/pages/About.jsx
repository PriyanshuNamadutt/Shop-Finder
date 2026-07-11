import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page">
      <div className="container">
        <div className="about-hero">
          <span className="hero-eyebrow">About the project</span>
          <h1>Every neighborhood shop, on one map.</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 16, marginTop: 12 }}>
            Local Shops Finder helps small shopkeepers — grocers, medical stores, fertilizer depots, and general
            stores — get discovered by people nearby, without needing to build their own website or app.
            Everything is powered by free, open-source OpenStreetMap data.
          </p>
        </div>

        <div className="about-grid">
          <div className="card about-step">
            <div className="about-step-num">01</div>
            <h3>Register &amp; verify</h3>
            <p className="shop-card-meta">
              Shop owners sign up with an email and confirm it with a one-time code, keeping every listing on the
              platform tied to a real, reachable contact.
            </p>
          </div>
          <div className="card about-step">
            <div className="about-step-num">02</div>
            <h3>Pin your shop</h3>
            <p className="shop-card-meta">
              Drop a pin using your current GPS location or by clicking the map, add your contact details and an
              optional category, and list your products with photos and quantities.
            </p>
          </div>
          <div className="card about-step">
            <div className="about-step-num">03</div>
            <h3>Get discovered</h3>
            <p className="shop-card-meta">
              Shoppers search by product name or browse shops within a radius of their location, see what's in
              stock, and get directions straight to your door.
            </p>
          </div>
        </div>

        <div className="card card-pad" style={{ marginTop: 10 }}>
          <h2>Why we built this</h2>
          <p className="shop-card-meta" style={{ fontSize: 14.5, lineHeight: 1.7 }}>
            Big marketplaces are built for big brands. The corner grocery store, the local pharmacy, and the
            village fertilizer depot rarely show up in a map search — even though they're often the fastest,
            cheapest option nearby. This project is a lightweight, free directory that lets any shop owner list
            their store and inventory in minutes, and lets anyone else find exactly what they need close by.
          </p>
          <p className="shop-card-meta" style={{ fontSize: 14.5, lineHeight: 1.7 }}>
            Maps are rendered with <strong>OpenStreetMap</strong> and <strong>Leaflet</strong> — no API keys, no
            usage caps, community-maintained map data. Account and shop-deletion security uses one-time email
            codes delivered via <strong>Brevo</strong>.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/search" className="btn btn-primary">Search shops</Link>
            <Link to="/list-shop" className="btn btn-amber">List your shop</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
