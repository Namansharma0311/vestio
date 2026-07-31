import express from "express";
import {
  createClothing,
  listClothing,
  getClothingById,
  updateClothing,
  deleteClothing,
} from "../db.js";
import { upload, fileToUrl, deleteUpload } from "../storage.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { search, category, season, occasion, favorite, page } = req.query;
  const result = await listClothing(req.userId, {
    page: page ? Number(page) : 1,
    search,
    category,
    season,
    occasion,
    favorite,
  });
  res.json(result);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file ? fileToUrl(req.file.filename) : null;
    const item = await createClothing(req.userId, { ...req.body, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: "Could not save this item" });
  }
});

router.patch("/:id", upload.single("image"), async (req, res) => {
  const updates = { ...req.body };
  if (req.body.favorite !== undefined) updates.favorite = req.body.favorite === "true" || req.body.favorite === true;
  if (req.file) updates.imageUrl = fileToUrl(req.file.filename);
  const item = await updateClothing(req.userId, req.params.id, updates);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const { deleted, imageUrl } = await deleteClothing(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Item not found" });
  if (imageUrl) deleteUpload(imageUrl);
  res.json({ success: true });
});

export default router;
