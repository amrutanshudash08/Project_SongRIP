export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: proxy audio file with correct headers for iOS ──────────────
  if (req.method === 'GET') {
    try {
      const { proxy, filename } = req.query;
      if (!proxy) return res.status(400).json({ error: 'No proxy URL' });
      const fileRes = await fetch(proxy);
      if (!fileRes.ok) throw new Error('Could not fetch audio.');
      res.setHeader('Content-Type', 'audio/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'recording.m4a'}"`);
      const buffer = await fileRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: extract audio URL ─────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { url } = req.body;

    // Extract URL from full share message text
    const urlMatch = url.match(/https?:\/\/\S+/);
    if (urlMatch) url = urlMatch[0].replace(/['".,)]+$/, '');

    // ── StarMaker ──────────────────────────────────────────────────────
    if (url.includes('starmaker') || url.includes('starmakerstudios')) {
      const params = new URL(url).searchParams;
      const recordingId = params.get('recordingId');
      if (!recordingId) throw new Error('Could not find recording ID in StarMaker link.');

      let title = `starmaker-${recordingId}`;

      // Strategy 1: Try StarMaker API with multiple field names
      try {
        const apiRes = await fetch(
          `https://www.starmakerstudios.com/api/social/recording/info?recordingId=${recordingId}`,
          { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
        );
        if (apiRes.ok) {
          const data = await apiRes.json();
          // Try every possible field name
          const raw =
            data?.data?.recordingName ||
            data?.data?.name ||
            data?.data?.songName ||
            data?.data?.song_name ||
            data?.data?.title ||
            data?.data?.song?.name ||
            data?.data?.song?.title ||
            data?.recording?.name ||
            data?.recording?.title ||
            data?.name ||
            data?.title ||
            '';
          if (raw) title = raw.replace(/[^\w\s\-()]/g, '').trim().slice(0, 80);
        }
      } catch (_) {}

      // Strategy 2: Fetch share page and extract og:title
      if (title.startsWith('starmaker-')) {
        try {
          const pageRes = await fetch(
            `https://m.starmakerstudios.com/a-vue3/playrecording?recordingId=${recordingId}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
          );
          if (pageRes.ok) {
            const html = await pageRes.text();
            const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/);
            const metaTitle = html.match(/<title>([^<]+)<\/title>/);
            const raw = ogTitle?.[1] || metaTitle?.[1] || '';
            if (raw && !raw.toLowerCase().includes('starmaker')) {
              title = raw.replace(/[^\w\s\-()]/g, '').trim().slice(0, 80);
            }
          }
        } catch (_) {}
      }

      const audioUrl = `https://static-v7.smintro.com/production/uploading/recordings/${recordingId}/master.mp4`;
      const filename = `${title}.m4a`;

      return res.json({
        url: `/api/rip?proxy=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(filename)}`,
        filename,
        title,
        ext: 'm4a',
      });
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
      try {
        data = await upstream.json();
      } catch {
        throw new Error(`Backend error (${upstream.status}) — try again in 10 seconds.`);
      }
      return res.status(upstream.status).json(data);
    }

    throw new Error('Unsupported platform. Use Smule or StarMaker.');

  } catch (e) {
    res.status(422).json({ error: e.message });
  }
}
