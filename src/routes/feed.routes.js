import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// mock temporário
const POSTS = [];

/**
 * GET /feed
 */
router.get("/", authMiddleware, (req, res) => {
  res.json({
    success: true,
    posts: POSTS.slice(-20).reverse()
  });
});

/**
 * POST /feed
 * Apenas Founders no Alpha
 */
router.post("/", authMiddleware, async (req, res) => {
  const { text, image } = req.body;

  if (!text || text.length < 2) {
    return res.json({ success: false, message: "Post inválido" });
  }

  // aqui depois entra NFT gating real
  const post = {
    id: Date.now(),
    author: req.user.wallet,
    text,
    image: image || null,
    created_at: new Date().toISOString()
  };

  POSTS.push(post);

  res.json({ success: true, post });
});

export default router;
