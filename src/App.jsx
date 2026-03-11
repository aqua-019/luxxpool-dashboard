import { useState, useEffect, useCallback, useRef } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════
 * LUXXPOOL — Public Miner Dashboard v1.0
 * Scrypt Multi-Coin Merged Mining Pool
 * Christina Lake, BC, Canada
 *
 * Views: Pool Stats · Connect · FAQ & Setup · Miner Lookup
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════
const T = {
  state: {
    mining:  { bg: "#0d2847", fg: "#4a9eff", border: "rgba(74,158,255,0.2)", glow: "rgba(74,158,255,0.1)" },
    found:   { bg: "#0d3521", fg: "#34d399", border: "rgba(52,211,153,0.25)", glow: "rgba(52,211,153,0.1)" },
    warn:    { bg: "#3b2010", fg: "#fb923c", border: "rgba(251,146,60,0.2)", glow: "rgba(251,146,60,0.1)" },
    idle:    { bg: "#141a24", fg: "#475569", border: "rgba(71,85,105,0.15)", glow: "transparent" },
    aux:     { bg: "#1a1535", fg: "#a78bfa", border: "rgba(167,139,250,0.2)", glow: "rgba(167,139,250,0.08)" },
    error:   { bg: "#2d1215", fg: "#f87171", border: "rgba(248,113,113,0.2)", glow: "rgba(248,113,113,0.08)" },
  },
  font: {
    display: "'Unbounded', sans-serif",
    mono: "'IBM Plex Mono', monospace",
    body: "'DM Sans', sans-serif",
  },
  surface: { base: "#080c14", card: "#121a28", raised: "#0e1420" },
  r: { sm: 4, md: 8, lg: 12, xl: 16 },
};

const COINS = [
  { sym: "LTC",   name: "Litecoin",   hue: 215, role: "parent", reward: "6.25 LTC",       blockTime: "2.5 min" },
  { sym: "DOGE",  name: "Dogecoin",   hue: 45,  role: "aux",    reward: "10,000 DOGE",     blockTime: "1 min" },
  { sym: "BELLS", name: "Bellscoin",  hue: 25,  role: "aux",    reward: "Random",          blockTime: "1 min" },
  { sym: "LKY",   name: "Luckycoin",  hue: 140, role: "aux",    reward: "Halving",         blockTime: "1 min" },
  { sym: "PEP",   name: "Pepecoin",   hue: 150, role: "aux",    reward: "Halving",         blockTime: "1 min" },
  { sym: "JKC",   name: "Junkcoin",   hue: 200, role: "aux",    reward: "Halving",         blockTime: "1 min" },
  { sym: "DINGO", name: "Dingocoin",  hue: 30,  role: "aux",    reward: "Variable",        blockTime: "1 min" },
  { sym: "SHIC",  name: "Shibacoin",  hue: 35,  role: "aux",    reward: "Halving",         blockTime: "1 min" },
  { sym: "TRMP",  name: "TrumPOW",    hue: 0,   role: "aux",    reward: "Variable",        blockTime: "1 min" },
  { sym: "CRC",   name: "CraftCoin",  hue: 280, role: "aux",    reward: "Variable",        blockTime: "1 min" },
];

const ACTIVE_AUX = ["DOGE", "BELLS", "LKY", "PEP", "DINGO", "SHIC"];

function cc(h, a = 1) { return `hsla(${h},70%,60%,${a})`; }
function fmtHR(h) {
  if (!h) return "0 H/s";
  const u = [["EH/s",1e18],["PH/s",1e15],["TH/s",1e12],["GH/s",1e9],["MH/s",1e6],["KH/s",1e3],["H/s",1]];
  for (const [s, d] of u) if (h >= d) return (h / d).toFixed(2) + " " + s;
  return "0 H/s";
}
function timeAgo(ms) {
  if (ms < 60000) return Math.floor(ms / 1000) + "s ago";
  if (ms < 3600000) return Math.floor(ms / 60000) + "m ago";
  return Math.floor(ms / 3600000) + "h ago";
}

// ═══════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════

function Metric({ label, value, sub, state = "mining" }) {
  const s = T.state[state];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: T.r.lg, padding: "14px 18px", boxShadow: `0 0 16px ${s.glow}`, transition: "all 0.4s" }}>
      <div style={{ fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: 2, fontFamily: T.font.mono }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: s.fg, fontFamily: T.font.display, marginTop: 4, letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#3a4a5a", fontFamily: T.font.mono, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function CopyBlock({ children, accent = "#4a9eff", value }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value || children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  return (
    <div onClick={handleCopy} style={{
      background: "#060a12", borderRadius: T.r.sm, padding: "12px 16px",
      fontFamily: T.font.mono, fontSize: 14, color: accent,
      border: `1px solid ${copied ? T.state.found.border : accent + "22"}`,
      position: "relative", cursor: "pointer", transition: "border-color 0.3s",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>{children}</span>
      <span style={{ fontSize: 10, color: copied ? T.state.found.fg : "#3a4a5a", fontFamily: T.font.mono, transition: "color 0.3s" }}>
        {copied ? "✓ COPIED" : "CLICK TO COPY"}
      </span>
    </div>
  );
}

function Sparkline({ data = [], w = 400, h = 50, hue = 215 }) {
  if (data.length < 2) return <div style={{ width: w, height: h, background: T.surface.card, borderRadius: T.r.md }} />;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - 4 - ((v - min) / range) * (h - 8)}`).join(" ");
  const c = cc(hue);
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg${hue}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.2" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${hue})`} />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FaqSection({ num, title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 20 }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: open ? 10 : 0,
        cursor: "pointer", userSelect: "none",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: T.r.md,
          background: T.state.mining.bg, border: `1px solid ${T.state.mining.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.font.display, fontWeight: 800, fontSize: 14, color: T.state.mining.fg,
        }}>{num}</div>
        <div style={{ flex: 1, fontFamily: T.font.display, fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{title}</div>
        <div style={{ color: "#4a5568", fontSize: 18, transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</div>
      </div>
      {open && (
        <div style={{
          background: T.surface.card, border: `1px solid ${T.state.idle.border}`,
          borderRadius: T.r.lg, padding: 20,
          fontSize: 13, color: "#8a9ab0", lineHeight: 1.7, fontFamily: T.font.body,
          animation: "fadeIn 0.2s ease",
        }}>{children}</div>
      )}
    </div>
  );
}

function CoinPill({ coin, active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 16, fontSize: 11, fontFamily: T.font.mono,
      background: active ? `hsla(${coin.hue},70%,60%,0.08)` : T.surface.card,
      border: `1px solid ${active ? `hsla(${coin.hue},70%,60%,0.2)` : T.state.idle.border}`,
      color: active ? cc(coin.hue) : "#2a3040",
      transition: "all 0.3s",
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: active ? cc(coin.hue) : "#1e2a3a",
        boxShadow: active ? `0 0 4px ${cc(coin.hue)}` : "none",
      }} />
      {coin.sym}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// SIMULATED LIVE DATA ENGINE
// ═══════════════════════════════════════════════════════════
function usePoolData() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(k => k + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const poolHR = 325e9 + Math.sin(tick * 0.08) * 20e9 + Math.cos(tick * 0.03) * 10e9;
  const miners = 20 + Math.floor(Math.sin(tick * 0.02) * 2);
  const workers = miners + 4;
  const netDiff = 28462819 + Math.floor(Math.sin(tick * 0.005) * 500000);
  const height = 2847261 + Math.floor(tick / 10);
  const auxBlocks = { DOGE: 142, BELLS: 38, LKY: 21, PEP: 17, DINGO: 9, SHIC: 55 };
  const hashHist = Array.from({ length: 60 }, (_, i) =>
    300e9 + Math.sin((i + tick) * 0.12) * 35e9 + Math.cos((i + tick) * 0.05) * 15e9 + Math.random() * 5e9
  );
  const recentBlocks = [
    { coin: "LTC", height: height - 6, hash: "a3f8e2d1c4b5a697e8f2d1c4b5...cb41", confirmed: true, confs: 142, ago: 3600000 },
    { coin: "DOGE", height: 5281034, hash: "d7c2b8a1e5f3d2c1b8a7e5f3d2...9e72", confirmed: true, confs: 89, ago: 1800000 },
    { coin: "SHIC", height: 52019, hash: "f1e2d3c4b5a6e7f8d1c2b3a4e5...3a1b", confirmed: false, confs: 12, ago: 600000 },
    { coin: "BELLS", height: 189234, hash: "pending...", confirmed: false, confs: 3, ago: 120000 },
    { coin: "LTC", height: height, hash: "mining...", confirmed: false, confs: 0, ago: 15000 + Math.random() * 10000 },
  ];

  return { poolHR, miners, workers, netDiff, height, auxBlocks, hashHist, recentBlocks, tick };
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("stats");
  const [lookupAddr, setLookupAddr] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const data = usePoolData();

  const views = [
    { id: "stats", label: "POOL STATS" },
    { id: "connect", label: "CONNECT" },
    { id: "faq", label: "FAQ & SETUP" },
    { id: "lookup", label: "MINER LOOKUP" },
  ];

  const handleLookup = () => {
    if (!lookupAddr.trim()) return;
    // Demo: generate mock data for any address
    setLookupResult({
      address: lookupAddr,
      hashrate: 16.25e9 + Math.random() * 2e9,
      workers: Math.floor(1 + Math.random() * 3),
      shares24h: Math.floor(5000 + Math.random() * 20000),
      pendingBalance: (Math.random() * 0.05).toFixed(6),
      lastShare: Math.floor(Math.random() * 300) + "s ago",
      totalPaid: (Math.random() * 2.5).toFixed(4),
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.surface.base, color: "#b0bfd0", fontFamily: T.font.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{overflow-y:scroll}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#080c14} ::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:3px}
        input:focus{outline:none}
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{
        padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: `1px solid ${T.state.idle.border}`,
        background: "rgba(8,12,20,0.95)", backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4a9eff 0%, #a78bfa 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: T.font.display, fontSize: 16, fontWeight: 900, color: "#080c14" }}>L</span>
          </div>
          <div>
            <div style={{ fontFamily: T.font.display, fontSize: 18, fontWeight: 800, color: "#e2e8f0", letterSpacing: 1, lineHeight: 1 }}>
              LUXX<span style={{ color: "#4a9eff" }}>POOL</span>
            </div>
            <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 1.5 }}>SCRYPT MULTI-COIN MERGED MINING</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {views.map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: "7px 14px", border: "none", borderRadius: T.r.sm, cursor: "pointer",
              fontSize: 10, letterSpacing: 1.5, fontFamily: T.font.mono, fontWeight: 600,
              background: view === v.id ? T.state.mining.bg : "transparent",
              color: view === v.id ? T.state.mining.fg : "#3a4a5a",
              transition: "all 0.15s",
            }}>{v.label}</button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, fontFamily: T.font.mono, color: "#34d399" }}>LIVE</span>
        </div>
      </header>

      {/* ═══ COIN STRIP ═══ */}
      <div style={{
        padding: "7px 24px", display: "flex", gap: 5, flexWrap: "wrap",
        borderBottom: `1px solid ${T.state.idle.border}`, background: `${T.surface.raised}80`,
      }}>
        {COINS.map(c => (
          <CoinPill key={c.sym} coin={c} active={c.role === "parent" || ACTIVE_AUX.includes(c.sym)} />
        ))}
      </div>

      {/* ═══ CONTENT ═══ */}
      <main style={{ padding: "20px 24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ══════ POOL STATS ══════ */}
        {view === "stats" && (
          <div key="stats" style={{ animation: "fadeIn 0.25s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
              <Metric label="Pool Hashrate" value={fmtHR(data.poolHR)} sub="Scrypt (N=1024, r=1, p=1)" state="mining" />
              <Metric label="Active Miners" value={data.miners} sub={`${data.workers} workers online`} state="found" />
              <Metric label="Network Diff" value={(data.netDiff / 1e6).toFixed(1) + "M"} sub={`Block ${data.height.toLocaleString()}`} state="idle" />
              <Metric label="Coins Mining" value={1 + ACTIVE_AUX.length} sub="LTC + aux merged" state="aux" />
              <Metric label="Pool Fee" value="2%" sub="Solo: 1%" state="mining" />
            </div>

            <div style={{ background: T.surface.card, border: `1px solid ${T.state.idle.border}`, borderRadius: T.r.lg, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 8 }}>POOL HASHRATE — 24H</div>
              <Sparkline data={data.hashHist} w={1130} h={55} hue={215} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 8 }}>MERGED MINING — EARN ALL COINS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {COINS.filter(c => c.role === "aux").map(c => {
                    const active = ACTIVE_AUX.includes(c.sym);
                    return (
                      <div key={c.sym} style={{
                        background: active ? `hsla(${c.hue},70%,60%,0.05)` : T.surface.card,
                        border: `1px solid ${active ? `hsla(${c.hue},70%,60%,0.15)` : T.state.idle.border}`,
                        borderRadius: T.r.md, padding: "8px 12px", opacity: active ? 1 : 0.35,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: T.font.display, fontWeight: 800, fontSize: 14, color: active ? cc(c.hue) : "#2a3040" }}>{c.sym}</span>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#34d399" : "#f87171" }} />
                        </div>
                        {active && data.auxBlocks[c.sym] != null && (
                          <div style={{ fontFamily: T.font.display, fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginTop: 2 }}>{data.auxBlocks[c.sym]}</div>
                        )}
                        <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono }}>{active ? "blocks found" : "offline"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 8 }}>RECENT BLOCKS</div>
                <div style={{ background: T.surface.card, borderRadius: T.r.lg, padding: 6, border: `1px solid ${T.state.idle.border}` }}>
                  {data.recentBlocks.map((b, i) => {
                    const coin = COINS.find(c => c.sym === b.coin);
                    const st = b.confirmed ? T.state.found : T.state.mining;
                    return (
                      <div key={i} style={{
                        display: "grid", gridTemplateColumns: "50px 80px 1fr 80px 50px",
                        gap: 8, alignItems: "center", padding: "6px 10px",
                        borderLeft: `2px solid ${st.fg}`, borderRadius: `0 ${T.r.sm}px ${T.r.sm}px 0`,
                        background: `${st.bg}60`, marginBottom: 2, fontSize: 11, fontFamily: T.font.mono,
                      }}>
                        <span style={{ color: cc(coin?.hue || 215), fontWeight: 600 }}>{b.coin}</span>
                        <span style={{ color: "#7a8a9a" }}>#{b.height}</span>
                        <span style={{ color: "#3a4a5a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }}>{b.hash}</span>
                        <span style={{ color: st.fg, fontSize: 10 }}>{b.confirmed ? "✓ Confirmed" : `${b.confs} confs`}</span>
                        <span style={{ color: "#2a3a4a", fontSize: 10 }}>{timeAgo(b.ago)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════ CONNECT ══════ */}
        {view === "connect" && (
          <div key="connect" style={{ animation: "fadeIn 0.25s ease", maxWidth: 680 }}>
            <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 14 }}>QUICK CONNECT — POINT YOUR MINER HERE</div>

            <div style={{ background: T.state.mining.bg, border: `1px solid ${T.state.mining.border}`, borderRadius: T.r.lg, padding: 22, marginBottom: 12 }}>
              <div style={{ fontFamily: T.font.display, fontSize: 17, fontWeight: 800, color: T.state.mining.fg, marginBottom: 14 }}>Pool Mining <span style={{ fontWeight: 400, fontSize: 12, color: "#4a5568" }}>(2% fee · PPLNS)</span></div>

              <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 4 }}>STRATUM URL</div>
              <CopyBlock accent="#4a9eff" value="stratum+tcp://luxxpool.io:3333">stratum+tcp://luxxpool.io:3333</CopyBlock>

              <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>SSL STRATUM (ENCRYPTED)</div>
              <CopyBlock accent="#34d399" value="stratum+ssl://luxxpool.io:3334">stratum+ssl://luxxpool.io:3334</CopyBlock>

              <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>WORKER NAME</div>
              <CopyBlock accent="#8a9ab0" value="YOUR_LTC_ADDRESS.workerName">
                <span style={{ color: "#fb923c" }}>YOUR_LTC_ADDRESS</span>.<span style={{ color: "#a78bfa" }}>workerName</span>
              </CopyBlock>

              <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginTop: 12, marginBottom: 4 }}>PASSWORD</div>
              <CopyBlock accent="#5a6a7a" value="x">x</CopyBlock>
            </div>

            <div style={{ background: T.state.warn.bg, border: `1px solid ${T.state.warn.border}`, borderRadius: T.r.lg, padding: 22, marginBottom: 12 }}>
              <div style={{ fontFamily: T.font.display, fontSize: 17, fontWeight: 800, color: T.state.warn.fg, marginBottom: 14 }}>Solo Mining <span style={{ fontWeight: 400, fontSize: 12, color: "#4a5568" }}>(1% fee · keep 99%)</span></div>
              <div style={{ fontSize: 9, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 4 }}>SOLO STRATUM</div>
              <CopyBlock accent="#fb923c" value="stratum+tcp://luxxpool.io:3336">stratum+tcp://luxxpool.io:3336</CopyBlock>
              <div style={{ fontSize: 11, color: "#4a5568", fontFamily: T.font.mono, marginTop: 8 }}>Same worker & password format. Full block reward goes to your address.</div>
            </div>

            <div style={{ background: T.state.aux.bg, border: `1px solid ${T.state.aux.border}`, borderRadius: T.r.lg, padding: 22 }}>
              <div style={{ fontFamily: T.font.display, fontSize: 17, fontWeight: 800, color: T.state.aux.fg, marginBottom: 10 }}>Merged Mining — Automatic</div>
              <div style={{ fontSize: 12, color: "#6a7a8a", lineHeight: 1.6, fontFamily: T.font.body, marginBottom: 10 }}>
                Connect once to mine LTC. Earn all auxiliary coin rewards automatically via AuxPoW. Zero extra configuration. Zero extra power.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {COINS.filter(c => c.role === "aux").map(c => (
                  <span key={c.sym} style={{
                    padding: "3px 9px", borderRadius: 12, fontSize: 11, fontFamily: T.font.mono,
                    background: `hsla(${c.hue},70%,60%,0.08)`, border: `1px solid hsla(${c.hue},70%,60%,0.2)`,
                    color: cc(c.hue),
                  }}>+ {c.sym}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ FAQ & SETUP ══════ */}
        {view === "faq" && (
          <div key="faq" style={{ animation: "fadeIn 0.25s ease", maxWidth: 780 }}>
            <div style={{ fontFamily: T.font.display, fontSize: 20, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>How to Mine Litecoin with LUXXPOOL</div>
            <div style={{ fontSize: 13, color: "#4a5568", fontFamily: T.font.body, marginBottom: 20 }}>Complete setup guide for Scrypt ASIC miners (Antminer L9, L7, ElphaPex, VOLCMINER, and all Scrypt hardware)</div>

            <FaqSection num="1" title="Get a Litecoin Wallet">
              <p style={{ marginBottom: 10 }}>You need a Litecoin (LTC) wallet address to receive payouts. This is your identity on the pool.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                {[
                  { name: "Litecoin Core", desc: "Official full node — most secure" },
                  { name: "Tangem", desc: "Hardware card — cold storage" },
                  { name: "Trust Wallet", desc: "Mobile — easy, supports LTC + DOGE" },
                  { name: "Exodus", desc: "Desktop + mobile — multi-coin" },
                ].map(w => (
                  <div key={w.name} style={{ padding: "7px 12px", background: "#0a0e17", borderRadius: T.r.sm, border: `1px solid ${T.state.idle.border}` }}>
                    <span style={{ color: "#4a9eff", fontFamily: T.font.mono, fontSize: 12, fontWeight: 600 }}>{w.name}</span>
                    <span style={{ color: "#4a5568", fontSize: 12 }}> — {w.desc}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: "#fb923c", fontSize: 12 }}>⚠ Never use an exchange deposit address as your mining payout address.</p>
            </FaqSection>

            <FaqSection num="2" title="Hardware Requirements">
              <p style={{ marginBottom: 10 }}>LUXXPOOL uses the <strong style={{ color: "#e2e8f0" }}>Scrypt algorithm</strong>. You need a Scrypt ASIC miner — GPU mining is not profitable for Litecoin.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[
                  { name: "Antminer L9", hr: "16-17 GH/s", power: "3,260W" },
                  { name: "Antminer L7", hr: "9.5 GH/s", power: "3,425W" },
                  { name: "ElphaPex DG2", hr: "17 GH/s", power: "3,420W" },
                  { name: "VOLCMINER D1", hr: "11 GH/s", power: "3,200W" },
                ].map(m => (
                  <div key={m.name} style={{ padding: "8px 12px", background: "#0a0e17", borderRadius: T.r.sm, border: `1px solid ${T.state.idle.border}` }}>
                    <div style={{ color: "#e2e8f0", fontFamily: T.font.mono, fontSize: 12, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ color: "#4a5568", fontSize: 11, fontFamily: T.font.mono }}>{m.hr} · {m.power}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12 }}>Also needed: <strong style={{ color: "#e2e8f0" }}>240V 30A dedicated circuit</strong>, ethernet cable (no WiFi), adequate ventilation.</p>
            </FaqSection>

            <FaqSection num="3" title="Configure Your Miner — Step by Step">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { step: "Power on & connect ethernet", detail: "Plug into 240V outlet, connect ethernet to router. Wait for fans and green LED." },
                  { step: "Find your miner's IP", detail: "Use Bitmain IP Reporter, Angry IP Scanner, or check your router's DHCP client list." },
                  { step: "Open web interface", detail: "Enter the IP in your browser (e.g. http://192.168.1.100). Login: root / root" },
                  { step: "Go to Miner Configuration", detail: "Click 'Miner Configuration' — you'll see Pool 1, Pool 2, Pool 3 fields." },
                  { step: "Enter LUXXPOOL settings:", detail: "" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      minWidth: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: T.state.mining.bg, border: `1px solid ${T.state.mining.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: T.state.mining.fg, fontFamily: T.font.mono, fontWeight: 600,
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{s.step}</div>
                      {s.detail && <div style={{ color: "#5a6a7a", fontSize: 12, marginTop: 2 }}>{s.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: 14, background: "#060a12", borderRadius: T.r.md, border: `1px solid ${T.state.mining.border}` }}>
                <div style={{ fontSize: 10, color: T.state.mining.fg, fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 8 }}>MINER CONFIGURATION FIELDS</div>
                <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "5px 12px", fontFamily: T.font.mono, fontSize: 12 }}>
                  <span style={{ color: "#4a5568" }}>Pool 1:</span>
                  <span style={{ color: "#4a9eff" }}>stratum+tcp://luxxpool.io:3333</span>
                  <span style={{ color: "#4a5568" }}>Pool 2:</span>
                  <span style={{ color: "#34d399" }}>stratum+ssl://luxxpool.io:3334</span>
                  <span style={{ color: "#4a5568" }}>Pool 3:</span>
                  <span style={{ color: "#5a6a7a" }}>(backup pool or leave empty)</span>
                  <span style={{ color: "#4a5568" }}>Worker:</span>
                  <span><span style={{ color: "#fb923c" }}>LTC_ADDRESS</span>.<span style={{ color: "#a78bfa" }}>L9_01</span></span>
                  <span style={{ color: "#4a5568" }}>Password:</span>
                  <span style={{ color: "#5a6a7a" }}>x</span>
                </div>
              </div>

              <div style={{ marginTop: 10, padding: "8px 12px", background: T.state.found.bg, border: `1px solid ${T.state.found.border}`, borderRadius: T.r.sm }}>
                <span style={{ color: T.state.found.fg, fontFamily: T.font.mono, fontSize: 12 }}>✓ Click "Save & Apply" — your miner restarts and begins hashing within 1-2 minutes</span>
              </div>
            </FaqSection>

            <FaqSection num="4" title="Merged Mining — 10 Coins at Once">
              <p style={{ marginBottom: 10 }}>LUXXPOOL uses <strong style={{ color: "#e2e8f0" }}>AuxPoW (Auxiliary Proof of Work)</strong> to mine LTC and up to 9 auxiliary Scrypt coins simultaneously. Zero extra configuration, zero extra power, zero extra hardware.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {COINS.map(c => (
                  <div key={c.sym} style={{ padding: "6px 10px", background: "#0a0e17", borderRadius: T.r.sm, border: `1px solid ${T.state.idle.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: cc(c.hue), fontFamily: T.font.mono, fontSize: 12, fontWeight: 600 }}>{c.role === "parent" ? "⛏ " : "+ "}{c.sym}</span>
                    <span style={{ color: "#3a4a5a", fontSize: 11, fontFamily: T.font.mono }}>{c.reward} / {c.blockTime}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#fb923c" }}>Register wallet addresses for each aux coin via the dashboard to receive rewards.</p>
            </FaqSection>

            <FaqSection num="5" title="Pool vs Solo Mining">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, background: T.state.mining.bg, border: `1px solid ${T.state.mining.border}`, borderRadius: T.r.md }}>
                  <div style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: 14, color: T.state.mining.fg, marginBottom: 4 }}>Pool Mining</div>
                  <div style={{ fontSize: 12, color: "#5a6a7a", lineHeight: 1.6 }}>Port <strong style={{ color: "#e2e8f0" }}>3333</strong> · Fee: <strong style={{ color: "#e2e8f0" }}>2%</strong><br />Shares rewards across all miners (PPLNS). More consistent payouts.</div>
                </div>
                <div style={{ padding: 12, background: T.state.warn.bg, border: `1px solid ${T.state.warn.border}`, borderRadius: T.r.md }}>
                  <div style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: 14, color: T.state.warn.fg, marginBottom: 4 }}>Solo Mining</div>
                  <div style={{ fontSize: 12, color: "#5a6a7a", lineHeight: 1.6 }}>Port <strong style={{ color: "#e2e8f0" }}>3336</strong> · Fee: <strong style={{ color: "#e2e8f0" }}>1%</strong><br />Keep 99% of any block you find. Higher variance but bigger individual payouts.</div>
                </div>
              </div>
            </FaqSection>

            <FaqSection num="6" title="Payouts">
              <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "4px 12px", fontFamily: T.font.mono, fontSize: 12 }}>
                <span style={{ color: "#4a5568" }}>Scheme:</span><span style={{ color: "#e2e8f0" }}>PPLNS (Pay Per Last N Shares)</span>
                <span style={{ color: "#4a5568" }}>Min LTC Payout:</span><span style={{ color: "#e2e8f0" }}>0.01 LTC</span>
                <span style={{ color: "#4a5568" }}>Min DOGE Payout:</span><span style={{ color: "#e2e8f0" }}>40 DOGE</span>
                <span style={{ color: "#4a5568" }}>Payout Interval:</span><span style={{ color: "#e2e8f0" }}>Every 10 minutes</span>
                <span style={{ color: "#4a5568" }}>Block Maturity:</span><span style={{ color: "#e2e8f0" }}>100 confirmations (LTC)</span>
                <span style={{ color: "#4a5568" }}>Block Reward:</span><span style={{ color: "#e2e8f0" }}>6.25 LTC (current halving epoch)</span>
              </div>
            </FaqSection>

            <FaqSection num="7" title="Troubleshooting">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { q: "Miner shows 0 hashrate on dashboard", a: "Wait 5-10 minutes. Hashrate is estimated from shares — it needs a window of submissions." },
                  { q: "\"Stratum connection failed\"", a: "Verify URL is stratum+tcp:// (not http://). Check ethernet. Ensure port 3333 isn't firewalled." },
                  { q: "High share reject rate", a: "Check miner clock sync. Ensure unique worker names. If >2% reject rate, try the SSL port (3334)." },
                  { q: "Not receiving DOGE / aux rewards", a: "Register your DOGE address via dashboard settings. Without it, rewards are held (not lost)." },
                  { q: "Multiple miners, same address?", a: "Yes — use different worker names: LTC_ADDR.miner1, LTC_ADDR.miner2, etc." },
                  { q: "Can I switch between pool and solo?", a: "Yes — change your miner's Pool URL from port 3333 to 3336 (or vice versa). Save & Apply." },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: "#0a0e17", borderRadius: T.r.sm, border: `1px solid ${T.state.idle.border}` }}>
                    <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12, marginBottom: 3 }}>{item.q}</div>
                    <div style={{ color: "#5a6a7a", fontSize: 12 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </FaqSection>
          </div>
        )}

        {/* ══════ MINER LOOKUP ══════ */}
        {view === "lookup" && (
          <div key="lookup" style={{ animation: "fadeIn 0.25s ease", maxWidth: 680 }}>
            <div style={{ fontSize: 10, color: "#3a4a5a", fontFamily: T.font.mono, letterSpacing: 2, marginBottom: 14 }}>MINER LOOKUP</div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input
                type="text"
                value={lookupAddr}
                onChange={e => setLookupAddr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLookup()}
                placeholder="Enter your Litecoin address (L..., M..., or ltc1...)"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: T.r.md,
                  background: T.surface.card, border: `1px solid ${T.state.idle.border}`,
                  color: "#e2e8f0", fontFamily: T.font.mono, fontSize: 13,
                }}
              />
              <button
                onClick={handleLookup}
                style={{
                  padding: "10px 20px", borderRadius: T.r.md, border: "none", cursor: "pointer",
                  background: T.state.mining.bg, color: T.state.mining.fg,
                  fontFamily: T.font.mono, fontSize: 12, fontWeight: 600, letterSpacing: 1,
                  borderWidth: 1, borderStyle: "solid", borderColor: T.state.mining.border,
                }}
              >LOOKUP</button>
            </div>

            {lookupResult && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ background: T.surface.card, border: `1px solid ${T.state.idle.border}`, borderRadius: T.r.lg, padding: 20, marginBottom: 12 }}>
                  <div style={{ fontFamily: T.font.mono, fontSize: 12, color: "#4a5568", marginBottom: 4 }}>ADDRESS</div>
                  <div style={{ fontFamily: T.font.mono, fontSize: 14, color: "#e2e8f0", wordBreak: "break-all", marginBottom: 16 }}>{lookupResult.address}</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <Metric label="Hashrate" value={fmtHR(lookupResult.hashrate)} state="mining" />
                    <Metric label="Workers" value={lookupResult.workers} state="found" />
                    <Metric label="24h Shares" value={lookupResult.shares24h.toLocaleString()} state="idle" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                    <Metric label="Pending" value={lookupResult.pendingBalance + " LTC"} state="aux" />
                    <Metric label="Total Paid" value={lookupResult.totalPaid + " LTC"} state="found" />
                    <Metric label="Last Share" value={lookupResult.lastShare} state="mining" />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "#3a4a5a", fontFamily: T.font.mono, textAlign: "center" }}>
                  Demo data — in production, this queries /api/v1/miner/{"{address}"}
                </div>
              </div>
            )}

            {!lookupResult && (
              <div style={{ textAlign: "center", padding: 40, color: "#2a3a4a", fontFamily: T.font.mono, fontSize: 12 }}>
                Enter your Litecoin mining address to view your stats, hashrate, workers, and payment history.
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: "12px 24px", borderTop: `1px solid ${T.state.idle.border}`,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        fontSize: 9, color: "#1e2a3a", fontFamily: T.font.mono,
      }}>
        <span>LUXXPOOL v1.0 — Christina Lake, BC, Canada</span>
        <span>Scrypt Multi-Coin Merged Mining · {COINS.length} coins · PPLNS</span>
      </footer>
    </div>
  );
}
