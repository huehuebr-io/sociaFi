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
    if (!Number.isInteger(memeId)) {
      return res.json({ success: false });
    }

    /* =============================
       MEME + DONO
    ============================== */
    const memeRes = await db.query(
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

    if (!memeRes.rows[0]) {
      return res.json({ success: false });
    }

    const meme = memeRes.rows[0];

    /* =============================
       STATS
    ============================== */
    const likesRes = await db.query(
      `SELECT COUNT(*) FROM meme_likes WHERE meme_id = $1`,
      [memeId]
    );

    const tipsRes = await db.query(
  `
  SELECT COALESCE(SUM(amount), 0) AS total
  FROM meme_tips
  WHERE meme_id = $1
  `,
  [memeId]
);

    const commentsRes = await db.query(
      `SELECT COUNT(*) FROM meme_comments WHERE meme_id = $1`,
      [memeId]
    );

    /* =============================
       VIEWER INFO
    ============================== */
    let viewerLiked = false;
    let isOwner = false;

    if (req.user) {
      isOwner = req.user.id === meme.owner_id;

      const likedRes = await db.query(
        `
        SELECT 1
        FROM meme_likes
        WHERE meme_id = $1 AND user_id = $2
        `,
        [memeId, req.user.id]
      );

      viewerLiked = !!likedRes.rows[0];
    }

    /* =============================
       RESPONSE
    ============================== */
    res.json({
      success: true,
      meme: {
        id: meme.id,
        caption: meme.caption,
        media_url: meme.media_url,
        created_at: meme.created_at,
        is_nft: meme.is_nft,

        owner: {
          id: meme.owner_id,
          username: meme.username,
          avatar_url: meme.avatar_url
        },

        stats: {
          likes: Number(likesRes.rows[0].count),
          comments: Number(commentsRes.rows[0].count),
          tips_hbr: Number(tipsRes.rows[0].total)
        },

        viewer: {
          is_owner: isOwner,
          liked: viewerLiked
        },

        marketplace: null
      }
    });

  } catch (err) {
    console.error("MEME PAGE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
