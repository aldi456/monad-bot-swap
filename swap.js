require("dotenv").config();
const { ethers } = require("ethers");

const ROUTER_ABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const router = new ethers.Contract(process.env.ROUTER_ADDRESS, ROUTER_ABI, wallet);

  const amountOutMin = 0n; // Adjust if decimals are known
  const path = [
    "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701", // MON contract
    "0xCc5B42F9d6144DFDFb6fb3987a2A916af902F5f8" // SC token
  ];
  const to = wallet.address;
  const ethAmount = ethers.utils.parseEther("0.03"); // jumlah monad token

  for (let i = 1; i <= 30; i++) {
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10-minute buffer
    console.log(`Sending swap transaction #${i}...`);
    try {
      const tx = await router.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        {
          value: ethAmount,
          gasLimit: 200_000,
          gasPrice: ethers.utils.parseUnits("65", "gwei"),
        }
      );
      console.log(`Transaction #${i} sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction #${i} confirmed in block ${receipt.blockNumber}`);
    } catch (err) {
      console.error(`Error on tx #${i}:`, err.reason || err.message || err);
    }

    await new Promise((res) => setTimeout(res, 2000)); // 2 second delay
  }

  console.log("All 30 swaps attempted.");
}

main().catch(console.error);
