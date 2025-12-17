import express from "express";
import { db } from "../db.js";
import { authMiddlewareOptional } from "../middleware/authOptional.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/* =====================================================
   GET /meme/:id
   Página pública do meme
===================================================== */
router.get("/:id", authMiddlewareOptional, async (req, res) => {
  try {
    const memeId = Number(req.params.id);
    if (!memeId) {
      return res.status(400).json({ success: false });
    }

    /* ================= MEME ================= */
    const { rows } = await db.query(
      `
      SELECT
        m.id,
        m.caption,
        m.media_url,
        m.created_at,
        m.is_nft,
        u.id AS user_id,
        u.username,
        u.wallet,
        u.avatar_url
      FROM memes m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = $1
      `,
      [memeId]
    );

    if (!rows[0]) {
      return res.json({ success: false });
    }

    const row = rows[0];

    /* ================= CONTEXTO DO VIEWER ================= */
    const isOwner =
      req.user && req.user.id === row.user_id;

    /* ================= NORMALIZAÇÃO ================= */
    const meme = {
      id: row.id,
      caption: row.caption,
      media_url: row.media_url,
      created_at: row.created_at,
      is_nft: row.is_nft,

      owner: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
        is_founder: await checkFounder(row.wallet)
      },

      stats: {
        likes: 0,     // futuro
        comments: 0,  // futuro
        tips_hbr: 0   // futuro
      },

      viewer: {
        is_owner: isOwner
      },

      marketplace: {
        listed: false, // futuro
        url: null
      }
    };

    res.json({
      success: true,
      meme
    });

  } catch (err) {
    console.error("PAGE MEME ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar meme"
    });
  }
});
