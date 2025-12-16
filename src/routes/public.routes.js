import express from "express";
import { db } from "../db.js";
import { authMiddlewareOptional } from "../middleware/authOptional.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/* =====================================================
   PERFIL PÚBLICO
===================================================== */
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const { rows } = await db.query(
      `
      SELECT id, username, wallet, avatar_url, bio
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (!rows[0]) {
      return res.json({ success: false });
    }

    const user = rows[0];

    // 🔒 FOUNDER (NÃO QUEBRA PERFIL)
    let isFounder = false;
    try {
      isFounder = await checkFounder(user.wallet);
    } catch (e) {
      console.warn("Founder check failed:", e.message);
    }

    const postsRes = await db.query(
  `SELECT COUNT(*) FROM memes WHERE user_id = $1`,
  [user.id]
);

const followersRes = await db.query(
  `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
  [user.id]
);

const followingRes = await db.query(
  `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
  [user.id]
);
    res.json({
  success: true,
  user: {
    id: user.id,
    username: user.username,
    wallet: user.wallet,
    avatar_url: user.avatar_url,
    bio: user.bio,
    is_founder: isFounder,
    posts: Number(postsRes.rows[0].count),
    followers: Number(followersRes.rows[0].count),
    following: Number(followingRes.rows[0].count)
  }
});

  } catch (err) {
    console.error("PUBLIC PROFILE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
/* =====================================================
   MEMES DO USUÁRIO (PÚBLICO)
===================================================== */
router.get("/user/:username/memes", async (req, res) => {
  const { username } = req.params;

  const { rows } = await db.query(
    `
    SELECT m.id, m.caption, m.media_url, m.created_at, m.is_nft
    FROM memes m
    JOIN users u ON u.id = m.user_id
    WHERE u.username = $1
    ORDER BY m.created_at DESC
    `,
    [username]
  );

  res.json({
    success: true,
    items: rows
  });
});
/* =====================================================
   FOLLOWERS (PÚBLICO)
===================================================== */
router.get("/user/:username/followers", async (req, res) => {
  try {
    const { username } = req.params;

    const { rows } = await db.query(
      `
      SELECT u.username, u.avatar_url
      FROM follows f
      JOIN users u ON u.id = f.follower_id
      JOIN users t ON t.id = f.following_id
      WHERE t.username = $1
      ORDER BY u.username ASC
      `,
      [username]
    );

    res.json({
      success: true,
      items: rows
    });

  } catch (err) {
    console.error("FOLLOWERS ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   FOLLOWING (PÚBLICO)
===================================================== */
router.get("/user/:username/following", async (req, res) => {
  try {
    const { username } = req.params;

    const { rows } = await db.query(
      `
      SELECT u.username, u.avatar_url
      FROM follows f
      JOIN users u ON u.id = f.following_id
      JOIN users t ON t.id = f.follower_id
      WHERE t.username = $1
      ORDER BY u.username ASC
      `,
      [username]
    );

    res.json({
      success: true,
      items: rows
    });

  } catch (err) {
    console.error("FOLLOWING ERROR:", err);
    res.status(500).json({ success: false });
  }
});
