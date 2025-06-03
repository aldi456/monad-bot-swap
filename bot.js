require("dotenv").config();
const { ethers } = require("ethers");

const ERC20_ABI = [
  "function approve(address spender, uint amount) external returns (bool)"
];

const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const router = new ethers.Contract(process.env.ROUTER_ADDRESS, ROUTER_ABI, wallet);
  const WMON = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  const BEAN = "0x268E4E24E0051EC27b3D27A95977E71cE6875a05";

  const wmonToken = new ethers.Contract(WMON, ERC20_ABI, wallet);

  const amountIn = ethers.utils.parseUnits("0.01", 18);
  const amountOutMin = 1; // bebas slippage untuk testing
  const path = [WMON, BEAN];
  const to = wallet.address;

  console.log("Approving WMON...");
  const approveTx = await wmonToken.approve(router.address, amountIn.mul(5));
  await approveTx.wait();
  console.log("Approval successful!");

  for (let i = 1; i <= 50; i++) {
    const deadline = Math.floor(Date.now() / 1000) + 600;
    console.log(`\nSwap #${i} - Swapping 0.01 WMON to BEAN...`);
    try {
      const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        {
          gasLimit: 200_000,
          gasPrice: ethers.utils.parseUnits("65", "gwei"),
        }
      );
      console.log(`TX #${i} sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`TX #${i} confirmed in block ${receipt.blockNumber}`);
    } catch (err) {
      console.error(`Error in TX #${i}:`, err.reason || err.message || err);
    }

    await new Promise((res) => setTimeout(res, 2000)); // delay 2 detik
  }

  console.log("\n✅ Selesai: 30x swap WMON → BEAN berhasil dicoba.");
}

main().catch(console.error);
