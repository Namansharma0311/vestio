// storage.js — Mock "Cloudinary" using local disk storage via multer.
// To swap in real Cloudinary later:
//   1. npm install cloudinary multer-storage-cloudinary
//   2. Replace `upload` below with a CloudinaryStorage multer engine using
//      CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET from .env
//   3. Set item.imageUrl to the Cloudinary secure_url instead of the local path.
//   Routes that call `upload.single("image")` and read `req.file` won't need to change.

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = process.env.STORAGE_DIR
  ? path.join(process.env.STORAGE_DIR, "uploads")
  : path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

export function fileToUrl(filename) {
  return `/uploads/${filename}`;
}

export function deleteUpload(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  const filename = imageUrl.replace("/uploads/", "");
  const filePath = path.join(uploadDir, filename);
  fs.unlink(filePath, () => {});
}

export const uploadDirPath = uploadDir;
