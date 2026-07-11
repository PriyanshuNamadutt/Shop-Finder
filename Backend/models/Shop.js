const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, default: 0 },
    photo: { type: String, default: "" }, // URL path e.g. /uploads/xxxx.jpg
  },
  { timestamps: true }
);

const addressSchema = new mongoose.Schema(
  {
    line: { type: String, required: true, trim: true }, // house no / street / locality
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: { type: String, required: true },
    category: {
      type: String,
      enum: ["medicine", "fertilizer", "grocery", "general", "other"],
      default: "general",
    },
    address: { type: addressSchema, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    products: [productSchema],

    deleteOtp: { type: String },
    deleteOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

shopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Shop", shopSchema);