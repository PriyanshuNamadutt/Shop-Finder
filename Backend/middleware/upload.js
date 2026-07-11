const multer = require("multer");
const path = require("path");

// Use memory storage: files are kept in a buffer and uploaded straight to
// Cloudinary (see routes/shops.js), nothing is written to local disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error("Only image files (jpg, png, webp, gif) are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;