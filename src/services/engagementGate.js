import { getHBRBalance } from "./hbr.js";
import { checkFounder } from "./founder.js";

export async function canEngage(wallet) {
  if (!wallet) return false;

  try {
    const hbrBalance = await getHBRBalance(wallet);
    if (hbrBalance >= 1) return true;

    const isFounder = await checkFounder(wallet);
    if (isFounder) return true;

    return false;

  } catch (err) {
    console.error("ENGAGEMENT GATE ERROR:", err);
    return false;
  }
}
