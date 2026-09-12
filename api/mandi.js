// Server-side Haryana/Hisar mandi feed for DattaCity.
// The browser calls this route instead of a third-party iframe/CORS endpoint.
// Source data is daily wholesale mandi data; no prices are fabricated.

const SOURCES = [
  {
    url: 'https://mandibhavindia.in/en/mandi/haryana/hisar',
    label: 'Agmarknet / eNAM / NECC — Hisar district'
  },
  {
    url: 'https://farmer.in/mandi/haryana/hansi-apmc/',
    label: 'Agmarknet — Hansi APMC'
  },
  {
    url: 'https://farmer.in/mandi/haryana/barwala-hisar-apmc/',
    label: 'Agmarknet — Barwala(Hisar) APMC'
  }
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

function parseRows(html, source) {
  const records = [];
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = (row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) || []).map(clean);
    if (cells.length < 4) continue;

    let commodity = '';
    let market = '';
    let min = null;
    let max = null;
    let modal = null;

    if (source.url.includes('farmer.in')) {
      // Farmer.in market pages use Commodity | Min | Max | Modal.
      commodity = cells[0];
      min = price(cells[1]);
      max = price(cells[2]);
      modal = price(cells[3]);
      market = source.url.includes('/hansi-') ? 'Hansi' : 'Barwala';
    } else {
      // MandiBhavIndia uses Commodity | Market | Min | Max | Modal.
      if (cells.length < 5) continue;
      commodity = cells[0];
      market = cells[1];
      min = price(cells[2]);
      max = price(cells[3]);
      modal = price(cells[4]);
    }

    if (!commodity || min === null || max === null || modal === null) continue;
    if (/^(commodity|market)$/i.test(commodity)) continue;
    if (/^advertisement$/i.test(commodity)) continue;

    commodity = commodity
      .replace(/\s*\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i, '')
      .trim();

    records.push({
      commodity,
      market,
      min_price: min,
      max_price: max,
      modal_price: modal
    });
  }

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
    /(?:last updated|updated today|latest report|updated)\s*:?\s*([^.|]{3,60})/i,
    /(?:as of)\s+([^.|]{3,50})/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return new Date().toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const errors = [];

  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DattaCity/1.0)',
          'Accept': 'text/html,application/xhtml+xml,text/html;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        errors.push(`${source.url}: HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      const records = parseRows(html, source);
      if (records.length < 3) {
        errors.push(`${source.url}: no usable price rows`);
        continue;
      }

      return res.status(200).json({
        source: source.url,
        sourceLabel: source.label,
        updatedAt: extractUpdatedAt(html),
        retrievedAt: new Date().toISOString(),
        unit: '₹/क्विंटल',
        records
      });
    } catch (error) {
      errors.push(`${source.url}: ${error.message}`);
    }
  }

  return res.status(502).json({ error: 'Live mandi feed unavailable', details: errors });
}
