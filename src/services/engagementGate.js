import Moralis from "moralis";

if (!Moralis.Core.isStarted) {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });
}

/**
 * Verifica se o usuário pode interagir (like, comment, post)
 */
export async function canEngage(wallet) {
  const address = wallet.toLowerCase();

  /* =============================
     1) CHECK HBR BALANCE
  ============================== */
  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: "0x38", // BSC
    address
  });

  const hasHBR = tokens.result.some(
    t => t.tokenAddress.toLowerCase() ===
         process.env.HBR_CONTRACT.toLowerCase() &&
         Number(t.balance) > 0
  );

  if (hasHBR) return true;

  /* =============================
     2) CHECK NFT FOUNDER
  ============================== */
  const founderNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: "0x38",
    address,
    tokenAddresses: [process.env.FOUNDER_CONTRACT]
  });

  if (founderNFTs.result.length > 0) return true;

  /* =============================
     3) CHECK NFT HUEZIN (FUTURO)
  ============================== */
/*  if (process.env.HUEZIN_CONTRACT) {
    const huezinNFTs = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: "0x38",
      address,
      tokenAddresses: [process.env.HUEZIN_CONTRACT]
    });

    if (huezinNFTs.result.length > 0) return true;
  }

  return false;
}*/
