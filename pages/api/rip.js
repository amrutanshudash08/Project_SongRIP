export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const backend = process.env.NEXT_PUBLIC_API_URL;
    const upstream = await fetch(`${backend}/rip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    let data;
    try {
      data = await upstream.json();
    } catch {
      throw new Error(`Server error (${upstream.status}) — backend may be starting up, wait 10s and retry.`);
    }
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
