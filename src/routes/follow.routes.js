import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /follow/:userId
 * Seguir usuário
 */
router.post("/:userId", authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId);

  if (followerId === followingId) {
    return res.json({ success: false, message: "Não pode seguir a si mesmo" });
  }

  try {
    await db.query(
      `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [followerId, followingId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("FOLLOW ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * DELETE /follow/:userId
 * Deixar de seguir
 */
router.delete("/:userId", authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId);

  await db.query(
    `
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
    `,
    [followerId, followingId]
  );

  res.json({ success: true });
});

/**
 * GET /follow/status/:userId
 * Ver se já segue
 */
router.get("/status/:userId", authMiddleware, async (req, res) => {
  const followerId = req.user.id;
  const followingId = parseInt(req.params.userId);

  const { rowCount } = await db.query(
    `
    SELECT 1 FROM follows
    WHERE follower_id = $1 AND following_id = $2
    `,
    [followerId, followingId]
  );

  res.json({ following: rowCount > 0 });
});

/**
 * GET /follow/stats/:userId
 * Seguidores / Seguindo
 */
router.get("/stats/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const [followers, following] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM follows WHERE following_id = $1`, [userId]),
    db.query(`SELECT COUNT(*) FROM follows WHERE follower_id = $1`, [userId])
  ]);

  res.json({
    followers: Number(followers.rows[0].count),
    following: Number(following.rows[0].count)
  });
});

export default router;
