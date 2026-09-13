export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, category, location, complaint } = req.body || {};
    if (!name || !phone || !location || !complaint) {
      return res.status(400).json({ error: 'Name, mobile, location and complaint are required.' });
    }

    // Server-side write. Keep the Firebase credential only in the hosting
    // environment; never expose it in browser JavaScript.
    const secret = process.env.FIREBASE_DATABASE_SECRET;
    if (!secret) return res.status(500).json({ error: 'Complaint server is not configured.' });

    const payload = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      category: String(category || 'Other').trim(),
      location: String(location).trim(),
      complaint: String(complaint).trim(),
      createdAt: Date.now(),
      status: 'submitted'
    };

    const url = `https://superkisan-33b7e-default-rtdb.firebaseio.com/complaints.json?auth=${encodeURIComponent(secret)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok || !data?.name) return res.status(502).json({ error: 'Could not save complaint.' });

    return res.status(200).json({ ok: true, id: data.name });
  } catch (e) {
    console.error('complaint API error', e);
    return res.status(500).json({ error: 'Could not submit complaint.' });
  }
}
