const express = require("express");
const Shop = require("../models/Shop");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const { sendEmail, generateOtp, otpEmailTemplate } = require("../utils/sendEmail");

const router = express.Router();

// Uploads an in-memory file buffer to Cloudinary and returns its secure URL
const uploadToCloudinary = (buffer, mimetype) =>
  new Promise((resolve, reject) => {
    const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
    cloudinary.uploader.upload(
      dataUri,
      { folder: "local-shops-finder/products", resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
  });

const otpExpiryDate = () =>
  new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000);

// @route GET /api/shops  - all shops (for map + listing), public
router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner", "name email").select("-deleteOtp -deleteOtpExpiry");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shops" });
  }
});

// @route GET /api/shops/mine - shops owned by logged in user
router.get("/mine", protect, async (req, res) => {
  try {
    const shops = await Shop.find({ owner: req.user._id }).select("-deleteOtp -deleteOtpExpiry");
    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your shops" });
  }
});

// @route GET /api/shops/:id - shop detail with alphabetically sorted products
router.get("/:id", async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate("owner", "name email").select("-deleteOtp -deleteOtpExpiry");
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const shopObj = shop.toObject();
    shopObj.products = shopObj.products.sort((a, b) => a.name.localeCompare(b.name));
    res.json(shopObj);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shop" });
  }
});

// @route POST /api/shops - create/list a new shop (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { name, contact, category, lat, lng, addressLine, city, state, pincode } = req.body;
    if (!name || !contact || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Name, contact and location are required" });
    }
    if (!addressLine || !city || !state || !pincode) {
      return res.status(400).json({ message: "Full address (line, city, state and pincode) is required" });
    }

    const shop = await Shop.create({
      name,
      contact,
      category: category || "general",
      address: { line: addressLine, city, state, pincode },
      owner: req.user._id,
      location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
      products: [],
    });

    res.status(201).json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create shop" });
  }
});

// @route PUT /api/shops/:id - edit basic shop info (protected, owner only)
router.put("/:id", protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this shop" });
    }

    const { name, contact, category, addressLine, city, state, pincode, lat, lng } = req.body;
    if (name) shop.name = name;
    if (contact) shop.contact = contact;
    if (category) shop.category = category;
    if (addressLine || city || state || pincode) {
      shop.address = {
        line: addressLine ?? shop.address.line,
        city: city ?? shop.address.city,
        state: state ?? shop.address.state,
        pincode: pincode ?? shop.address.pincode,
      };
    }
    if (lat !== undefined && lng !== undefined) {
      shop.location = { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] };
    }
    await shop.save();
    res.json(shop);
  } catch (err) {
    res.status(500).json({ message: "Failed to update shop" });
  }
});

// @route POST /api/shops/:id/products - add a new product (protected, owner only)
router.post("/:id/products", protect, upload.single("photo"), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this shop" });
    }

    const { name, quantity } = req.body;
    if (!name || quantity === undefined) {
      return res.status(400).json({ message: "Product name and quantity are required" });
    }

    let photoUrl = "";
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    // If a product with the same name (case-insensitive) exists, update quantity/photo instead of duplicating
    const existing = shop.products.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.quantity = parseInt(quantity);
      if (photoUrl) existing.photo = photoUrl;
    } else {
      shop.products.push({ name, quantity: parseInt(quantity), photo: photoUrl });
    }

    await shop.save();
    const shopObj = shop.toObject();
    shopObj.products = shopObj.products.sort((a, b) => a.name.localeCompare(b.name));
    res.status(201).json(shopObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// @route PUT /api/shops/:id/products/:productId - update existing product qty/photo/name (protected, owner only)
router.put("/:id/products/:productId", protect, upload.single("photo"), async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this shop" });
    }

    const product = shop.products.id(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, quantity } = req.body;
    if (name) product.name = name;
    if (quantity !== undefined) product.quantity = parseInt(quantity);
    if (req.file) {
      product.photo = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    await shop.save();
    const shopObj = shop.toObject();
    shopObj.products = shopObj.products.sort((a, b) => a.name.localeCompare(b.name));
    res.json(shopObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// @route DELETE /api/shops/:id/products/:productId - remove a product (protected, owner only)
router.delete("/:id/products/:productId", protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this shop" });
    }
    shop.products = shop.products.filter((p) => p._id.toString() !== req.params.productId);
    await shop.save();
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove product" });
  }
});

// @route POST /api/shops/:id/request-delete-otp - send OTP to owner's email before deleting shop
router.post("/:id/request-delete-otp", protect, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this shop" });
    }

    const otp = generateOtp();
    shop.deleteOtp = otp;
    shop.deleteOtpExpiry = otpExpiryDate();
    await shop.save();

    await sendEmail({
      to: req.user.email,
      subject: "Confirm shop deletion - Local Shops Finder",
      html: otpEmailTemplate(
        req.user.name,
        otp,
        `You requested to delete the shop "${shop.name}". Use the code below to confirm this action.`
      ),
    });

    res.json({ message: "OTP sent to your registered email to confirm deletion" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send delete OTP" });
  }
});

// @route DELETE /api/shops/:id - delete shop after OTP verification (protected, owner only)
router.delete("/:id", protect, async (req, res) => {
  try {
    const { otp } = req.body;
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this shop" });
    }

    if (!shop.deleteOtp || shop.deleteOtp !== otp || shop.deleteOtpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await shop.deleteOne();
    res.json({ message: "Shop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete shop" });
  }
});

module.exports = router;