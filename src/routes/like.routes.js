import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();
export default router;

/* =====================================================
   LIKE MEME (SEM UNLIKE)
===================================================== */
router.post("/meme/:id", authMiddleware, async (req, res) => {
  try {
    const memeId = req.params.id;

    await db.query(
      `
      INSERT INTO meme_likes (meme_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [memeId, req.user.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
