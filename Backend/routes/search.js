const express = require("express");
const Shop = require("../models/Shop");
const { haversineDistanceKm } = require("../utils/distance");

const router = express.Router();

// @route GET /api/search/product?name=xxx&lat=&lng=
// Returns all shops that contain a product matching the name (partial, case-insensitive)
router.get("/product", async (req, res) => {
  try {
    const { name, lat, lng } = req.query;
    if (!name) return res.status(400).json({ message: "Product name is required" });

    const regex = new RegExp(name, "i");
    const shops = await Shop.find({ "products.name": regex }).populate("owner", "name email");

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const hasUserLocation = !isNaN(userLat) && !isNaN(userLng);

    const results = [];
    shops.forEach((shop) => {
      const matchedProducts = shop.products.filter((p) => regex.test(p.name));
      matchedProducts.forEach((product) => {
        const [shopLng, shopLat] = shop.location.coordinates;
        results.push({
          shopId: shop._id,
          shopName: shop.name,
          category: shop.category,
          address: shop.address,
          contact: shop.contact,
          ownerName: shop.owner?.name,
          location: shop.location,
          distanceKm: hasUserLocation ? haversineDistanceKm(userLat, userLng, shopLat, shopLng) : null,
          product: {
            id: product._id,
            name: product.name,
            quantity: product.quantity,
            photo: product.photo,
          },
        });
      });
    });

    if (hasUserLocation) {
      results.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

// @route GET /api/search/location?lat=&lng=&category=&radius=10
// Returns all shops within radius km (default 10) of given point, optional category filter
router.get("/location", async (req, res) => {
  try {
    const { lat, lng, category, radius } = req.query;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "lat and lng are required" });
    }
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius) || 10;

    const query = {
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [userLng, userLat] },
          $maxDistance: radiusKm * 1000, // meters
        },
      },
    };
    if (category && category !== "all") {
      query.category = category;
    }

    const shops = await Shop.find(query).populate("owner", "name email").select("-deleteOtp -deleteOtpExpiry");

    const results = shops.map((shop) => {
      const [shopLng, shopLat] = shop.location.coordinates;
      return {
        shopId: shop._id,
        shopName: shop.name,
        category: shop.category,
        address: shop.address,
        contact: shop.contact,
        ownerName: shop.owner?.name,
        location: shop.location,
        productCount: shop.products.length,
        distanceKm: haversineDistanceKm(userLat, userLng, shopLat, shopLng),
      };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;
