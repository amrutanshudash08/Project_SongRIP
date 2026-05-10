export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let { url } = req.body;

    // Extract URL from full share text
    const urlMatch = url.match(/https?:\/\/\S+/);
    if (urlMatch) url = urlMatch[0].replace(/['".,)]+$/, '');

    // Clean UTM params and social suffixes
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname.replace(/\/(twitter|facebook|instagram|whatsapp|copy|embed|frame\/box)\/?$/, '');
    parsed.search = '';
    url = parsed.toString();

    const HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };

    async function extractFromHtml(html) {
      // __NEXT_DATA__ JSON blob — most reliable
      const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextData) {
        try {
          const data = JSON.parse(nextData[1]);
          const str = JSON.stringify(data);

          // Look for media_url or audio CDN links
          const patterns = [
            /"media_url"\s*:\s*"([^"]+)"/,
            /"(https:\/\/[^"]+smule[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
            /"(https:\/\/storage\.googleapis[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
            /"(https:\/\/[^"]+\.(?:m4a|mp4|aac|mp3)(?:\?[^"]*)?)"/,
          ];
          for (const pattern of patterns) {
            const m = str.match(pattern);
            if (m) return m[1];
          }
        } catch (_) {}
      }

      // og:audio / og:video meta tags
      const ogAudio = html.match(/property="og:audio(?::url)?"\s+content="([^"]+)"/);
      if (ogAudio) return ogAudio[1];

      const ogVideo = html.match(/property="og:video(?::url)?"\s+content="([^"]+)"/);
      if (ogVideo && !ogVideo[1].includes('/frame')) return ogVideo[1];

      // Raw audio URL anywhere in page
      const rawMatch = html.match(/https:\/\/[^\s"'<>]+\.(?:m4a|mp4|aac|mp3)(?:\?[^\s"'<>]*)?/);
      if (rawMatch) return rawMatch[0];

      return null;
    }

    // Fetch main recording page
    const pageRes = await fetch(url, { headers: HEADERS });
    if (!pageRes.ok) throw new Error(`Could not load page (${pageRes.status})`);
    const html = await pageRes.text();

    // Extract title
    let title = 'recording';
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/);
    if (ogTitle) title = ogTitle[1];

    // Try extracting audio from main page first
    let audioUrl = await extractFromHtml(html);

    // If not found, try the Smule API directly using the performance IDs from the URL
    if (!audioUrl) {
      const ids = url.match(/(\d+_\d+)/);
      if (ids) {
        const apiRes = await fetch(`https://www.smule.com/api/v1/recording/${ids[1]}`, { headers: HEADERS });
        if (apiRes.ok) {
          try {
            const data = await apiRes.json();
            audioUrl = data?.media_url || data?.data?.media_url;
          } catch (_) {}
        }
      }
    }

    // If still not found, try fetching the /frame/box page
    if (!audioUrl) {
      const frameRes = await fetch(`${url}/frame/box`, { headers: HEADERS });
      if (frameRes.ok) {
        const frameHtml = await frameRes.text();
        audioUrl = await extractFromHtml(frameHtml);
      }
    }

    if (!audioUrl) {
      throw new Error('Could not find audio. Make sure you are using a smule.com/recording/... link.');
    }

    const ext = audioUrl.match(/\.(m4a|mp4|aac|mp3)/)?.[1] || 'm4a';
    const safeTitle = title.replace(/[^\w\s\-()]/g, '').trim().slice(0, 80) || 'recording';

    res.json({ url: audioUrl, filename: `${safeTitle}.${ext}`, title: safeTitle, ext });

  } catch (e) {
    res.status(422).json({ error: e.message });
  }
}
