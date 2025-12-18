import { checkFounder } from "./founder.js";
import { getHBRBalance } from "./hbr.js";

/**
 * Regra oficial de engajamento HueHueBR
 */
export async function canEngage(wallet) {
  try {
    // 👑 Founder sempre pode
    const isFounder = await checkFounder(wallet);
    if (isFounder) return true;

    // 💰 Holder HBR
    const hbrBalance = await getHBRBalance(wallet);
    if (hbrBalance >= 1) return true;

    return false;

  } catch (err) {
    console.error("ENGAGEMENT GATE ERROR:", err);
    return false;
  }
}
