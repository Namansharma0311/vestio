import express from "express";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();

const USER_EMAIL = (process.env.USER_EMAIL || "drishtic.20@gmail.com").toLowerCase();
const USER_PASSWORD_HASH =
  process.env.USER_PASSWORD_HASH ||
  "$2a$10$23VvZCHqBQwHC9Fnnb9dleMIp2uQFHArPMtLforyqiQ1NOZm87pru";

const singleUser = { id: "vestio-user", email: USER_EMAIL, username: "", avatarUrl: "" };

router.post("/register", (req, res) => {
  res.status(403).json({ error: "Registration is disabled — this app has a single account" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const emailOk = email.toLowerCase() === USER_EMAIL;
    const passOk = await bcrypt.compare(password, USER_PASSWORD_HASH);
    if (!emailOk || !passOk) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(singleUser);
    res.json({ token, user: singleUser });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong logging you in" });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json(singleUser);
});

router.put("/profile", requireAuth, (req, res) => {
  const { username = "", avatarUrl = "" } = req.body || {};
  res.json({ ...singleUser, username, avatarUrl });
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
    const valid = await bcrypt.compare(currentPassword, USER_PASSWORD_HASH);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Something went wrong changing password" });
  }
});

router.delete("/account", requireAuth, (req, res) => {
  res.json({ success: true });
});

export default router;
