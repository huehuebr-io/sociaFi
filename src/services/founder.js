import Moralis from "moralis";

if (!Moralis.Core.isStarted) {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  });
}

export async function checkFounder(wallet) {
  const response = await Moralis.EvmApi.nft.getWalletNFTs({
    address: wallet,
    chain: "0x38",
    tokenAddresses: [process.env.FOUNDER_CONTRACT]
  });

  return response.result.length > 0;
}
