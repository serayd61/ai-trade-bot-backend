// api/agent-signals.js
// Basit agent sinyal endpoint'i. Opsiyonel olarak bir URL'den proxy veya ENV'den statik JSON döner.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chain = (req.query && req.query.chain) || 'base';

  try {
    // 1) ENV ile statik JSON
    if (process.env.AGENT_SIGNALS_JSON) {
      const parsed = JSON.parse(process.env.AGENT_SIGNALS_JSON);
      return res.status(200).json(parsed);
    }

    // 2) Harici URL proxy
    if (process.env.AGENT_SIGNALS_URL) {
      const url = new URL(process.env.AGENT_SIGNALS_URL);
      url.searchParams.set('chain', chain);

      const r = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await r.json();
      return res.status(200).json(data);
    }

    // 3) Varsayılan boş liste
    return res.status(200).json([]);
  } catch (error) {
    console.error('Agent signals error:', error);
    return res.status(500).json({ error: error.message });
  }
};
