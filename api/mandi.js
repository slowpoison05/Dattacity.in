// Server-side Haryana mandi feed for DattaCity.
// The browser never calls the upstream site directly, avoiding iframe/CORS failures.
// Upstream sources: MandiBhavIndia (Agmarknet/eNAM/NECC) with BajarBhav as fallback.

const SOURCES = [
  'https://mandibhavindia.in/en/mandi/haryana',
  'https://www.bajarbhav.in/states/haryana'
];

function clean(value) {
  return String(value || '')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function price(value) {
  const text = clean(value).replace(/,/g, '');
  const match = text.match(/(?:₹|Rs\.?\s*)?([0-9]+(?:\.[0-9]+)?)/i);
  return match ? Number(match[1]) : null;
}

function parseRows(html) {
  const records = [];
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = (row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(clean);
    if (cells.length < 4) continue;

    const numeric = cells.slice(-3).map(price);
    if (numeric.some(v => v === null)) continue;

    let commodity = '';
    let market = '';
    if (cells.length >= 5) {
      commodity = cells[0];
      market = cells[1];
    } else {
      commodity = cells[0];
      market = 'हरियाणा';
    }

    if (!commodity || /^(commodity|market)$/i.test(commodity)) continue;
    if (/^advertisement$/i.test(commodity)) continue;

    records.push({
      commodity: commodity.replace(/\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i, '').trim(),
      market,
      min_price: numeric[0],
      max_price: numeric[1],
      modal_price: numeric[2]
    });
  }

  // Remove duplicate rows while preserving the newest table ordering.
  const seen = new Set();
  return records.filter(r => {
    const key = [r.commodity, r.market, r.min_price, r.max_price, r.modal_price].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractUpdatedAt(html) {
  const text = clean(html);
  const patterns = [
    /(?:last updated|updated today|latest report)\s*:?\s*([^.|]{3,60})/i,
    /(?:as of)\s+([^.|]{3,50})/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return new Date().toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const errors = [];

  for (const source of SOURCES) {
    try {
      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DattaCity/1.0; +https://dattacity.in)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        errors.push(`${source}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const records = parseRows(html);

      if (records.length < 3) {
        errors.push(`${source}: no usable price rows`);
        continue;
      }

      return res.status(200).json({
        source,
        sourceLabel: source.includes('mandibhavindia') ? 'Agmarknet / eNAM / NECC' : 'Agmarknet / APMC',
        updatedAt: extractUpdatedAt(html),
        retrievedAt: new Date().toISOString(),
        unit: '₹/क्विंटल',
        records
      });
    } catch (error) {
      errors.push(`${source}: ${error.message}`);
    }
  }

  return res.status(502).json({
    error: 'Live mandi feed unavailable',
    details: errors
  });
}
