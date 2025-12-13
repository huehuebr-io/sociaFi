import express from "express";
import Moralis from "moralis";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// inicializa Moralis UMA VEZ
if (!Moralis.Core.isStarted) {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });
}

/**
 * GET /nft/founders
 * Retorna SOMENTE NFTs Founder da wallet do usuário
 */
router.get("/founders", authMiddleware, async (req, res) => {
  try {
    const wallet = req.user.wallet.toLowerCase();

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: wallet,
      chain: "0x38", // BSC
      tokenAddresses: [process.env.FOUNDER_CONTRACT]
    });

    const items = response.result.map(nft => ({
      id: nft.tokenId,
      image: nft.metadata?.image
        ? nft.metadata.image.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          )
        : "https://huehuebr.io/assets/default-avatar.png"
    }));

    res.json({
      success: true,
      items
    });

  } catch (err) {
    console.error("NFT FOUNDERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Falha ao consultar NFTs"
    });
  }
});

export default router;
