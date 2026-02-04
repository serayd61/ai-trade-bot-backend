# 🤖 AI Trade Bot - Base Network

Autonomous AI-powered trading bot for Base network. Finds trending tokens, executes trades, and manages positions with automatic Take Profit (+20%) and Stop Loss (-10%).

![Base Network](https://img.shields.io/badge/Network-Base-blue)
![n8n](https://img.shields.io/badge/Automation-n8n-orange)
![Claude AI](https://img.shields.io/badge/AI-Claude-purple)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## 🎯 Features

- **🔍 Trending Token Hunter** - Scans Base network for hot tokens every 5 minutes
- **🧠 AI-Powered Decisions** - Claude AI analyzes and decides whether to buy
- **💰 Auto Trading** - Executes trades via 0x DEX aggregator
- **📊 Position Monitor** - Tracks open positions every minute
- **✅ Take Profit** - Auto-sells at +20% profit
- **🛑 Stop Loss** - Auto-sells at -10% loss
- **📱 Telegram Alerts** - Real-time notifications for all actions

## 📁 Project Structure

```
ai-trade-bot-backend/
├── api/
│   └── execute-trade.js    # Trade execution endpoint
├── package.json            # Dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-trade-bot-backend)

### Option 2: Manual Deploy

1. **Fork/Clone this repo**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import this repository
   - Click "Deploy"

3. **Add Environment Variables**
   
   Go to Project Settings → Environment Variables and add:

   | Name | Description |
   |------|-------------|
   | `WALLET_PRIVATE_KEY` | Your Base wallet private key (0x...) |
   | `EXECUTOR_SECRET` | A secure password for API auth |

   ⚠️ **NEVER share your private key!**

4. **Redeploy** after adding environment variables

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | ✅ | Private key of your Base wallet |
| `EXECUTOR_SECRET` | ✅ | Secret token for API authentication |

## 📡 API Endpoint

### Execute Trade

```
POST /api/execute-trade
```

**Headers:**
```
Authorization: Bearer YOUR_EXECUTOR_SECRET
Content-Type: application/json
```

**Body:**
```json
{
  "transaction": {
    "to": "0x...",
    "data": "0x...",
    "value": "0x0",
    "gas": "200000"
  },
  "action": "BUY",
  "needsAllowance": true,
  "allowanceTarget": "0x...",
  "sellToken": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "sellAmount": "5000000"
}
```

**Success Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 12345678,
  "gasUsed": "150000",
  "action": "BUY",
  "explorerUrl": "https://basescan.org/tx/0x..."
}
```

## 🔧 n8n Workflow Setup

After deploying the backend, configure n8n:

1. **Import workflows** (from releases or n8n-workflows folder)
   - `ai-token-hunter-v1.json` - Token scanner & buyer
   - `ai-position-monitor.json` - Position tracker & seller

2. **Update Execute Trade nodes** with:
   - URL: `https://YOUR-APP.vercel.app/api/execute-trade`
   - Authorization: `Bearer YOUR_EXECUTOR_SECRET`

3. **Connect Telegram credential**

4. **Activate workflows**

## 💰 Wallet Setup

Before running:

1. **Create a new wallet** (recommended for security)
2. **Fund with ETH** for gas (~0.005 ETH)
3. **Fund with USDC** for trading (start with $50)

**Token Addresses (Base):**
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- WETH: `0x4200000000000000000000000000000000000006`

## 📊 Trading Strategy

| Parameter | Value |
|-----------|-------|
| Network | Base |
| Trade Size | Max 5 USDC per trade |
| Take Profit | +20% |
| Stop Loss | -10% |
| Min Liquidity | $50,000 |
| Min Volume | $100,000 |
| Scan Interval | 5 minutes |
| Monitor Interval | 1 minute |

## 🔒 Security

- ✅ Private key stored only in Vercel env vars
- ✅ API protected with Bearer token
- ✅ HTTPS enforced by Vercel
- ✅ Rate limiting built-in
- ⚠️ Never commit private keys to git
- ⚠️ Use a dedicated trading wallet

## 🧪 Testing

1. Deploy with small amounts first ($5-10 USDC)
2. Run workflows manually to test
3. Check Telegram for notifications
4. Verify transactions on [BaseScan](https://basescan.org)

## 📝 Logs & Debugging

View logs in Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Select latest deployment
4. Click "Functions" → "execute-trade"
5. View real-time logs

## ⚠️ Disclaimer

**This bot is for educational purposes. Cryptocurrency trading involves substantial risk of loss. Only trade with funds you can afford to lose. The authors are not responsible for any financial losses.**

## 🛠️ Tech Stack

- **Backend:** Node.js, Vercel Serverless
- **Blockchain:** ethers.js, Base Network
- **DEX:** 0x Protocol API
- **AI:** Claude (Anthropic)
- **Automation:** n8n
- **Data:** DexScreener, CoinGecko

## 📄 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first.

---

**Built with ❤️ for the Base ecosystem**
