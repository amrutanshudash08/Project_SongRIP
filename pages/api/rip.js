export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let { url } = req.body;

    // Extract URL from share message text
    const urlMatch = url.match(/https?:\/\/\S+/);
    if (urlMatch) url = urlMatch[0].replace(/['".,)]+$/, '');

    // ── StarMaker ──────────────────────────────────────────────────────
    if (url.includes('starmaker') || url.includes('starmakerstudios')) {
      const params = new URL(url).searchParams;
      const recordingId = params.get('recordingId');
      if (!recordingId) throw new Error('Could not find recording ID in StarMaker link.');

      const audioUrl = `https://static-v7.smintro.com/production/uploading/recordings/${recordingId}/master.mp4`;
      return res.json({ url: audioUrl, filename: `starmaker-${recordingId}.mp4`, title: `StarMaker Recording`, ext: 'mp4' });
    }

    // ── Smule ──────────────────────────────────────────────────────────
    if (url.includes('smule.com')) {
      const backend = process.env.NEXT_PUBLIC_API_URL;
      const upstream = await fetch(`${backend}/rip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      let data;
      try { data = await upstream.json(); } catch { throw new Error(`Backend error (${upstream.status})`); }
      return res.status(upstream.status).json(data);
    }

    throw new Error('Unsupported platform. Use Smule or StarMaker.');

  } catch (e) {
    res.status(422).json({ error: e.message });
  }
}
