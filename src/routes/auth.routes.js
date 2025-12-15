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
  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.json({ success: false, message: "Dados inválidos" });
    }

    const nonce = req.cookies?.hbr_nonce;

    if (!nonce) {
      return res.json({
        success: false,
        message: "Nonce ausente (cookie não encontrado)"
      });
    }

    // =====================================================
    // valida assinatura
    // =====================================================
    const valid = verifySignature({
      address,
      message,
      signature,
      expectedNonce: nonce
    });

    if (!valid) {
      return res.json({
        success: false,
        message: "Assinatura inválida"
      });
    }

    // =====================================================
    // BUSCAR OU CRIAR USUÁRIO (SEM ON CONFLICT)
    // =====================================================
    const wallet = address.toLowerCase();

    const existing = await db.query(
      `
      SELECT id, wallet, setup_completed
      FROM users
      WHERE wallet = $1
      `,
      [wallet]
    );

    const isFounder = await checkFounder(address);

await db.query(
  `
  UPDATE users
  SET is_founder = $1
  WHERE wallet = $2
  `,
  [isFounder, address]
);


    let user;

    if (existing.rows.length > 0) {
      user = existing.rows[0];
    } else {
      const created = await db.query(
        `
        INSERT INTO users (wallet)
        VALUES ($1)
        RETURNING id, wallet, setup_completed
        `,
        [wallet]
      );

      user = created.rows[0];
    }

    // =====================================================
    // JWT + COOKIE
    // =====================================================
    const token = jwt.sign(
      { id: user.id, wallet: user.wallet },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.clearCookie("hbr_nonce");

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

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erro interno no login"
    });
  }
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
/**
 * POST /auth/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("hbr_auth", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  res.clearCookie("hbr_nonce", {
    httpOnly: true,
    sameSite: "none",
    secure: true
  });

  return res.json({ success: true });
});

export default router;
