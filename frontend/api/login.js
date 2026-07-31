import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "vestio-single-user-secret-2024";
const USER_EMAIL = process.env.USER_EMAIL || "drishtic.20@gmail.com";
const USER_PASSWORD_HASH = process.env.USER_PASSWORD_HASH || "$2a$10$XlmvrmIgL.y8rYJp.PRTl.W1tjTePfO4HBV5rXs97LSdSeClspM6K";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (email.toLowerCase() !== USER_EMAIL.toLowerCase()) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, USER_PASSWORD_HASH);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: "vestio-user", email: USER_EMAIL },
      JWT_SECRET,
      { expiresIn: "365d" }
    );

    return res.status(200).json({
      token,
      user: { id: "vestio-user", email: USER_EMAIL },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
