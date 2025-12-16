import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();
export default router;

/* =====================================================
   CHECK FOLLOW STATUS
===================================================== */
router.get("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const userRes = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (!userRes.rows[0]) {
      return res.json({ success: false });
    }

    const followingId = userRes.rows[0].id;

    const check = await db.query(
      `
      SELECT 1 FROM follows
      WHERE follower_id = $1 AND following_id = $2
      `,
      [req.user.id, followingId]
    );

    res.json({
      success: true,
      following: check.rowCount > 0
    });

  } catch (err) {
    console.error("CHECK FOLLOW ERROR:", err);
    res.status(500).json({ success: false });
  }
});
/* =====================================================
   FOLLOW
===================================================== */
router.post("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const userRes = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (!userRes.rows[0]) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    const followingId = userRes.rows[0].id;

    if (followingId === req.user.id) {
      return res.json({ success: false, message: "Você não pode seguir a si mesmo" });
    }

    await db.query(
      `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [req.user.id, followingId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("FOLLOW ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   UNFOLLOW
===================================================== */
router.delete("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const userRes = await db.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (!userRes.rows[0]) {
      return res.json({ success: false });
    }

    await db.query(
      `
      DELETE FROM follows
      WHERE follower_id = $1 AND following_id = $2
      `,
      [req.user.id, userRes.rows[0].id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("UNFOLLOW ERROR:", err);
    res.status(500).json({ success: false });
  }
});
