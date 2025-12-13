import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { verifySignature } from "../utils/web3.js";

const router = express.Router();

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  const { address, message, signature } = req.body;

  if (!address || !message || !signature) {
    return res.json({ success: false, message: "Dados inválidos" });
  }

  const valid = verifySignature(address, message, signature);
  if (!valid) {
    return res.json({ success: false, message: "Assinatura inválida" });
  }

  // cria usuário se não existir
  const userRes = await db.query(
    `INSERT INTO users (wallet)
     VALUES ($1)
     ON CONFLICT (wallet) DO UPDATE SET wallet = EXCLUDED.wallet
     RETURNING id, wallet, setup_completed`,
    [address.toLowerCase()]
  );

  const user = userRes.rows[0];

  const token = jwt.sign(
    { id: user.id, wallet: user.wallet },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    setup_completed: user.setup_completed
  });
});

export default router;
