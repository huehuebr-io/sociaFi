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

/**
 * POST /user/setup
 * Finaliza onboarding SocialFi
 */
router.post("/setup", authMiddleware, async (req, res) => {
  const { username, bio, avatar_url, nft_id } = req.body;

  // valida username
  if (!username || !username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
    return res.json({
      success: false,
      message: "Username inválido"
    });
  }

  // username único
  const exists = await db.query(
    "SELECT 1 FROM users WHERE username = $1 AND id != $2",
    [username, req.user.id]
  );

  if (exists.rowCount > 0) {
    return res.json({
      success: false,
      message: "Username já em uso"
    });
  }

  // salva dados do setup
  await db.query(
    `
    UPDATE users SET
      username = $1,
      bio = $2,
      avatar_url = $3,
      avatar_nft_id = $4,
      setup_completed = true
    WHERE id = $5
    `,
    [
      username,
      bio || null,
      avatar_url || "/assets/default-avatar.png",
      nft_id || null,
      req.user.id
    ]
  );

  res.json({ success: true });
});

export default router;
