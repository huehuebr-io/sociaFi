import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";
import { canEngage } from "../services/engagementGate.js";

const router = express.Router();
export default router;

/* =====================================================
   LIKE MEME (SEM UNLIKE + SEM AUTO-LIKE)
===================================================== */
router.post("/meme/:id", authMiddleware, async (req, res) => {
  try {
    const memeId = req.params.id;

    /* =============================
       1️⃣ BUSCAR MEME
    ============================== */
    const memeRes = await db.query(
      `
      SELECT user_id
      FROM memes
      WHERE id = $1
      `,
      [memeId]
    );

    if (!memeRes.rows[0]) {
      return res.json({
        success: false,
        message: "Meme não encontrado"
      });
    }

    const ownerId = memeRes.rows[0].user_id;

    // ❌ não pode curtir próprio meme
if (meme.user_id === req.user.id) {
  return res.json({
    success: false,
    message: "Você não pode curtir seu próprio meme"
  });
}

// 🔒 gate
const allowed = await canEngage(req.user.wallet);
if (!allowed) {
  return res.json({
    success: false,
    message: "Você precisa ter 1 HBR ou NFT Founder"
  });
}

// 🔥 like único (sem unlike)
await db.query(`
  INSERT INTO meme_likes (meme_id, user_id)
  VALUES ($1, $2)
  ON CONFLICT DO NOTHING
`);


    res.json({ success: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
