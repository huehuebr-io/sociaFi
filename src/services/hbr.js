import Moralis from "moralis";

const HBR_ADDRESS = process.env.HBR_CONTRACT.toLowerCase();

export async function getHBRBalance(wallet) {
  if (!wallet) return 0;

  try {
    const res = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: "0x38",
      address: wallet
    });

    const tokens = res.result || [];

    const hbr = tokens.find(t => {
      if (!t?.token_address) return false;
      return t.token_address.toLowerCase() === HBR_ADDRESS;
    });

    if (!hbr) return 0;

    const balance =
      Number(hbr.balance) / 10 ** Number(hbr.decimals);

    return balance;

  } catch (err) {
    console.error("HBR BALANCE ERROR:", err);
    return 0; // 🔒 nunca quebra o sistema
  }
}
