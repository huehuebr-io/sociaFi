// routes/meme.routes.js
const router = express.Router();
import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth.js";
import { db } from "../db.js";

export default router;
const router = express.Router();

// ================== UPLOAD CONFIG ==================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ================== POST MEME ==================
router.post("/", authMiddleware, upload.single("media"), async (req, res) => {
  const { caption, category } = req.body;

  if (!req.file) {
    return res.json({ success: false, message: "Imagem obrigatória" });
  }

  // (ALPHA) aqui depois entra o gating Founder real
  const mediaUrl = `/uploads/${req.file.filename}`;

  const { rows } = await db.query(
    `
    INSERT INTO memes (user_id, caption, media_url, category)
    VALUES ($1, $2, $3, $4)
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
});
/**
 * GET /memes/:id
 * Ver meme público
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { rows } = await db.query(
    `
    SELECT m.id, m.caption, m.media_url, m.category, m.created_at,
           u.username, u.wallet, u.avatar_url
    FROM memes m
    JOIN users u ON u.id = m.user_id
    WHERE m.id = $1
    `,
    [id]
  );

  if (!rows[0]) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, meme: rows[0] });
});
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  const { rows } = await db.query(
    `
    SELECT c.text, c.created_at,
           u.username, u.avatar_url, u.wallet
    FROM meme_comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.meme_id = $1
    ORDER BY c.created_at ASC
    `,
    [id]
  );

  res.json({ success: true, comments: rows });
});
router.post("/:id/comments", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.length < 1) {
    return res.json({ success: false });
  }

  await db.query(
    `
    INSERT INTO meme_comments (meme_id, user_id, text)
    VALUES ($1, $2, $3)
    `,
    [id, req.user.id, text]
  );

  res.json({ success: true });
});
