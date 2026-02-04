// api/positions.js
// Basit JSON dosyası ile pozisyon saklama (demo amaçlı)

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join('/tmp', 'ai-trade-bot-positions.json');

async function readPositions() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

async function writePositions(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

function getAuthHeader(req) {
  return req.headers.authorization || req.headers.Authorization || '';
}

function requireAuth(req, res) {
  const authHeader = getAuthHeader(req);
  const expectedSecret = process.env.EXECUTOR_SECRET;

  if (!expectedSecret) {
    res.status(500).json({ error: 'EXECUTOR_SECRET not configured' });
    return false;
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

function normalizeBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return req.body;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!requireAuth(req, res)) {
    return;
  }

  if (req.method === 'GET') {
    const status = (req.query && req.query.status) || null;
    const chainId = (req.query && req.query.chainId) || null;

    const items = await readPositions();
    const filtered = items.filter((p) => {
      if (status && p.status !== status) return false;
      if (chainId && String(p.chainId) !== String(chainId)) return false;
      return true;
    });

    // n8n HTTP Request, JSON array dönerse her item'i ayrı item olarak ele alır
    return res.status(200).json(filtered);
  }

  if (req.method === 'POST') {
    const body = normalizeBody(req);

    const now = new Date().toISOString();
    const newPosition = {
      id: crypto.randomUUID(),
      status: body.status || 'open',
      createdAt: now,
      updatedAt: now,
      tokenSymbol: body.tokenSymbol,
      tokenAddress: body.tokenAddress,
      amountUsdc: body.amountUsdc,
      entryPrice: body.entryPrice,
      takeProfitPrice: body.takeProfitPrice,
      stopLossPrice: body.stopLossPrice,
      txHash: body.txHash,
      chainId: body.chainId,
      takerAddress: body.takerAddress,
      meta: body.meta || {}
    };

    const items = await readPositions();
    items.push(newPosition);
    await writePositions(items);

    return res.status(200).json(newPosition);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
