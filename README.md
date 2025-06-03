# 🪙 Monad Swap Bot (MON ↔ USDC)

Bot ini secara otomatis melakukan swap token MON ↔ USDC di jaringan Monad Testnet.  
Dirancang untuk berjalan **di Termux Android**, dengan fitur:

- 🔁 Swap bolak-balik MON → USDC → MON
- ⚖️ Swap 10% saldo MON → USDC dan 100% saldo USDC → MON
- ⛔ Auto-stop jika saldo MON < 0.1 MON
- 💨 Delay otomatis antar transaksi
## 📦 File Penting

| File         | Deskripsi |
|--------------|-----------|
| `mon-usdc.js` | Script bot swap utama |
| `.env`       | Menyimpan private key dan endpoint |

---

## 📲 Cara Jalankan Bot di Termux

### 1. Clone Repo
```bash
pkg install git -y
git clone https://github.com/USERNAME/monad-swap-bot.git
cd monad-swap-bot
   
