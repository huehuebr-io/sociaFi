import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db.js";
import { verifySignature } from "../utils/web3.js";

const router = express.Router();

/**
 * GET /auth/nonce
 */
router.get("/nonce", (req, res) => {
  const nonce = crypto.randomUUID();

  res.cookie("hbr_nonce", nonce, {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  res.json({ nonce });
});

/**
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  const { address, message, signature } = req.body;

  if (!address || !message || !signature) {
    return res.json({ success: false, message: "Dados inválidos" });
  }

  const expectedNonce = req.cookies?.hbr_nonce;
  if (!expectedNonce) {
    return res.json({ success: false, message: "Nonce ausente ou expirado" });
  }

  // valida assinatura + nonce + prefixo
  const valid = verifySignature({
    address,
    message,
    signature,
    expectedNonce
  });

  if (!valid) {
    return res.json({ success: false, message: "Assinatura inválida" });
  }

  // consome nonce (anti replay)
  res.clearCookie("hbr_nonce", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  // cria usuário se não existir
  const userRes = await db.query(
    `INSERT INTO users (wallet)
     VALUES ($1)
     ON CONFLICT (wallet)
     DO UPDATE SET wallet = EXCLUDED.wallet
     RETURNING id, wallet, setup_completed`,
    [address.toLowerCase()]
  );

  const user = userRes.rows[0];

  // cria JWT
  const token = jwt.sign(
    { id: user.id, wallet: user.wallet },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // salva JWT em cookie
  res.cookie("hbr_auth", token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    new_user: !user.setup_completed
  });
});

/**
 * GET /auth/me
 */
router.get("/me", (req, res) => {
  const token = req.cookies?.hbr_auth;
  if (!token) {
    return res.json({ logged: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      logged: true,
      address: decoded.wallet
    });

  } catch {
    res.json({ logged: false });
  }
});

/**
 * POST /auth/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("hbr_auth", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  res.json({ success: true });
});

export default router;
