import express from "express";
import { db } from "../db.js";
import { authMiddlewareOptional } from "../middleware/authOptional.js";

const router = express.Router();
export default router;

/**
 * GET /meme/:id
 * Página pública do meme
 */
router.get("/:id", authMiddlewareOptional, async (req, res) => {
  try {
    const memeId = Number(req.params.id);
    if (!memeId) {
      return res.json({ success: false });
    }

    const { rows } = await db.query(
      `
      SELECT
        m.id,
        m.caption,
        m.media_url,
        m.created_at,
        m.is_nft,

        u.id AS owner_id,
        u.username,
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

    res.json({
      success: true,
      meme: {
        id: row.id,
        caption: row.caption,
        media_url: row.media_url,
        created_at: row.created_at,
        is_nft: row.is_nft,

        owner: {
          id: row.owner_id,
          username: row.username,
          avatar_url: row.avatar_url
        },

        stats: {
          likes: 0,
          comments: 0,
          tips_hbr: 0
        },

        viewer: {
          is_owner: req.user
            ? req.user.id === row.owner_id
            : false
        },

        marketplace: null
      }
    });

  } catch (err) {
    console.error("MEME PAGE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
