import express from "express";
import { db } from "../db.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/* =====================================================
   PERFIL PÚBLICO
===================================================== */
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // 1️⃣ usuário
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

    // 2️⃣ verificar founder ON-CHAIN
    const isFounder = await checkFounder(user.wallet);

    // 3️⃣ contar stats
    const posts = await db.query(
      `SELECT COUNT(*) FROM memes WHERE user_id = $1`,
      [user.id]
    );

    const followers = await db.query(
      `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
      [user.id]
    );

    const following = await db.query(
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
        posts: Number(posts.rows[0].count),
        followers: Number(followers.rows[0].count),
        following: Number(following.rows[0].count)
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
router.get("/u/router.get("/user/:router.get("/use/:router.get("/us/:, ernam  q, re ) => {nam
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
