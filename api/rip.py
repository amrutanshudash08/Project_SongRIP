import json
from http.server import BaseHTTPRequestHandler
import yt_dlp

ALLOWED_DOMAINS = [
    "smule.com",
    "starmaker.us", "starmaker.com",
    "yokee.com",
    "singsnap.com",
]

def is_allowed(url: str) -> bool:
    return any(d in url for d in ALLOWED_DOMAINS)


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            url = body.get("url", "").strip()

            if not url:
                return self._error(400, "No URL provided.")

            if not is_allowed(url):
                return self._error(400, "Unsupported platform. Use Smule, StarMaker, Yokee, or SingSnap.")

            ydl_opts = {
                "format": "bestaudio/best",
                "quiet": True,
                "no_warnings": True,
                "noplaylist": True,
                "skip_download": True,
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

            # Find the best audio URL
            audio_url = None
            ext = "m4a"
            title = info.get("title", "recording")

            if info.get("url"):
                audio_url = info["url"]
                ext = info.get("ext", "m4a")
            elif info.get("formats"):
                # Pick best audio-only format
                formats = [f for f in info["formats"] if f.get("acodec") != "none"]
                if formats:
                    best = max(formats, key=lambda f: f.get("abr") or 0)
                    audio_url = best.get("url")
                    ext = best.get("ext", "m4a")

            if not audio_url:
                return self._error(422, "Could not extract audio from this link.")

            # Sanitise filename
            safe_title = "".join(c for c in title if c.isalnum() or c in " -_()").strip()[:80] or "recording"
            filename = f"{safe_title}.{ext}"

            payload = json.dumps({
                "url": audio_url,
                "filename": filename,
                "title": safe_title,
                "ext": ext,
            }).encode()

            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        except yt_dlp.utils.DownloadError as e:
            self._error(422, f"yt-dlp error: {str(e)[:300]}")
        except Exception as e:
            self._error(500, f"Server error: {str(e)[:300]}")

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _error(self, code: int, message: str):
        payload = json.dumps({"error": message}).encode()
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
