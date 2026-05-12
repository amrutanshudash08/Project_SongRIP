import Head from "next/head";

const G = "#BF9B45";
const G2 = "#D4AF56";
const G3 = "#9A7830";

export default function Guide() {
  return (
    <>
      <Head>
        <title>SongRip — User Guide</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08090E; }
        @keyframes fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ background:"#08090E", minHeight:"100vh", fontFamily:"'Outfit','Helvetica Neue',sans-serif", fontWeight:300, lineHeight:1.7 }}>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"60px 24px 80px" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:72, animation:"fade-up .6s ease" }}>
            <div style={{ fontSize:9, letterSpacing:"5px", textTransform:"uppercase", color:G3, marginBottom:16 }}>User Guide</div>
            <div style={{ fontFamily:"'Cormorant Garamath',Georgia,serif", fontWeight:300, fontSize:"clamp(48px,7vw,72px)", color:"#EDE8DF", letterSpacing:"-2px", lineHeight:.9 }}>
              Song<em style={{ color:G, fontStyle:"italic" }}>Rip</em>
            </div>
            <div style={{ fontSize:13, color:"#9A9088", marginTop:16, letterSpacing:".5px" }}>Everything you need to download your recordings</div>
          </div>

          {/* Back link */}
          <div style={{ marginBottom:48 }}>
            <a href="/" style={{ fontSize:11, letterSpacing:"2px", textTransform:"uppercase", color:G3, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8 }}>
              ← Back to SongRip
            </a>
          </div>

          {[
            {
              num:"01", title:"What is SongRip?",
              content: (
                <>
                  <p style={{ fontSize:13, color:"#9A9088", lineHeight:1.8, marginBottom:16 }}>
                    SongRip lets you download your singing recordings from karaoke apps like <strong style={{ color:"#EDE8DF", fontWeight:400 }}>StarMaker</strong> and <strong style={{ color:"#EDE8DF", fontWeight:400 }}>Smule</strong> directly to your phone or computer as an audio file you can keep forever.
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    {[
                      { icon:"⭐", name:"StarMaker", status:"Fully working", dot:"#4ade80", desc:"Instant download. Supports all share link formats including WhatsApp messages and OneLink redirect URLs." },
                      { icon:"🎵", name:"Smule", status:"In progress", dot:G, desc:"Currently blocked by Cloudflare security. Use Sownloader browser extension as a workaround." },
                    ].map((p,i) => (
                      <div key={i} style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:4, padding:"20px 18px" }}>
                        <div style={{ fontSize:22, marginBottom:10 }}>{p.icon}</div>
                        <div style={{ fontFamily:"'Cormorant Garamath',Georgia,serif", fontSize:16, fontWeight:300, color:"#EDE8DF", marginBottom:4 }}>{p.name}</div>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:9, letterSpacing:"2px", textTransform:"uppercase", marginBottom:10 }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:p.dot }} />
                          <span style={{ color:"#9A9088" }}>{p.status}</span>
                        </div>
                        <div style={{ fontSize:11, color:"#5A5650", lineHeight:1.6 }}>{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </>
              )
            },
            {
              num:"02", title:"How to download a recording",
              content: (
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {[
                    { n:"1", t:"Open your recording in the app", d:"In StarMaker or Smule, find the recording you want to save and open it." },
                    { n:"2", t:"Tap the Share button", d:"Look for the share icon (arrow pointing outward) and tap it." },
                    { n:"3", t:"Copy the link", d:"Tap Copy Link. You can also copy the entire WhatsApp message — SongRip finds the link inside automatically." },
                    { n:"4", t:"Paste into SongRip", d:"Open project-song-rip.vercel.app, paste the link, and tap Extract Audio." },
                    { n:"5", t:"Download your file", d:"Tap Save M4A. The file saves to your Downloads folder with the song title as the filename." },
                  ].map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:16, padding:"18px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius: i===0?"4px 4px 0 0":i===4?"0 0 4px 4px":"0" }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${G3}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:G, flexShrink:0, marginTop:1 }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#EDE8DF", marginBottom:4, letterSpacing:".3px" }}>{s.t}</div>
                        <div style={{ fontSize:12, color:"#9A9088", lineHeight:1.65 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              num:"03", title:"Add SongRip to your home screen",
              content: (
                <>
                  <p style={{ fontSize:13, color:"#9A9088", lineHeight:1.8, marginBottom:20 }}>Add SongRip to your home screen so you can open it instantly like an app.</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    {[
                      { os:"iPhone · Safari", steps:["Open project-song-rip.vercel.app in Safari","Tap the Share button at the bottom (box with arrow up)","Scroll down and tap Add to Home Screen","Tap Add in the top right","SongRip icon appears on your home screen ✓"] },
                      { os:"Android · Chrome", steps:["Open project-song-rip.vercel.app in Chrome","Tap the three dots menu (top right corner)","Tap Add to Home screen","Tap Add to confirm","SongRip icon appears on your home screen ✓"] },
                    ].map((p,i) => (
                      <div key={i} style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:4, padding:"20px 16px" }}>
                        <div style={{ fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:G3, marginBottom:14 }}>{p.os}</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {p.steps.map((s,j) => (
                            <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                              <div style={{ fontSize:9, color:G3, fontWeight:500, flexShrink:0, marginTop:2, width:14 }}>{j+1}</div>
                              <div style={{ fontSize:11, color:"#9A9088", lineHeight:1.55 }}>{s}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderLeft:`2px solid ${G3}`, padding:"14px 16px", background:"rgba(191,155,69,.04)", borderRadius:"0 4px 4px 0", marginTop:16 }}>
                    <div style={{ fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:G3, marginBottom:6 }}>Note</div>
                    <div style={{ fontSize:12, color:"#9A9088", lineHeight:1.65 }}>On iPhone, you must use <strong style={{ color:G2, fontWeight:400 }}>Safari</strong> — not Chrome or Firefox — to get the Add to Home Screen option.</div>
                  </div>
                </>
              )
            },
            {
              num:"04", title:"Finding your downloaded file",
              content: (
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {[
                    { n:"📱", t:"iPhone", d:"After tapping Save M4A, a prompt appears — tap Download. The file saves to Files app → Downloads. You can share it to WhatsApp or play it in the Music app." },
                    { n:"🤖", t:"Android", d:"The file downloads automatically to your Downloads folder. Open your Files app or notification shade to find it. Plays in any music player." },
                    { n:"💻", t:"Computer", d:"The file saves to your browser's Downloads folder. It's an M4A audio file that plays in iTunes, Windows Media Player, VLC, and any modern music player." },
                  ].map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:16, padding:"18px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius: i===0?"4px 4px 0 0":i===2?"0 0 4px 4px":"0" }}>
                      <div style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#EDE8DF", marginBottom:4 }}>{s.t}</div>
                        <div style={{ fontSize:12, color:"#9A9088", lineHeight:1.65 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              num:"05", title:"Downloading Smule recordings",
              content: (
                <>
                  <p style={{ fontSize:13, color:"#9A9088", lineHeight:1.8, marginBottom:20 }}>Smule is currently blocked by Cloudflare. Until we fix this, use <strong style={{ color:"#EDE8DF", fontWeight:400 }}>Sownloader</strong> — it's free, ad-free, and works on all devices.</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:16 }}>
                    {[
                      { n:"1", t:"Copy your Smule link", d:"In Smule, open your recording → tap Share → tap Copy Link" },
                      { n:"2", t:"Open Sownloader", d:"Go to sownloader.com in Safari (iPhone) or Chrome (Android/Computer)" },
                      { n:"3", t:"Paste and download", d:"Paste your link and tap the download button. Choose Audio (M4A) for best quality." },
                    ].map((s,i) => (
                      <div key={i} style={{ display:"flex", gap:16, padding:"18px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius: i===0?"4px 4px 0 0":i===2?"0 0 4px 4px":"0" }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", border:`1px solid ${G3}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:G, flexShrink:0, marginTop:1 }}>{s.n}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#EDE8DF", marginBottom:4 }}>{s.t}</div>
                          <div style={{ fontSize:12, color:"#9A9088", lineHeight:1.65 }}>{s.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderLeft:`2px solid ${G3}`, padding:"14px 16px", background:"rgba(191,155,69,.04)", borderRadius:"0 4px 4px 0" }}>
                    <div style={{ fontSize:9, letterSpacing:"3px", textTransform:"uppercase", color:G3, marginBottom:6 }}>Coming soon</div>
                    <div style={{ fontSize:12, color:"#9A9088", lineHeight:1.65 }}>We're actively working on making Smule downloads work directly in SongRip. Stay tuned!</div>
                  </div>
                </>
              )
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom:64 }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:28, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ fontFamily:"'Cormorant Garamath',Georgia,serif", fontSize:42, fontWeight:300, color:"rgba(191,155,69,.2)", lineHeight:1, flexShrink:0 }}>{section.num}</div>
                <div style={{ fontFamily:"'Cormorant Garamath',Georgia,serif", fontSize:24, fontWeight:300, color:"#EDE8DF", letterSpacing:"-.5px" }}>{section.title}</div>
              </div>
              {section.content}
            </div>
          ))}

          {/* Footer */}
          <div style={{ textAlign:"center", marginTop:64, paddingTop:32, borderTop:"1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontSize:9, letterSpacing:"2.5px", textTransform:"uppercase", color:"#3A3830", marginBottom:10 }}>Personal use only · Respect artists' rights</div>
            <div style={{ fontSize:11, color:"#6A6458", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              <span style={{ color:G3, fontSize:10 }}>✦</span>
              Made by{" "}
              <span style={{ fontFamily:"'Cormorant Garamath',Georgia,serif", fontSize:14, fontStyle:"italic", color:G }}>Amrutanshu Dash</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
