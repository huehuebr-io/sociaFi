import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";
import { canEngage } from "../services/engagementGate.js";

const router = express.Router();
export default router;

/* =====================================================
   POST COMMENT
===================================================== */
router.post("/meme/:id", authMiddleware, async (req, res) => {
  try {
    const memeId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.json({
        success: false,
        message: "Comentário vazio"
      });
    }

    /* =============================
       1️⃣ BUSCAR MEME
    ============================== */
    const memeRes = await db.query(
      `SELECT user_id FROM memes WHERE id = $1`,
      [memeId]
    );

    if (!memeRes.rows[0]) {
      return res.json({
        success: false,
        message: "Meme não encontrado"
      });
    }

    const ownerId = memeRes.rows[0].user_id;
    const isOwnerComment = ownerId === req.user.id;

    /* =============================
       2️⃣ GATE DE ENGAJAMENTO
    ============================== */
    const allowed = await canEngage(req.user.wallet);

    if (!allowed) {
      return res.json({
        success: false,
        message:
          "Você precisa ter pelo menos 1 HBR ou um NFT HueHueBR para comentar."
      });
    }

    /* =============================
       3️⃣ INSERIR COMENTÁRIO
    ============================== */
    await db.query(
      `
      INSERT INTO meme_comments
        (meme_id, user_id, text, is_owner_comment)
      VALUES
        ($1, $2, $3, $4)
      `,
      [
        memeId,
        req.user.id,
        content.trim(),
        isOwnerComment
      ]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});
/* =====================================================
   GET COMMENTS (PÚBLICO)
===================================================== */
router.get("/meme/:id", async (req, res) => {
  try {
    const memeId = req.params.id;

    const { rows } = await db.query(
      `
      SELECT
        c.id,
        c.text,
        c.created_at,
        c.is_owner_comment,

        u.username,
        u.avatar_url,
        u.wallet

      FROM meme_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.meme_id = $1
      ORDER BY c.created_at ASC
      `,
      [memeId]
    );

    res.json({
      success: true,
      items: rows
    });

  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ success: false });
  }
});
