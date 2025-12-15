import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
export default router;

/**
 * GET /feed
 * Feed global (memes reais)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        m.id,
        m.caption,
        m.media_url,
        m.category,
        m.created_at,
        m.is_nft,
        u.username,
        u.wallet,
        u.avatar_url
      FROM memes m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      items: rows
    });

  } catch (err) {
    console.error("FEED ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar feed"
    });
  }
});
