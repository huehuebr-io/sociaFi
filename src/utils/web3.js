import { ethers } from "ethers";

/**
 * Verifica assinatura Web3 com nonce
 */
export function verifySignature({
  address,
  message,
  signature,
  expectedNonce
}) {
  try {
    // 1️⃣ endereço que assinou
    const signer = ethers.verifyMessage(message, signature);

    if (signer.toLowerCase() !== address.toLowerCase()) {
      return false;
    }

    // 2️⃣ valida nonce dentro da mensagem
    if (!message.includes(expectedNonce)) {
      return false;
    }

    // 3️⃣ valida prefixo esperado (anti phishing)
    if (!message.startsWith("HueHueBR SocialFi Login")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
