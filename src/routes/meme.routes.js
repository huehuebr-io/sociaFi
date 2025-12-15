// src/routes/meme.routes.js
import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";
import { checkFounder } from "../services/founder.js";

const router = express.Router();
export default router;

/* =====================================================
   UPLOAD CONFIG (MEMORY — Railway Safe)
===================================================== */
const upload = multer({
  storage: multer.memoryStorage(), // 🔥 IMPORTANTE
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Formato inválido"));
    }
    cb(null, true);
  }
});

/* =====================================================
   POST MEME (FOUNDER ONLY — ON-CHAIN)
===================================================== */
router.post(
  "/",
  authMiddleware,
  upload.single("media"),
  async (req, res) => {
    try {
      // 🔒 1) Verificar Founder ON-CHAIN
      const isFounder = await checkFounder(req.user.wallet);

      if (!isFounder) {
        return res.json({
          success: false,
          message: "Apenas Founders podem postar memes no momento."
        });
      }

      // 🔒 2) Validar imagem
      if (!req.file) {
        return res.json({
          success: false,
          message: "Imagem obrigatória."
        });
      }

      const { caption, category } = req.body;

      // =====================================================
      // 🚀 3) Upload para huehuebr.io (API externa)
      // =====================================================
      const mediaUrl = await uploadToHueHueBR(req.file);

      // 💾 4) Salvar no banco
      const { rows } = await db.query(
        `
        INSERT INTO memes
          (user_id, caption, media_url, category, is_nft, created_at)
        VALUES
          ($1, $2, $3, $4, false, NOW())
        RETURNING id
        `,
        [
          req.user.id,
          caption || null,
          mediaUrl,
          category || "Geral"
        ]
      );

      res.json({
        success: true,
        meme_id: rows[0].id
      });

    } catch (err) {
      console.error("POST MEME ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Erro interno ao postar meme."
      });
    }
  }
);

/* =====================================================
   GET MEME PÚBLICO
===================================================== */
router.get("/:id", async (req, res) => {
  const { rows } = await db.query(
    `
    SELECT m.*, u.username, u.wallet, u.avatar_url
    FROM memes m
    JOIN users u ON u.id = m.user_id
    WHERE m.id = $1
    `,
    [req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, meme: rows[0] });
});
