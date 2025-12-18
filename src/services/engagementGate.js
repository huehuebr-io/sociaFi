import { getHBRBalance } from "./hbr.js";
import { checkFounder } from "./founder.js";

export async function canEngage(wallet) {
  try {
    if (!wallet) return false;

    // 1️⃣ HBR
    const hbr = await getHBRBalance(wallet);
    if (hbr >= 1) return true;

    // 2️⃣ NFT Founder
    const founder = await checkFounder(wallet);
    if (founder) return true;

    return false;

  } catch (err) {
    console.error("ENGAGEMENT GATE ERROR:", err.message);
    return false;
  }
}
