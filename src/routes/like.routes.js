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
    const memeId = Number(req.params.id);

    if (!Number.isInteger(memeId)) {
      return res.status(400).json({
        success: false,
        message: "Meme inválido"
      });
    }

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
       2️⃣ NÃO CURTIR PRÓPRIO MEME
    ============================== */
    if (ownerId === req.user.id) {
      return res.json({
        success: false,
        message: "Você não pode curtir seu próprio meme"
      });
    }

    /* =============================
       3️⃣ ENGAGEMENT GATE (HBR / NFT)
    ============================== */
    const allowed = await canEngage(req.user.wallet);
    if (!allowed) {
      return res.json({
        success: false,
        message:
          "Você precisa ter pelo menos 1 HBR ou um NFT Founder/Huezin para curtir"
      });
    }

    /* =============================
       4️⃣ LIKE ÚNICO (SEM UNLIKE)
    ============================== */
    const likeRes = await db.query(
      `
      INSERT INTO meme_likes (meme_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING meme_id
      `,
      [memeId, req.user.id]
    );

    if (!likeRes.rows.length) {
      return res.json({
        success: false,
        message: "Você já curtiu este meme"
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ success: false });
  }
});
