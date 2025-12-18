import Moralis from "moralis";

/**
 * Retorna o saldo de HBR da wallet
 * @param {string} wallet
 * @returns {number}
 */
export async function getHBRBalance(wallet) {
  try {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY
      });
    }

    const res = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: "0x38", // BSC
      address: wallet
    });

    const tokens = res.result || [];

    const hbr = tokens.find(
      t => t.token_address.toLowerCase() ===
           process.env.HBR_CONTRACT.toLowerCase()
    );

    if (!hbr) return 0;

    // normalizar decimais
    const balance =
      Number(hbr.balance) / (10 ** Number(hbr.decimals));

    return balance;

  } catch (err) {
    console.error("HBR BALANCE ERROR:", err);
    return 0;
  }
}
