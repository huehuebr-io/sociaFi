import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { authMiddlewareOptional } from "../middleware/authOptional.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/**
 * GET /feed
 * Feed global
 */
router.get("/", async (req, res) => {
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
/* =====================================================
   FEED SEGUINDO
===================================================== */
router.get("/following", authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      `
      SELECT 
        m.id,
        m.caption,
        m.media_url,
        m.created_at,
        m.is_nft,
        u.username,
        u.wallet,
        u.avatar_url
      FROM follows f
      JOIN memes m ON m.user_id = f.following_id
      JOIN users u ON u.id = m.user_id
      WHERE f.follower_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50
      `,
      [req.user.id]
    );

    // 🔥 NORMALIZAR IGUAL AO FEED GLOBAL
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
    console.error("FEED FOLLOWING ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar feed seguindo"
    });
  }
});
