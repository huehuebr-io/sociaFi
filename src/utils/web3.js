import { ethers } from "ethers";

export function verifySignature(address, message, signature) {
  const signer = ethers.verifyMessage(message, signature);
  return signer.toLowerCase() === address.toLowerCase();
}
