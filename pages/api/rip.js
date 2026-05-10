export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { url } = req.body;

    // Extract URL if user pasted full share message text
    const urlMatch = url.match(/https?:\/\/\S+/);
    if (urlMatch) url = urlMatch[0].replace(/['".,)]+$/, '');

    // Strip UTM params and social suffixes (/twitter, /facebook etc.)
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname.replace(/\/(twitter|facebook|instagram|whatsapp|copy|embed)\/?$/, '');
    parsed.search = '';
    url = parsed.toString();

    // Fetch the Smule page
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!pageRes.ok) throw new Error(`Could not load page (${pageRes.status})`);
    const html = await pageRes.text();

    let audioUrl = null;
    let title = 'recording';

    // Extract title from og:title
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/);
    if (ogTitle) title = ogTitle[1];

    // Strategy 1: og:audio meta tag
    const ogAudio = html.match(/property="og:audio(?::url)?"\s+content="([^"]+)"/);
    if (ogAudio) audioUrl = ogAudio[1];

    // Strategy 2: og:video (Smule sometimes puts audio here)
    if (!audioUrl) {
      const ogVideo = html.match(/property="og:video(?::url)?"\s+content="([^"]+)"/);
      if (ogVideo) audioUrl = ogVideo[1];
    }

    // Strategy 3: dig through __NEXT_DATA__ JSON blob
    if (!audioUrl) {
      const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextData) {
        try {
          const str = nextData[1];
          const match = str.match(/"(https:\/\/[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/);
          if (match) audioUrl = match[1];
        } catch (_) {}
      }
    }

    // Strategy 4: any .m4a/.mp4 URL in the page
    if (!audioUrl) {
      const rawMatch = html.match(/https:\/\/[^\s"'<>]+\.(?:m4a|mp4|aac|mp3)(?:\?[^\s"'<>]*)?/);
      if (rawMatch) audioUrl = rawMatch[0];
    }

    if (!audioUrl) throw new Error('Could not find audio in this page. Try copying just the smule.com/recording/... URL.');

    const ext = audioUrl.match(/\.(m4a|mp4|aac|mp3)/)?.[1] || 'm4a';
    const safeTitle = title.replace(/[^\w\s\-()]/g, '').trim().slice(0, 80) || 'recording';

    res.json({ url: audioUrl, filename: `${safeTitle}.${ext}`, title: safeTitle, ext });

  } catch (e) {
    res.status(422).json({ error: e.message });
  }
}
