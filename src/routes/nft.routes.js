import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /nft/founders
 * Retorna NFTs Founder do usuário
 */
router.get("/founders", authMiddleware, async (req, res) => {
  // aqui você pode integrar Moralis depois
  // por enquanto mockado / placeholder
  res.json({
    success: true,
    items: [
      {
        id: "1",
        image: "https://huehuebr.io/nfts/huehuebr-founders/images/1.png"
      }
    ]
  });
});

export default router;
