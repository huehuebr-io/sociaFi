import express from "express";
import Moralis from "moralis";

const router = express.Router();

// init Moralis uma vez
let moralisStarted = false;
async function initMoralis() {
  if (!moralisStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY
    });
    moralisStarted = true;
  }
}

/**
 * GET /nft/founders
 * Retorna NFTs Founder do usuário autenticado
 */
router.get("/founders", authMiddleware, async (req, res) => {
  try {
    await initMoralis();

    const wallet = req.user.wallet;
    const contract = process.env.FOUNDER_CONTRACT;

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: wallet,
      chain: process.env.BSC_CHAIN || "0x38",
      tokenAddresses: [contract],
      normalizeMetadata: true
    });

    const nfts = response.result || [];

    const items = nfts.map(nft => ({
      id: nft.tokenId,
      image: nft.normalized_metadata?.image || null,
      name: nft.normalized_metadata?.name || "Founder NFT"
    })).filter(n => n.image);

    res.json({
      success: true,
      hasFounder: items.length > 0,
      items
    });

  } catch (err) {
    console.error("Erro Moralis:", err);
    res.status(500).json({
      success: false,
      message: "Falha ao consultar NFTs"
    });
  }
});

export default router;
