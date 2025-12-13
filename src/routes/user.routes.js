import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();

/**
 * GET /user/me
 */
router.get("/me", authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    "SELECT id, wallet, username, avatar_url, setup_completed FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json({ success: true, user: rows[0] });
});

export default router;
