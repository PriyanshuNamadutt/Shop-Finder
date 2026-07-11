require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shops");
const searchRoutes = require("./routes/search");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Product photos are uploaded directly to Cloudinary (see config/cloudinary.js),
// so no local static file serving is needed.

app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/search", searchRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Generic error handler (e.g. multer file errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));