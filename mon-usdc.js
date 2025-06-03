require("dotenv").config();
const { ethers } = require("ethers");

const ERC20_ABI = [
  "function approve(address spender, uint amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint)"
];

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const router = new ethers.Contract(process.env.ROUTER_ADDRESS, ROUTER_ABI, wallet);

  const MON = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  const USDC = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";

  const monToken = new ethers.Contract(MON, ERC20_ABI, wallet);
  const usdcToken = new ethers.Contract(USDC, ERC20_ABI, wallet);

  const minMon = ethers.utils.parseUnits("0.1", 18);
  const to = wallet.address;

  console.log("🔓 Approving MON & USDC...");
  await (await monToken.approve(router.address, ethers.constants.MaxUint256)).wait();
  await (await usdcToken.approve(router.address, ethers.constants.MaxUint256)).wait();
  console.log("✅ Approval done.\n");

  let loop = 1;
  while (true) {
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const monBalance = await monToken.balanceOf(to);
    const usdcBalance = await usdcToken.balanceOf(to);

    console.log(`\n🔁 Loop #${loop}`);
    console.log(`MON: ${ethers.utils.formatUnits(monBalance, 18)} | USDC: ${ethers.utils.formatUnits(usdcBalance, 18)}`);

    // 🛑 Stop jika MON < 0.1
    if (monBalance.lt(minMon)) {
      console.warn("⛔ MON balance < 0.1 — stopping bot.");
      break;
    }

    // ➡️ MON → USDC (10% dari saldo MON)
    const monToSwap = monBalance.div(10); // 10%
    if (monToSwap.gt(0)) {
      try {
        const expected = await router.getAmountsOut(monToSwap, [MON, USDC]);
        const amountOutMin = expected[1].mul(97).div(100); // slippage 3%

        console.log(`➡️ Swapping ${ethers.utils.formatUnits(monToSwap, 18)} MON → USDC...`);
        const txA = await router.swapExactTokensForTokens(
          monToSwap,
          amountOutMin,
          [MON, USDC],
          to,
          deadline,
          {
            gasLimit: 250_000,
            gasPrice: ethers.utils.parseUnits("55", "gwei"),
          }
        );
        console.log(`🟢 TX: ${txA.hash}`);
        await txA.wait();
        console.log(`✅ MON → USDC confirmed.`);
      } catch (err) {
        console.error("❌ Error MON → USDC:", err.reason || err.message || err);
        break;
      }
    }

    await new Promise(res => setTimeout(res, 5000));

    // ⬅️ USDC → MON (100% dari saldo USDC)
    const usdcToSwap = await usdcToken.balanceOf(to);
    if (usdcToSwap.gt(0)) {
      try {
        const expectedBack = await router.getAmountsOut(usdcToSwap, [USDC, MON]);
        const amountOutMinBack = expectedBack[1].mul(97).div(100); // slippage 3%

        console.log(`⬅️ Swapping ${ethers.utils.formatUnits(usdcToSwap, 18)} USDC → MON...`);
        const txB = await router.swapExactTokensForTokens(
          usdcToSwap,
          amountOutMinBack,
          [USDC, MON],
          to,
          deadline,
          {
            gasLimit: 250_000,
            gasPrice: ethers.utils.parseUnits("55", "gwei"),
          }
        );
        console.log(`🟢 TX: ${txB.hash}`);
        await txB.wait();
        console.log(`✅ USDC → MON confirmed.`);
      } catch (err) {
        console.error("❌ Error USDC → MON:", err.reason || err.message || err);
        break;
      }
    }

    loop++;
    await new Promise(res => setTimeout(res, 5000));
  }

  console.log("\n✅ BOT STOPPED: MON < 0.1 threshold tercapai.");
}

main().catch(console.error);
