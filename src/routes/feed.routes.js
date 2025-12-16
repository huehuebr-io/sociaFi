import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/**
 * GET /feed
 * Feed global
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        m.id,
        m.caption,
        m.media_url,
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

    // 🔥 NORMALIZAR FORMATO PARA O FRONTEND
    const items = await Promise.all(
      rows.map(async row => ({
        id: row.id,
        caption: row.caption,
        media_url: row.media_url,
        created_at: row.created_at,
        is_nft: row.is_nft,

        author: {
          username: row.username,
          avatar_url: row.avatar_url,
          is_founder: await checkFounder(row.wallet)
        },

        stats: {
          likes: 0,
          comments: 0,
          tips_hbr: 0
        }
      }))
    );

    res.json({
      success: true,
      items
    });

  } catch (err) {
    console.error("FEED ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar feed"
    });
  }
});

// FEED NFT
router.get("/nft", async (req, res) => {
  const { rows } = await db.query(`
    SELECT m.*, u.username, u.avatar_url
    FROM memes m
    JOIN users u ON u.id = m.user_id
    WHERE m.is_nft = true
    ORDER BY m.created_at DESC
  `);

  res.json({ success: true, items: rows });
});
// FEED FOLLOWING
router.get("/following", async (req, res) => {
  const { rows } = await db.query(`
    SELECT m.*, u.username, u.avatar_url
    FROM memes m
    JOIN users u ON u.id = m.user_id
    ORDER BY m.created_at DESC
    LIMIT 50
  `);

  res.json({ success: true, items: rows });
});
