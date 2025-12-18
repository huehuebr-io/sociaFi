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

    /* =============================
       2️⃣ BLOQUEAR AUTO-LIKE
    ============================== */
    if (ownerId === req.user.id) {
      return res.json({
        success: false,
        message: "Você não pode curtir o próprio meme"
      });
    }

    /* =============================
       3️⃣ GATE DE ENGAJAMENTO
    ============================== */
    const allowed = await canEngage(req.user.wallet);

    if (!allowed) {
      return res.json({
        success: false,
        message:
          "Você precisa ter pelo menos 1 HBR ou um NFT HueHueBR para curtir memes."
      });
    }

    /* =============================
       4️⃣ REGISTRAR LIKE
    ============================== */
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
