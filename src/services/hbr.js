import { ethers } from "ethers";

/**
 * CONFIG
 */
const HBR_ADDRESS = process.env.HBR_CONTRACT.toLowerCase();
const BSC_RPC = process.env.BSC_RPC;

/**
 * ABI mínima (balanceOf)
 */
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

export async function getHBRBalance(wallet) {
  try {
    if (!wallet) return 0;

    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const contract = new ethers.Contract(
      HBR_ADDRESS,
      ERC20_ABI,
      provider
    );

    const balance = await contract.balanceOf(wallet);
    return Number(ethers.formatUnits(balance, 18));

  } catch (err) {
    console.error("HBR BALANCE ERROR:", err.message);
    return 0;
  }
}
