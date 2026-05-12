import Head from "next/head";
import { useState, useEffect, useRef } from "react";

const PLATFORMS = [
  { name: "Smule",     pattern: /smule\.com/i,              icon: "S" },
  { name: "StarMaker", pattern: /starmaker\.(us|com|io)/i,  icon: "★" },
  { name: "Yokee",     pattern: /yokee\.com/i,              icon: "Y" },
  { name: "SingSnap",  pattern: /singsnap\.com/i,           icon: "∿" },
];

const G  = "#BF9B45";
const G2 = "#D4AF56";
const G3 = "#9A7830";

function detectPlatform(url) {
  for (const p of PLATFORMS) if (p.pattern.test(url)) return p;
  return null;
}

function VinylRecord({ spinning, size = 188 }) {
  const r = size / 2;
  const grooves = Array.from({ length: 20 }, (_, i) => r * 0.29 + i * (r * 0.58 / 20));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ animation: spinning ? "vinyl-spin 2.2s linear infinite" : "none",
               filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.8))" }}>
      <circle cx={r} cy={r} r={r - 1} fill="#0E0D12" />
      {grooves.map((gr, i) => (
        <circle key={i} cx={r} cy={r} r={gr} fill="none"
          stroke={i % 4 === 0 ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.018)"}
          strokeWidth={i % 4 === 0 ? 0.9 : 0.4} />
      ))}
      <circle cx={r} cy={r} r={r * 0.34} fill="#150F04" />
      <circle cx={r} cy={r} r={r * 0.33} fill="none" stroke={G3} strokeWidth="0.6" />
      <text x={r} y={r - 7} textAnchor="middle" fill={G} fontSize="8"
        fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" letterSpacing="2.5">SONG</text>
      <text x={r} y={r + 6} textAnchor="middle" fill={G} fontSize="8"
        fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="600" letterSpacing="2.5">RIP</text>
      <circle cx={r} cy={r} r={r * 0.046} fill="#08090E" />
      <ellipse cx={r * 0.74} cy={r * 0.52} rx={r * 0.07} ry={r * 0.2}
        fill="rgba(255,255,255,0.035)" transform={`rotate(-28 ${r} ${r})`} />
    </svg>
  );
}

function Waveform({ active }) {
  const h = [0.28,0.55,0.78,1,0.65,0.42,0.88,0.58,0.95,0.72,0.48,0.82,0.38,0.62,0.9,0.5,0.75];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2.5, height:32 }}>
      {h.map((v, i) => (
        <div key={i} style={{
          width:2.5, borderRadius:2,
          background: active ? G : "rgba(255,255,255,0.12)",
          height: active ? `${v * 32}px` : "3px",
          animation: active ? `wf ${0.45 + i*0.055}s ease-in-out ${i*0.035}s infinite alternate` : "none",
          transition: "height 0.5s ease, background 0.5s ease",
        }} />
      ))}
    </div>
  );
}

const STATUS = { idle:"idle", loading:"loading", ready:"ready", error:"error" };

export default function SongRip() {
  const [url, setUrl]           = useState("");
  const [status, setStatus]     = useState(STATUS.idle);
  const [platform, setPlatform] = useState(null);
  const [result, setResult]     = useState(null);   // { url, filename, title, ext }
  const [error, setError]       = useState("");
  const [progress, setProgress] = useState(0);
  const [focused, setFocused]   = useState(false);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => { setPlatform(detectPlatform(url)); }, [url]);

  useEffect(() => {
    if (status === STATUS.loading) {
      setProgress(0);
      let p = 0;
      timerRef.current = setInterval(() => {
        p += Math.random() * 5 + 1.5;
        if (p >= 87) { clearInterval(timerRef.current); p = 87; }
        setProgress(Math.min(p, 87));
      }, 380);
    } else if (status === STATUS.ready) {
      setProgress(100);
      clearInterval(timerRef.current);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [status]);

  async function handleRip() {
    if (!url.trim() || status === STATUS.loading) return;
    setStatus(STATUS.loading); setError(""); setResult(null);

    try {
      const res = await fetch("/api/rip", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}) — the backend may still be starting up. Wait 10 seconds and try again.`);
      }

      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      setResult(data);
      setStatus(STATUS.ready);
    } catch (e) {
      setError(e.message || "Could not extract audio. Please check the link.");
      setStatus(STATUS.error);
    }
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  }

  function reset() {
    setUrl(""); setStatus(STATUS.idle); setResult(null); setError(""); setProgress(0);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  const isLoading = status === STATUS.loading;
  const isReady   = status === STATUS.ready;
  const isError   = status === STATUS.error;

  return (
    <>
      <Head>
        <title>SongRip — Extract audio from Smule & StarMaker</title>
        <meta name="description" content="Download your Smule and StarMaker recordings as audio files." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{
        minHeight:"100vh", background:"#08090E",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"48px 20px", position:"relative", overflow:"hidden",
        fontFamily:"'Outfit','Helvetica Neue',sans-serif",
      }}>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #08090E; }
          @keyframes vinyl-spin { to { transform: rotate(360deg); } }
          @keyframes wf { from { transform:scaleY(0.2); } to { transform:scaleY(1); } }
          @keyframes fade-up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
          @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
          .sr-input { background:none; border:none; outline:none; color:#EDE8DF; font-family:'Outfit',sans-serif; font-size:14px; font-weight:300; width:100%; letter-spacing:.3px; }
          .sr-input::placeholder { color:#9A9088; }
          .rip-btn { position:relative; overflow:hidden; background:transparent; border:1px solid ${G3}; color:${G}; font-family:'Outfit',sans-serif; font-size:10px; font-weight:500; letter-spacing:3.5px; text-transform:uppercase; padding:15px 32px; border-radius:2px; cursor:pointer; transition:color .3s,border-color .3s; }
          .rip-btn::after { content:''; position:absolute; inset:0; background:${G}; transform:scaleX(0); transform-origin:left; transition:transform .3s cubic-bezier(.16,1,.3,1); }
          .rip-btn:hover:not(:disabled) { color:#08090E; border-color:${G}; }
          .rip-btn:hover:not(:disabled)::after { transform:scaleX(1); }
          .rip-btn > span { position:relative; z-index:1; }
          .rip-btn:disabled { opacity:.25; cursor:not-allowed; }
          .dl-btn { background:${G}; border:none; color:#08090E; font-family:'Outfit',sans-serif; font-size:10px; font-weight:500; letter-spacing:3px; text-transform:uppercase; padding:14px 28px; border-radius:2px; cursor:pointer; transition:background .2s; }
          .dl-btn:hover { background:${G2}; }
          .ghost-btn { background:none; border:1px solid rgba(255,255,255,.09); color:#7A7870; font-family:'Outfit',sans-serif; font-size:10px; letter-spacing:3px; text-transform:uppercase; padding:14px 22px; border-radius:2px; cursor:pointer; transition:all .2s; }
          .ghost-btn:hover { border-color:rgba(255,255,255,.18); color:#AAA898; }
          @media (max-width: 640px) {
            .main-card { flex-direction: column !important; }
            .vinyl-panel { width: 100% !important; padding: 32px 20px 24px !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
            .ctrl-panel { padding: 32px 24px !important; }
          }
        `}</style>

        {/* Ambient glow */}
        <div style={{ position:"absolute", top:"-15%", left:"50%", transform:"translateX(-50%)",
          width:1100, height:600,
          background:"radial-gradient(ellipse at center,rgba(191,155,69,0.05) 0%,transparent 60%)",
          pointerEvents:"none" }} />

        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:52, animation:"fade-up .65s ease" }}>
          <div style={{ fontSize:10, letterSpacing:"5px", textTransform:"uppercase", color:"#888070", marginBottom:14, fontWeight:400 }}>
            Audio Extraction Suite
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontWeight:300,
            fontSize:"clamp(54px,9vw,84px)", color:"#EDE8DF", lineHeight:.88, letterSpacing:"-2px" }}>
            Song<em style={{ color:G, fontStyle:"italic" }}>Rip</em>
          </h1>
          <div style={{ marginTop:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {["Smule","StarMaker","Yokee","SingSnap"].map((n, i) => (
              <span key={i} style={{ display:"flex", alignItems:"center" }}>
                <span style={{ fontSize:10, letterSpacing:"2px", textTransform:"uppercase", color:"#9A9088" }}>{n}</span>
                {i < 3 && <span style={{ margin:"0 12px", color:"#9A9088" }}>·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Main card */}
        <div className="main-card" style={{ display:"flex", width:"100%", maxWidth:800,
          border:"1px solid rgba(255,255,255,0.07)", borderRadius:3,
          animation:"fade-up .65s ease .12s both", overflow:"hidden" }}>

          {/* Vinyl */}
          <div className="vinyl-panel" style={{ width:256, flexShrink:0, padding:"48px 28px",
            background:"rgba(255,255,255,0.018)", borderRight:"1px solid rgba(255,255,255,0.05)",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24,
            opacity: isReady ? 0.35 : 1, transition:"opacity .6s ease" }}>
            <VinylRecord spinning={isLoading} size={188} />
            <Waveform active={isLoading || isReady} />
            {isLoading && (
              <div style={{ fontSize:9, letterSpacing:"3.5px", textTransform:"uppercase", color:G }}>
                Extracting
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="ctrl-panel" style={{ flex:1, padding:"44px 40px", display:"flex", flexDirection:"column", justifyContent:"center" }}>

            {!isReady && (
              <>
                <div style={{ fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:"#A09888", marginBottom:28, fontWeight:400 }}>
                  {isLoading ? "Extracting audio…" : "Paste sharing link"}
                </div>

                <div style={{ borderBottom:`1px solid ${focused ? "rgba(191,155,69,.4)" : "rgba(255,255,255,.1)"}`,
                  paddingBottom:14, marginBottom:26,
                  display:"flex", alignItems:"center", gap:12,
                  transition:"border-color .35s ease" }}>
                  <span style={{ color: platform ? G : "#4A4840", fontSize:13, flexShrink:0, width:14, textAlign:"center" }}>
                    {platform ? platform.icon : "↗"}
                  </span>
                  <input ref={inputRef} className="sr-input"
                    value={url} onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && url.trim() && handleRip()}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder="https://www.smule.com/recording/..."
                    disabled={isLoading} />
                  {url && !isLoading && (
                    <button onClick={() => setUrl("")}
                      style={{ background:"none", border:"none", color:"#9A9088", cursor:"pointer", fontSize:17, padding:0, lineHeight:1 }}>×</button>
                  )}
                </div>

                {platform && !isLoading && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8,
                    border:"1px solid rgba(191,155,69,.22)", borderRadius:2, padding:"5px 14px", marginBottom:26,
                    fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:G,
                    background:"rgba(191,155,69,.05)", animation:"fade-up .3s ease" }}>
                    <span style={{ fontSize:12 }}>{platform.icon}</span>
                    {platform.name} detected
                  </div>
                )}

                {isLoading && (
                  <div style={{ marginBottom:28 }}>
                    <div style={{ height:1, background:"rgba(255,255,255,.07)", borderRadius:1, overflow:"hidden", marginBottom:10 }}>
                      <div style={{ height:"100%", width:`${progress}%`,
                        background:`linear-gradient(90deg,${G3},${G},${G2})`,
                        backgroundSize:"200% 100%", animation:"shimmer 2s linear infinite",
                        transition:"width .5s ease" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", color:"#A09888" }}>Processing</span>
                      <span style={{ fontSize:9, letterSpacing:"2px", color:G }}>{Math.round(progress)}%</span>
                    </div>
                  </div>
                )}

                {isError && (
                  <div style={{ borderLeft:"2px solid rgba(200,80,80,.4)", paddingLeft:14, marginBottom:24, animation:"fade-up .3s ease" }}>
                    <div style={{ color:"#C08080", fontSize:12, fontWeight:300, lineHeight:1.65 }}>{error}</div>
                  </div>
                )}

                <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                  <button className="rip-btn" onClick={handleRip} disabled={!url.trim() || isLoading}>
                    <span>{isLoading ? "Working…" : "Extract Audio"}</span>
                  </button>
                  {isError && (
                    <button onClick={reset}
                      style={{ background:"none", border:"none", color:"#A09888", cursor:"pointer", fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", fontFamily:"inherit", padding:0 }}>
                      Reset
                    </button>
                  )}
                </div>
              </>
            )}

            {isReady && result && (
              <div style={{ animation:"fade-up .5s ease" }}>
                <div style={{ fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:G, marginBottom:28, fontWeight:400 }}>
                  Ready to download
                </div>
                <div style={{ borderLeft:`2px solid ${G3}`, paddingLeft:18, marginBottom:36 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:300, color:"#EDE8DF", lineHeight:1.2, marginBottom:6 }}>
                    {result.title}
                  </div>
                  <div style={{ fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", color:"#A09888" }}>
                    {result.ext?.toUpperCase()} · Audio extracted
                  </div>
                </div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <button className="dl-btn" onClick={handleDownload}>↓&nbsp;&nbsp;Save {result.ext?.toUpperCase()}</button>
                  <button className="ghost-btn" onClick={reset}>New extract</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <div style={{ width:"100%", maxWidth:800, display:"grid", gridTemplateColumns:"repeat(3,1fr)", animation:"fade-up .65s ease .25s both" }}>
          {[
            { num:"01", label:"Paste",    desc:"Any Smule or StarMaker share URL works. No login required." },
            { num:"02", label:"Extract",  desc:"yt-dlp locates the raw audio stream from the platform's CDN." },
            { num:"03", label:"Download", desc:"Receive a clean audio file instantly on your device." },
          ].map((s, i) => (
            <div key={i} style={{ padding:"20px 26px 18px",
              borderTop:"1px solid rgba(255,255,255,.05)", borderBottom:"1px solid rgba(255,255,255,.05)",
              borderLeft: i === 0 ? "1px solid rgba(255,255,255,.07)" : "none",
              borderRight: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:30, fontWeight:300, color:"rgba(191,155,69,.4)", lineHeight:1, marginBottom:8 }}>{s.num}</div>
              <div style={{ fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", color:"#A09888", fontWeight:500, marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"#8A8478", lineHeight:1.75, fontWeight:300 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop:32, display:"flex", flexDirection:"column", alignItems:"center", gap:8, animation:"fade-up .65s ease .35s both" }}>
          <div style={{ fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", color:"#9A9088" }}>
            Personal use only · Respect artists' rights
          </div>
          <a href="/guide" style={{
            fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase",
            color:G3, textDecoration:"none",
          }}>
            User Guide →
          </a>
          <div style={{ fontSize:11, letterSpacing:"1px", color:"#9A9088", fontWeight:300, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ color:G, fontSize:10 }}>✦</span>
            Made by{" "}
            <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14, fontWeight:400, fontStyle:"italic", color:G, letterSpacing:".5px" }}>
              Amrutanshu Dash
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
