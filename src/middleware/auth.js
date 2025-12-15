import jwt from "jsonwebtoken";
import { db } from "../db.js";

export async function authMiddleware(req, res, next) {
  const token = req.cookies?.hbr_auth;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Não autenticado"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 BUSCAR USUÁRIO REAL NO BANCO
    const { rows } = await db.query(
      `
      SELECT id, wallet, is_founder
      FROM users
      WHERE id = $1
      `,
      [decoded.id]
    );

    if (!rows[0]) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado"
      });
    }

    // 🔐 USUÁRIO COMPLETO
    req.user = {
      id: rows[0].id,
      wallet: rows[0].wallet,
      is_founder: rows[0].is_founder
    };

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({
      success: false,
      message: "Sessão inválida ou expirada"
    });
  }
}
