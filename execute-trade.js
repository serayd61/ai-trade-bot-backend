// api/execute-trade.js
// Bu dosyayı Vercel'e deploy et

const { ethers } = require('ethers');

// Base Network RPC
const BASE_RPC = 'https://mainnet.base.org';

// 0x AllowanceHolder kontrat adresi (Base)
const ALLOWANCE_HOLDER = '0x0000000000001fF3684f28c67538d4D072C22734';

// ERC20 ABI (approve için)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)'
];

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorization check
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.EXECUTOR_SECRET;
  
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { 
    transaction, 
    action, 
    needsAllowance, 
    allowanceTarget, 
    sellToken, 
    sellAmount 
  } = req.body;

  // Private key from environment
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKey) {
    return res.status(500).json({ error: 'Private key not configured' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('🚀 Trade başlatılıyor...');
    console.log('Action:', action);
    console.log('Wallet:', wallet.address);

    // 1. Bakiye kontrolü
    const balance = await provider.getBalance(wallet.address);
    console.log('ETH Balance:', ethers.formatEther(balance));

    if (balance < ethers.parseEther('0.001')) {
      return res.status(400).json({ 
        error: 'Yetersiz ETH bakiyesi (gas için)',
        balance: ethers.formatEther(balance)
      });
    }

    // 2. Allowance kontrolü ve ayarlama
    if (needsAllowance && sellToken) {
      console.log('📝 Allowance ayarlanıyor...');
      
      const tokenContract = new ethers.Contract(sellToken, ERC20_ABI, wallet);
      
      // Mevcut allowance kontrol
      const currentAllowance = await tokenContract.allowance(
        wallet.address, 
        allowanceTarget || ALLOWANCE_HOLDER
      );
      
      console.log('Current allowance:', currentAllowance.toString());

      if (currentAllowance < BigInt(sellAmount)) {
        // Approve transaction
        const approveTx = await tokenContract.approve(
          allowanceTarget || ALLOWANCE_HOLDER,
          ethers.MaxUint256 // Sınırsız onay (veya sellAmount kullanabilirsin)
        );
        
        console.log('Approve TX:', approveTx.hash);
        await approveTx.wait();
        console.log('✅ Allowance ayarlandı');
      }
    }

    // 3. Swap transaction'ı gönder
    if (!transaction || !transaction.to || !transaction.data) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    console.log('💱 Swap yapılıyor...');

    const tx = await wallet.sendTransaction({
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || '0x0',
      gasLimit: transaction.gas ? BigInt(transaction.gas) * 12n / 10n : 300000n, // %20 buffer
    });

    console.log('TX Hash:', tx.hash);

    // Transaction'ın onaylanmasını bekle
    const receipt = await tx.wait();

    console.log('✅ Trade tamamlandı!');
    console.log('Block:', receipt.blockNumber);
    console.log('Gas used:', receipt.gasUsed.toString());

    return res.status(200).json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      action: action,
      explorerUrl: `https://basescan.org/tx/${receipt.hash}`
    });

  } catch (error) {
    console.error('❌ Trade hatası:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      reason: error.reason
    });
  }
};
