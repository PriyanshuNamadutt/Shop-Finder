const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail, generateOtp, otpEmailTemplate } = require("../utils/sendEmail");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const otpExpiryDate = () =>
  new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000);

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.isVerified) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    if (user && !user.isVerified) {
      // Existing unverified user retrying registration - update details & resend OTP
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpiry = otpExpiryDate();
      await user.save();
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        otp,
        otpExpiry: otpExpiryDate(),
      });
    }

    await sendEmail({
      to: user.email,
      subject: "Verify your email - Local Shops Finder",
      html: otpEmailTemplate(name, otp, "Use the code below to verify your email and complete your registration."),
    });

    res.status(201).json({ message: "OTP sent to your email. Please verify to complete registration.", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});

// @route POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    if (!user.otp || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// @route POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = otpExpiryDate();
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new OTP - Local Shops Finder",
      html: otpEmailTemplate(user.name, otp, "Here is your new verification code."),
    });

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.isVerified) {
      // Send a fresh OTP so they can verify now
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = otpExpiryDate();
      await user.save();
      await sendEmail({
        to: user.email,
        subject: "Verify your email - Local Shops Finder",
        html: otpEmailTemplate(user.name, otp, "Please verify your email to continue."),
      });
      return res.status(403).json({ message: "Email not verified. A new OTP has been sent.", needsVerification: true, email: user.email });
    }

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// @route GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = router;
