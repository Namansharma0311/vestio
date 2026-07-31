import express from "express";
import { createOutfit, listOutfits, deleteOutfit, listAllClothing } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const outfits = await listOutfits(req.userId);
  const clothes = await listAllClothing(req.userId);
  const byId = Object.fromEntries(clothes.map((c) => [c.id, c]));
  const hydrated = outfits.map((o) => ({
    ...o,
    items: o.itemIds.map((id) => byId[id]).filter(Boolean),
  }));
  res.json(hydrated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post("/", async (req, res) => {
  const { name, itemIds } = req.body;
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({ error: "Pick at least one item for the outfit" });
  }
  const outfit = await createOutfit(req.userId, { name, itemIds });
  res.status(201).json(outfit);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteOutfit(req.userId, req.params.id);
  if (!ok) return res.status(404).json({ error: "Outfit not found" });
  res.json({ success: true });
});

export default router;
