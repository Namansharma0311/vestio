import express from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById, updateUser, deleteUserData } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, passwordHash });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username || "", avatarUrl: user.avatarUrl || "" } });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong creating your account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username || "", avatarUrl: user.avatarUrl || "" } });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong logging you in" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ id: user.id, email: user.email, username: user.username || "", avatarUrl: user.avatarUrl || "" });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { username, avatarUrl } = req.body;
    const updated = await updateUser(req.userId, { username, avatarUrl });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ id: updated.id, email: updated.email, username: updated.username || "", avatarUrl: updated.avatarUrl || "" });
  } catch {
    res.status(500).json({ error: "Something went wrong updating profile" });
  }
});

router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUser(req.userId, { passwordHash });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Something went wrong changing password" });
  }
});

router.delete("/account", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    await deleteUserData(req.userId);
    const sqlite = (await import("../db.js")).default;
    sqlite.prepare("DELETE FROM users WHERE id = ?").run(req.userId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Something went wrong deleting account" });
  }
});

export default router;
