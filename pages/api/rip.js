export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { url } = req.body;

    // ── Step 1: Extract URL from full share message text ─────────────────
    const urlMatch = url.match(/https?:\/\/\S+/);
    if (!urlMatch) throw new Error('No URL found in the text you pasted.');
    url = urlMatch[0].replace(/['".,)]+$/, '');

    // ── Step 2: Detect platform ──────────────────────────────────────────
    const isSmule      = url.includes('smule.com');
    const isStarMaker  = url.includes('starmakerstudios.com') || url.includes('starmaker.us');

    if (!isSmule && !isStarMaker) {
      throw new Error('Unsupported platform. Use a Smule or StarMaker link.');
    }

    const HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    let audioUrl = null;
    let title = 'recording';

    // ════════════════════════════════════════════════════════════════════
    // SMULE
    // ════════════════════════════════════════════════════════════════════
    if (isSmule) {
      // Clean the URL
      const parsed = new URL(url);
      parsed.pathname = parsed.pathname.replace(
        /\/(twitter|facebook|instagram|whatsapp|copy|embed|frame\/box)\/?$/, ''
      );
      parsed.search = '';
      url = parsed.toString();

      async function extractFromHtml(html) {
        const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextData) {
          try {
            const str = JSON.stringify(JSON.parse(nextData[1]));
            const patterns = [
              /"media_url"\s*:\s*"([^"]+)"/,
              /"(https:\/\/[^"]+smule[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
              /"(https:\/\/storage\.googleapis[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
              /"(https:\/\/[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
            ];
            for (const p of patterns) { const m = str.match(p); if (m) return m[1]; }
          } catch (_) {}
        }
        const ogAudio = html.match(/property="og:audio(?::url)?"\s+content="([^"]+)"/);
        if (ogAudio) return ogAudio[1];
        const ogVideo = html.match(/property="og:video(?::url)?"\s+content="([^"]+)"/);
        if (ogVideo && !ogVideo[1].includes('/frame')) return ogVideo[1];
        const raw = html.match(/https:\/\/[^\s"'<>]+\.(?:m4a|mp4|aac|mp3)(?:\?[^\s"'<>]*)?/);
        if (raw) return raw[0];
        return null;
      }

      const pageRes = await fetch(url, { headers: HEADERS });
      if (!pageRes.ok) throw new Error(`Could not load Smule page (${pageRes.status})`);
      const html = await pageRes.text();

      const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/);
      if (ogTitle) title = ogTitle[1];

      audioUrl = await extractFromHtml(html);

      if (!audioUrl) {
        const ids = url.match(/(\d+_\d+)/);
        if (ids) {
          const apiRes = await fetch(`https://www.smule.com/api/v1/recording/${ids[1]}`, { headers: HEADERS });
          if (apiRes.ok) {
            try { const d = await apiRes.json(); audioUrl = d?.media_url || d?.data?.media_url; } catch (_) {}
          }
        }
      }

      if (!audioUrl) {
        const frameRes = await fetch(`${url}/frame/box`, { headers: HEADERS });
        if (frameRes.ok) audioUrl = await extractFromHtml(await frameRes.text());
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // STARMAKER
    // ════════════════════════════════════════════════════════════════════
    if (isStarMaker) {
      // Extract recordingId from URL params
      const parsed = new URL(url);
      const recordingId = parsed.searchParams.get('recordingId');

      if (!recordingId) throw new Error('Could not find recording ID in StarMaker link.');

      // Hit StarMaker's public API
      const apiRes = await fetch(
        `https://www.starmakerstudios.com/api/social/recording/info?recordingId=${recordingId}`,
        { headers: HEADERS }
      );

      if (!apiRes.ok) throw new Error(`StarMaker API error (${apiRes.status})`);
      const data = await apiRes.json();

      // Dig out the audio URL and title from the response
      title = data?.data?.recordingName
           || data?.data?.name
           || data?.recording?.name
           || 'recording';

      audioUrl = data?.data?.recordingUrl
              || data?.data?.audioUrl
              || data?.data?.mediaUrl
              || data?.recording?.recordingUrl;

      // Fallback: look for any audio URL in the raw response
      if (!audioUrl) {
        const str = JSON.stringify(data);
        const m = str.match(/"(https:\/\/[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/);
        if (m) audioUrl = m[1];
      }
    }

    if (!audioUrl) {
      throw new Error('Could not find audio. Try copying just the direct recording URL.');
    }

    const ext = audioUrl.match(/\.(m4a|mp4|aac|mp3)/)?.[1] || 'm4a';
    const safeTitle = title.replace(/[^\w\s\-()]/g, '').trim().slice(0, 80) || 'recording';

    res.json({ url: audioUrl, filename: `${safeTitle}.${ext}`, title: safeTitle, ext });

  } catch (e) {
    res.status(422).json({ error: e.message });
  }
}
