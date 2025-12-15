import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

const router = express.Router();
export default router;

/* =====================================================
   UPLOAD CONFIG (SEGURO)
===================================================== */
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Formato inválido"));
    }
    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: "uploads/memes",
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `meme_${Date.now()}${ext}`);
    }
  })
});

/* =====================================================
   POST MEME (FOUNDER ONLY)
===================================================== */
router.post(
  "/",
  authMiddleware,
  upload.single("media"),
  async (req, res) => {

    if (!req.user.is_founder) {
      return res.json({
        success: false,
        message: "Apenas Founders podem postar no momento"
      });
    }

    if (!req.file) {
      return res.json({
        success: false,
        message: "Imagem obrigatória"
      });
    }

    const { caption, category } = req.body;

    const mediaUrl = `/uploads/memes/${req.file.filename}`;

    const { rows } = await db.query(
      `
      INSERT INTO memes
        (user_id, caption, media_url, category, is_nft)
      VALUES
        ($1, $2, $3, $4, false)
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
