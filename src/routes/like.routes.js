import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";
import { canEngage } from "../services/engagementGate.js";

const router = express.Router();
export default router;

/* =====================================================
   LIKE MEME (SEM UNLIKE + GATE HBR/NFT)
===================================================== */
router.post("/meme/:id", authMiddleware, async (req, res) => {
  try {
    const memeId = req.params.id;

    // 🔒 GATE DE ENGAJAMENTO
    const allowed = await canEngage(req.user.wallet);

    if (!allowed) {
      return res.json({
        success: false,
        message:
          "Você precisa ter pelo menos 1 HBR ou um NFT HueHueBR para curtir memes."
      });
    }

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
