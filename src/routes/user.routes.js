import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();

/**
 * GET /user/me
 * Retorna perfil do usuário autenticado
 */
router.get("/me", authMiddleware, async (req, res) => {
  const { rows } = await db.query(
    `
    SELECT wallet, username, avatar_url, setup_completed
    FROM users
    WHERE id = $1
    `,
    [req.user.id]
  );

  const user = rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Usuário não encontrado"
    });
  }

  res.json({
    success: true,
    user
  });
});

export default router;
