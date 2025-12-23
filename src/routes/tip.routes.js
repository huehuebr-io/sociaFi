import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";
import { canEngage } from "../services/engagementGate.js";
import { getHBRBalance } from "../services/hbr.js";

const router = express.Router();
export default router;

/* =====================================================
   POST TIP
===================================================== */
router.post("/meme/:id", authMiddleware, async (req, res) => {
  try {
    const memeId = Number(req.params.id);
    const amount = Number(req.body.amount);

    if (!memeId || !amount || amount <= 0) {
      return res.json({ success: false, message: "Tip inválido" });
    }

    /* =============================
       BUSCAR MEME
    ============================== */
    const memeRes = await db.query(
      `SELECT user_id FROM memes WHERE id = $1`,
      [memeId]
    );

    if (!memeRes.rows[0]) {
      return res.json({ success: false, message: "Meme não encontrado" });
    }

    const ownerId = memeRes.rows[0].user_id;

    if (ownerId === req.user.id) {
      return res.json({
        success: false,
        message: "Você não pode dar tip no próprio meme"
      });
    }

    /* =============================
       GATE (HBR OU NFT)
    ============================== */
    const allowed = await canEngage(req.user.wallet);
    if (!allowed) {
      return res.json({
        success: false,
        message: "Você precisa ter HBR ou NFT para dar tip"
      });
    }

    /* =============================
       SALDO HBR
    ============================== */
    const balance = await getHBRBalance(req.user.wallet);

    if (Number(balance) < amount) {
      return res.json({
        success: false,
        message: "Saldo HBR insuficiente"
      });
    }

    /* =============================
       REGISTRAR TIP
    ============================== */
    await db.query("BEGIN");

    await db.query(
      `
      INSERT INTO meme_tips
        (meme_id, from_user_id, to_user_id, amount)
      VALUES ($1, $2, $3, $4)
      `,
      [memeId, req.user.id, ownerId, amount]
    );

    await db.query(
      `
      UPDATE memes
      SET tips_hbr = tips_hbr + $1
      WHERE id = $2
      `,
      [amount, memeId]
    );

    await db.query("COMMIT");

    res.json({ success: true });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("TIP ERROR:", err);
    res.status(500).json({ success: false });
  }
});
