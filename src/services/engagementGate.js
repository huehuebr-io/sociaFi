import { getHBRBalance } from "./hbr.js";
import { checkFounder } from "./founder.js";

export async function canEngage(wallet) {
  if (!wallet) return false;

  try {
    const hbr = await getHBRBalance(wallet);
    if (hbr >= 1) return true;

    const founder = await checkFounder(wallet);
    if (founder) return true;

    return false;

  } catch (err) {
    console.error("ENGAGEMENT GATE ERROR:", err);
    return false;
  }
}
