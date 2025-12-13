import { ethers } from "ethers";

/**
 * Verifica assinatura Web3 (robusto e compatível)
 */
export function verifySignature({
  address,
  message,
  signature,
  expectedNonce
}) {
  try {
    // 1️⃣ normalizar address
    const expectedAddress = address.toLowerCase();

    // 2️⃣ hash da mensagem (EIP-191)
    const messageHash = ethers.hashMessage(message);

    // 3️⃣ recuperar endereço que assinou
    const recoveredAddress = ethers.recoverAddress(
      messageHash,
      signature
    ).toLowerCase();

    if (recoveredAddress !== expectedAddress) {
      return false;
    }

    // 4️⃣ validar nonce (anti-replay)
    if (!message.includes(expectedNonce)) {
      return false;
    }

    // 5️⃣ validar prefixo (anti-phishing)
    if (!message.startsWith("HueHueBR SocialFi Login")) {
      return false;
    }

    return true;

  } catch (err) {
    console.error("verifySignature error:", err);
    return false;
  }
}
