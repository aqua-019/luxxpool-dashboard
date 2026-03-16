import { useState, useEffect } from "react";

/*
 * LUXXPOOL — Combined Dashboard v2.0
 * Public (blue) + Private (red) with toggle switch
 * Deployed: luxxpool-dashboard.vercel.app
 */

const T = {
  base: "#080c14", card: "#121a28",
  blue: "#4a9eff", green: "#34d399", orange: "#fb923c",
  purple: "#a78bfa", red: "#f87171", teal: "#5DCAA5",
  dim: "#3a4a5a", txt: "#b0bfd0", bright: "#e2e8f0",
  mono: "'Courier New', monospace",
  st: {
    mining: { bg: "#0d2847", b: "rgba(74,158,255,0.2)", fg: "#4a9eff" },
    found:  { bg: "#0d3521", b: "rgba(52,211,153,0.25)", fg: "#34d399" },
    warn:   { bg: "#3b2010", b: "rgba(251,146,60,0.2)", fg: "#fb923c" },
    idle:   { bg: "#141a24", b: "rgba(71,85,105,0.15)", fg: "#475569" },
    aux:    { bg: "#1a1535", b: "rgba(167,139,250,0.2)", fg: "#a78bfa" },
    alert:  { bg: "#2d1215", b: "rgba(248,113,113,0.2)", fg: "#f87171" },
    fleet:  { bg: "#0a2922", b: "rgba(93,202,165,0.2)", fg: "#5DCAA5" },
  },
};

const COINS = [
  { s: "LTC", h: 215, role: "parent", on: true },
  { s: "DOGE", h: 45, role: "aux", on: true }, { s: "BELLS", h: 25, role: "aux", on: true },
  { s: "LKY", h: 140, role: "aux", on: true }, { s: "PEP", h: 150, role: "aux", on: true },
  { s: "DINGO", h: 30, role: "aux", on: true }, { s: "SHIC", h: 35, role: "aux", on: true },
  { s: "JKC", h: 200, role: "aux", on: false }, { s: "TRMP", h: 0, role: "aux", on: false },
  { s: "CRC", h: 280, role: "aux", on: false },
];
const AUX_B = { DOGE: 142, BELLS: 38, LKY: 21, PEP: 17, DINGO: 9, SHIC: 55 };
const cc = (h, a = 1) => `hsla(${h},70%,60%,${a})`;
const fHR = h => h >= 1e12 ? (h/1e12).toFixed(2)+" TH/s" : h >= 1e9 ? (h/1e9).toFixed(1)+" GH/s" : h >= 1e6 ? (h/1e6).toFixed(1)+" MH/s" : Math.round(h)+" H/s";

function M({ label, value, sub, s = "mining" }) {
  const st = T.st[s];
  return <div style={{ background: st.bg, border: `1px solid ${st.b}`, borderRadius: 10, padding: "11px 13px" }}>
    <div style={{ fontSize: 9, color: T.dim, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: T.mono }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: st.fg, marginTop: 2, letterSpacing: -0.5 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: T.dim, fontFamily: T.mono, marginTop: 1 }}>{sub}</div>}
  </div>;
}

function CB({ children, accent = T.blue, value }) {
  const [c, setC] = useState(false);
  const go = () => { navigator.clipboard.writeText(value || "").catch(() => {}); setC(true); setTimeout(() => setC(false), 1500); };
  return <div onClick={go} style={{ background: "#060a12", borderRadius: 4, padding: "10px 12px", fontFamily: T.mono, fontSize: 12, color: accent, cursor: "pointer", border: `1px solid ${c ? T.st.found.b : accent+"22"}`, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
    <span>{children}</span><span style={{ fontSize: 9, color: c ? T.green : T.dim, fontFamily: T.mono }}>{c ? "Copied" : "Click to copy"}</span>
  </div>;
}

function Cd({ children, style }) { return <div style={{ background: T.card, border: `1px solid ${T.st.idle.b}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10, ...style }}>{children}</div>; }
function Se({ children }) { return <div style={{ fontSize: 9, color: T.dim, fontFamily: T.mono, letterSpacing: 1.5, marginBottom: 8 }}>{children}</div>; }

function Spark({ hue = 215 }) {
  const d = Array.from({ length: 60 }, (_, i) => 300 + Math.sin(i*.12)*35 + Math.cos(i*.05)*15 + Math.random()*5);
  const mx = Math.max(...d), mn = Math.min(...d), rg = mx-mn||1;
  const p = d.map((v,i) => `${i*(600/59)},${48-((v-mn)/rg)*44}`).join(" ");
  const c = `hsl(${hue},70%,60%)`;
  return <svg width="100%" viewBox="0 0 600 50" style={{ display:"block" }}><defs><linearGradient id={`g${hue}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="0.2"/><stop offset="100%" stopColor={c} stopOpacity="0"/></linearGradient></defs><polygon points={`0,50 ${p} 600,50`} fill={`url(#g${hue})`}/><polyline points={p} fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

function Faq({ num, title, children }) {
  const [open, setOpen] = useState(true);
  return <div style={{ marginBottom: 12 }}>
    <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", marginBottom: open ? 6 : 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: T.st.mining.bg, border: `1px solid ${T.st.mining.b}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontWeight: 800, fontSize: 12, color: T.blue, flexShrink: 0 }}>{num}</div>
      <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: T.bright }}>{title}</div>
      <span style={{ color: T.dim, transform: open ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
    </div>
    {open && <div style={{ background: T.card, border: `1px solid ${T.st.idle.b}`, borderRadius: 10, padding: 14, fontSize: 12, color: "#8a9ab0", lineHeight: 1.6 }}>{children}</div>}
  </div>;
}

function NavBar({ items, cur, set, accent }) {
  return <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
    {items.map(v => <button key={v.id} onClick={() => set(v.id)} style={{ padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 10, letterSpacing: 1, fontFamily: T.mono, fontWeight: 600, background: cur === v.id ? accent.bg : "transparent", color: cur === v.id ? accent.fg : T.dim, transition: "all 0.15s" }}>{v.label}</button>)}
  </div>;
}

function useTick() {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT(k => k+1), 3000); return () => clearInterval(i); }, []);
  return 325e9 + Math.sin(t*0.08)*20e9 + Math.cos(t*0.03)*10e9;
}

const BLOCKS = [
  { c:"LTC", h:"2,847,255", hash:"a3f8e2d1...cb41", ok:true, cf:142, ago:"1h" },
  { c:"DOGE", h:"5,281,034", hash:"d7c2b8a1...9e72", ok:true, cf:89, ago:"30m" },
  { c:"SHIC", h:"52,019", hash:"f1e2d3c4...3a1b", ok:false, cf:12, ago:"10m" },
  { c:"BELLS", h:"189,234", hash:"pending...", ok:false, cf:3, ago:"2m" },
  { c:"LTC", h:"2,847,261", hash:"mining...", ok:false, cf:0, ago:"15s" },
];
const FLEET = Array.from({ length: 20 }, (_, i) => ({ w: `LhXk7...abc.L9_${String(i+1).padStart(2,"0")}`, hr: (15.5+Math.random()*2).toFixed(1), sh: Math.floor(800+Math.random()*500), up: Math.floor(12+Math.random()*36) }));
const SEC_EV = [
  { type:"SYBIL_SUSPECTED", d:"203.0.113.42 — 4 addresses · added to fleet", ago:"2h", c:T.orange },
  { type:"SHARE_FLOOD", d:"45.33.22.11 — 47 shares/sec · auto-banned", ago:"6h", c:T.red },
  { type:"TIMING_ANOMALY", d:"91.120.45.8 — CV 0.012 · monitoring", ago:"1d", c:T.blue },
];
const BLK_EV = [
  { t:"Block found", d:"LTC #2,847,261 by L9_07", c:T.green, ago:"15s" },
  { t:"Block confirmed", d:"DOGE #5,281,034 — 89 confs", c:T.green, ago:"30m" },
  { t:"Aux block", d:"SHIC #52,019 — pending", c:T.blue, ago:"10m" },
  { t:"Block confirmed", d:"LTC #2,847,255 — 142 confs", c:T.green, ago:"1h" },
];

// ═══════════════════ PUBLIC VIEWS ═══════════════════

function PubStats({ hr }) {
  return <div style={{ animation: "fadeIn .2s ease" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
      <M label="Pool hashrate" value={fHR(hr)} sub="Scrypt (N=1024, r=1, p=1)"/>
      <M label="Active miners" value="22" sub="26 workers online" s="found"/>
      <M label="Network difficulty" value="28.5M" sub="Block 2,847,261" s="idle"/>
      <M label="Coins mining" value="7" sub="LTC + 6 aux merged" s="aux"/>
      <M label="Pool fee" value="2%" sub="Solo: 1%"/>
    </div>
    <Cd><Se>Pool hashrate — 24h</Se><Spark hue={215}/></Cd>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div><Se>Merged mining — earn all coins automatically</Se>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
          {COINS.filter(c=>c.role==="aux").map(c=> <div key={c.s} style={{ padding: "7px 10px", borderRadius: 6, background: c.on ? cc(c.h,.05) : T.card, border: `1px solid ${c.on?cc(c.h,.15):T.st.idle.b}`, opacity: c.on?1:.35 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontWeight:800, fontSize:13, color: c.on?cc(c.h):"#2a3040" }}>{c.s}</span><span style={{ width:5, height:5, borderRadius:"50%", background: c.on?T.green:T.red }}/></div>
            {c.on && AUX_B[c.s]!=null && <div style={{ fontWeight:800, fontSize:16, color:T.bright, marginTop:1 }}>{AUX_B[c.s]}</div>}
            <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono }}>{c.on?"blocks found":"offline"}</div>
          </div>)}
        </div>
      </div>
      <div><Se>Recent blocks</Se><Cd style={{ padding:"4px 6px" }}>
        {BLOCKS.map((b,i)=>{ const col=b.ok?T.green:T.blue; return <div key={i} style={{ display:"grid", gridTemplateColumns:"44px 70px 1fr 70px 40px", gap:6, alignItems:"center", padding:"5px 8px", fontSize:10, fontFamily:T.mono, borderLeft:`2px solid ${col}`, borderRadius:"0 4px 4px 0", background:b.ok?"rgba(52,211,153,.06)":"rgba(74,158,255,.06)", marginBottom:2 }}><span style={{ color:col, fontWeight:600 }}>{b.c}</span><span style={{ color:"#7a8a9a" }}>#{b.h}</span><span style={{ color:T.dim, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:9 }}>{b.hash}</span><span style={{ color:col, fontSize:9 }}>{b.ok?"Confirmed":`${b.cf} confs`}</span><span style={{ color:"#2a3a4a", fontSize:9 }}>{b.ago}</span></div>; })}
      </Cd></div>
    </div>
  </div>;
}

function PubConnect() {
  return <div style={{ animation:"fadeIn .2s ease", maxWidth:560 }}>
    <Se>Connect your miner</Se>
    <Cd style={{ background:T.st.mining.bg, borderColor:T.st.mining.b }}>
      <div style={{ fontWeight:800, fontSize:15, color:T.blue, marginBottom:10 }}>Pool mining <span style={{ fontWeight:400, fontSize:11, color:T.dim }}>2% fee · PPLNS</span></div>
      <Se>Stratum URL</Se><CB accent={T.blue} value="stratum+tcp://luxxpool.io:3333">stratum+tcp://luxxpool.io:3333</CB>
      <Se>SSL stratum (encrypted)</Se><CB accent={T.green} value="stratum+ssl://luxxpool.io:3334">stratum+ssl://luxxpool.io:3334</CB>
      <Se>Worker name</Se><CB accent="#8a9ab0" value="YOUR_LTC_ADDRESS.workerName"><span style={{ color:T.orange }}>YOUR_LTC_ADDRESS</span>.<span style={{ color:T.purple }}>workerName</span></CB>
      <Se>Password</Se><CB accent={T.dim} value="x">x</CB>
    </Cd>
    <Cd style={{ background:T.st.warn.bg, borderColor:T.st.warn.b }}>
      <div style={{ fontWeight:800, fontSize:15, color:T.orange, marginBottom:8 }}>Solo mining <span style={{ fontWeight:400, fontSize:11, color:T.dim }}>1% fee · keep 99%</span></div>
      <Se>Solo stratum</Se><CB accent={T.orange} value="stratum+tcp://luxxpool.io:3336">stratum+tcp://luxxpool.io:3336</CB>
      <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginTop:4 }}>Same worker and password format. Full block reward goes to your address.</div>
    </Cd>
    <Cd style={{ background:T.st.aux.bg, borderColor:T.st.aux.b }}>
      <div style={{ fontWeight:800, fontSize:15, color:T.purple, marginBottom:6 }}>Merged mining — automatic</div>
      <div style={{ fontSize:12, color:"#6a7a8a", lineHeight:1.5, marginBottom:8 }}>Connect once to mine LTC. Earn all auxiliary coin rewards automatically via AuxPoW. Zero extra configuration.</div>
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{COINS.filter(c=>c.role==="aux"&&c.on).map(c=><span key={c.s} style={{ padding:"3px 8px", borderRadius:12, fontSize:10, fontFamily:T.mono, background:cc(c.h,.08), border:`1px solid ${cc(c.h,.2)}`, color:cc(c.h) }}>+ {c.s}</span>)}</div>
    </Cd>
  </div>;
}

function PubFaq() {
  return <div style={{ animation:"fadeIn .2s ease", maxWidth:620 }}>
    <div style={{ fontWeight:800, fontSize:17, color:T.bright, marginBottom:2 }}>How to mine Litecoin with LUXXPOOL</div>
    <div style={{ fontSize:12, color:T.dim, marginBottom:14 }}>Setup guide for Scrypt ASIC miners</div>
    <Faq num="1" title="Get a Litecoin wallet"><p style={{ marginBottom:8 }}>You need a Litecoin address to receive payouts. Recommended: <b style={{ color:T.blue }}>Litecoin Core</b>, <b style={{ color:T.blue }}>Tangem</b>, <b style={{ color:T.blue }}>Trust Wallet</b>, <b style={{ color:T.blue }}>Exodus</b>.</p><p style={{ color:T.orange, fontSize:11 }}>Use a wallet you control. Never use an exchange deposit address.</p></Faq>
    <Faq num="2" title="Hardware requirements"><p style={{ marginBottom:8 }}>You need a Scrypt ASIC miner. GPU mining is not profitable.</p><p><b style={{ color:T.bright }}>Antminer L9</b> — 16-17 GH/s, 3,260W &nbsp;|&nbsp; <b style={{ color:T.bright }}>L7</b> — 9.5 GH/s &nbsp;|&nbsp; <b style={{ color:T.bright }}>ElphaPex DG2</b> — 17 GH/s &nbsp;|&nbsp; <b style={{ color:T.bright }}>VOLCMINER D1</b> — 11 GH/s</p><p style={{ marginTop:8 }}>Also needed: 240V 30A circuit, ethernet (not WiFi), ventilation.</p></Faq>
    <Faq num="3" title="Configure your miner"><p style={{ marginBottom:8 }}>1. Power on, connect ethernet, wait for green LED<br/>2. Find miner IP (IP Reporter or router DHCP)<br/>3. Browser → miner IP → login root/root<br/>4. Miner Configuration → enter:</p><div style={{ background:"#060a12", borderRadius:4, padding:10, fontFamily:T.mono, fontSize:11, border:`1px solid ${T.st.mining.b}`, marginBottom:8 }}><span style={{ color:T.dim }}>Pool 1:</span> <span style={{ color:T.blue }}>stratum+tcp://luxxpool.io:3333</span><br/><span style={{ color:T.dim }}>Worker:</span> <span style={{ color:T.orange }}>LTC_ADDRESS</span>.<span style={{ color:T.purple }}>L9_01</span><br/><span style={{ color:T.dim }}>Password:</span> x</div><div style={{ background:T.st.found.bg, border:`1px solid ${T.st.found.b}`, borderRadius:4, padding:"6px 10px", color:T.green, fontFamily:T.mono, fontSize:11 }}>Save & Apply — hashing within 1–2 minutes</div></Faq>
    <Faq num="4" title="Payouts"><span style={{ color:T.dim }}>Scheme:</span> PPLNS &nbsp;|&nbsp; <span style={{ color:T.dim }}>Min:</span> 0.01 LTC &nbsp;|&nbsp; <span style={{ color:T.dim }}>Interval:</span> 10 min &nbsp;|&nbsp; <span style={{ color:T.dim }}>Maturity:</span> 100 confs</Faq>
    <Faq num="5" title="Troubleshooting"><p><b style={{ color:T.bright }}>0 hashrate</b> — Wait 5-10 min. Estimated from shares.</p><p style={{ marginTop:6 }}><b style={{ color:T.bright }}>Connection failed</b> — Verify stratum+tcp:// not http://. Check port 3333.</p><p style={{ marginTop:6 }}><b style={{ color:T.bright }}>High reject rate</b> — Sync clock. Unique worker names. Try SSL :3334.</p><p style={{ marginTop:6 }}><b style={{ color:T.bright }}>No DOGE rewards</b> — Register your DOGE address. Rewards held until then.</p></Faq>
  </div>;
}

function PubLookup() {
  const [addr, setAddr] = useState(""); const [res, setRes] = useState(null);
  const go = () => { if(!addr.trim())return; setRes({ hr:fHR(16.25e9+Math.random()*2e9), wk:Math.ceil(Math.random()*3), sh:Math.floor(5000+Math.random()*20000).toLocaleString(), pend:(Math.random()*.05).toFixed(6), paid:(Math.random()*2.5).toFixed(4), last:Math.floor(Math.random()*120)+"s ago" }); };
  return <div style={{ animation:"fadeIn .2s ease", maxWidth:560 }}>
    <Se>Miner lookup</Se>
    <div style={{ display:"flex", gap:8, marginBottom:16 }}><input value={addr} onChange={e=>setAddr(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter your Litecoin address" style={{ flex:1, padding:"8px 12px", borderRadius:6, background:T.card, border:`1px solid ${T.st.idle.b}`, color:T.bright, fontFamily:T.mono, fontSize:12, outline:"none" }}/><button onClick={go} style={{ padding:"8px 16px", borderRadius:6, border:`1px solid ${T.st.mining.b}`, background:T.st.mining.bg, color:T.blue, fontFamily:T.mono, fontSize:11, fontWeight:600, cursor:"pointer" }}>Look up</button></div>
    {res ? <Cd><div style={{ fontFamily:T.mono, fontSize:11, color:T.dim, marginBottom:2 }}>Address</div><div style={{ fontFamily:T.mono, fontSize:13, color:T.bright, wordBreak:"break-all", marginBottom:12 }}>{addr}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}><M label="Hashrate" value={res.hr}/><M label="Workers" value={res.wk} s="found"/><M label="24h shares" value={res.sh} s="idle"/></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:8 }}><M label="Pending" value={res.pend+" LTC"} s="aux"/><M label="Total paid" value={res.paid+" LTC"} s="found"/><M label="Last share" value={res.last}/></div>
    </Cd> : <div style={{ textAlign:"center", padding:30, color:"#2a3a4a", fontFamily:T.mono, fontSize:11 }}>Enter your mining address to see hashrate, workers, shares, and payments.</div>}
  </div>;
}

// ═══════════════════ PRIVATE VIEWS ═══════════════════

function PrvCmd({ hr }) {
  return <div style={{ animation:"fadeIn .2s ease" }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
      <M label="Pool hashrate" value={fHR(hr)} sub="All miners"/>
      <M label="Fleet hashrate" value="312.5 GH/s" sub="20 LUXX miners (0% fee)" s="fleet"/>
      <M label="Public hashrate" value="14.9 GH/s" sub="2 public miners (2% fee)" s="idle"/>
      <M label="Blocks found" value="47" sub="LTC: 8 · Aux: 39" s="found"/>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
      <M label="Active miners" value="22" sub="20 fleet + 2 public" s="aux"/>
      <M label="Network difficulty" value="28.5M" sub="Block 2,847,261" s="idle"/>
      <M label="Chains active" value="7 / 10" sub="LTC + 6 aux"/>
      <M label="Security" value="Clear" sub="0 active alerts" s="found"/>
    </div>
    <Cd><Se>Hashrate — 24h</Se><Spark hue={0}/></Cd>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      <div><Se>Auxiliary chains</Se><Cd style={{ padding:"6px 8px" }}>{COINS.filter(c=>c.on&&c.role==="aux").map(c=><div key={c.s} style={{ display:"flex", justifyContent:"space-between", padding:"5px 6px", fontSize:11, fontFamily:T.mono }}><span style={{ color:T.teal, fontWeight:600 }}>{c.s}</span><span style={{ color:T.bright }}>{AUX_B[c.s]} blocks</span><span style={{ color:T.green, fontSize:9 }}>synced</span></div>)}</Cd></div>
      <div><Se>Block events</Se><Cd style={{ padding:"6px 8px" }}>{BLK_EV.map((b,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 6px", fontSize:11, fontFamily:T.mono, borderLeft:`2px solid ${b.c}`, borderRadius:"0 4px 4px 0", background:b.c===T.green?"rgba(52,211,153,.04)":"rgba(74,158,255,.04)", marginBottom:2 }}><span><span style={{ color:b.c, fontWeight:600 }}>{b.t}</span> <span style={{ color:T.dim }}>{b.d}</span></span><span style={{ color:"#2a3a4a", fontSize:9 }}>{b.ago}</span></div>)}</Cd></div>
    </div>
  </div>;
}

function PrvSec() {
  const layers = [
    { n:"L1", name:"Mining cookies", desc:"Per-connection HMAC — defends MitM hijacking", st:T.st.mining },
    { n:"L2", name:"Share fingerprinting", desc:"Statistical BWH detection — defends block withholding", st:T.st.aux },
    { n:"L3", name:"Behavioral analysis", desc:"Real-time anomaly — defends floods, ntime, vardiff, sybil", st:T.st.warn },
  ];
  const threats = [
    ["L1","BiteCoin / WireGhost MitM"],["L2","Block withholding (BWH/FAW)"],["L3","Share flooding / DDoS"],["L3","Ntime manipulation / time-warp"],
    ["L3","VarDiff gaming"],["L3","Sybil detection"],["L3","Hashrate oscillation"],["L2","Infiltrated selfish mining"],
  ];
  const lc = l => l==="L1"?T.blue:l==="L2"?T.purple:T.orange;
  return <div style={{ animation:"fadeIn .2s ease" }}>
    <Se>Security engine — 3 layers</Se>
    {layers.map(l=><div key={l.n} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:6, marginBottom:4, border:`1px solid ${l.st.b}`, background:l.st.bg+"80" }}>
      <div style={{ width:24, height:24, borderRadius:6, background:l.st.bg, border:`1px solid ${l.st.b}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:l.st.fg, fontFamily:T.mono, flexShrink:0 }}>{l.n}</div>
      <div style={{ flex:1 }}><div style={{ fontWeight:500, color:T.bright, fontSize:13 }}>{l.name}</div><div style={{ fontSize:11, color:T.dim }}>{l.desc}</div></div>
      <span style={{ padding:"2px 8px", borderRadius:10, fontSize:9, fontFamily:T.mono, fontWeight:600, background:"rgba(52,211,153,.1)", color:T.green }}>Active</span>
    </div>)}
    <div style={{ marginTop:14 }}><Se>Threat model</Se><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
      {threats.map(([l,t],i)=><Cd key={i} style={{ padding:"8px 10px" }}><span style={{ padding:"2px 6px", borderRadius:8, fontSize:9, fontFamily:T.mono, fontWeight:600, background:lc(l)+"18", color:lc(l), marginRight:6 }}>{l}</span><span style={{ fontSize:12, color:T.bright }}>{t}</span></Cd>)}
    </div></div>
    <div style={{ marginTop:14 }}><Se>Recent events</Se><Cd style={{ padding:"6px 8px" }}>
      {SEC_EV.map((e,i)=><div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 8px", borderRadius:4, marginBottom:3, background:e.c+"0a", fontSize:11, fontFamily:T.mono }}><span style={{ color:e.c }}>{e.type}</span><span style={{ color:T.dim, fontSize:9 }}>{e.d} · {e.ago}</span></div>)}
    </Cd></div>
    <div style={{ fontSize:10, color:T.dim, fontFamily:T.mono, marginTop:4 }}>Security applies to public miners only. Fleet bypasses L2 + L3.</div>
  </div>;
}

function PrvFleet() {
  return <div style={{ animation:"fadeIn .2s ease" }}>
    <Se>Fleet management</Se>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
      <M label="Fleet miners" value="20" sub="of 100 capacity" s="fleet"/>
      <M label="Public miners" value="2" sub="Standard 2% fee" s="idle"/>
      <M label="Fleet hashrate" value="312.5 GH/s" sub="95.4% of pool" s="fleet"/>
      <M label="Fleet fee" value="0%" sub="Full block reward"/>
    </div>
    <Se>Fleet miners — Christina Lake facility</Se>
    <Cd style={{ padding:0, overflow:"hidden" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 60px", gap:6, padding:"6px 10px", fontSize:9, fontFamily:T.mono, color:T.dim, letterSpacing:1, borderBottom:`1px solid ${T.st.idle.b}` }}><span>Worker</span><span>Hashrate</span><span>Shares</span><span>Uptime</span></div>
      <div style={{ maxHeight:260, overflowY:"auto" }}>
        {FLEET.map((m,i)=><div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 60px", gap:6, padding:"5px 10px", fontSize:11, fontFamily:T.mono, borderBottom:"1px solid rgba(71,85,105,.08)", alignItems:"center" }}>
          <span style={{ color:T.teal }}>{m.w}</span><span style={{ color:T.bright }}>{m.hr} GH/s</span><span style={{ color:T.dim }}>{m.sh.toLocaleString()}</span><span style={{ color:T.dim }}>{m.up}h</span>
        </div>)}
      </div>
    </Cd>
    <div style={{ marginTop:10 }}><Se>Fleet configuration</Se><Cd>
      <div style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:"4px 10px", fontFamily:T.mono, fontSize:11 }}>
        <span style={{ color:T.dim }}>IPs:</span><span style={{ color:T.teal }}>203.0.113.100 (facility)</span>
        <span style={{ color:T.dim }}>Addresses:</span><span style={{ color:T.teal }}>LhXk7...abc</span>
        <span style={{ color:T.dim }}>Capacity:</span><span style={{ color:T.bright }}>20 / 100</span>
        <span style={{ color:T.dim }}>Fee:</span><span style={{ color:T.green }}>0%</span>
        <span style={{ color:T.dim }}>Bypasses:</span><span style={{ color:T.bright }}>IP limits, banning, sybil, anomaly</span>
      </div>
    </Cd></div>
  </div>;
}

function PrvConn() {
  return <div style={{ animation:"fadeIn .2s ease", maxWidth:500 }}>
    <Se>Connection details</Se><Cd>
      <div style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:"6px 12px", fontFamily:T.mono, fontSize:12 }}>
        <span style={{ color:T.dim }}>Pool:</span><span style={{ color:T.blue }}>stratum+tcp://luxxpool.io:3333</span>
        <span style={{ color:T.dim }}>SSL:</span><span style={{ color:T.green }}>stratum+ssl://luxxpool.io:3334</span>
        <span style={{ color:T.dim }}>Solo:</span><span style={{ color:T.orange }}>stratum+tcp://luxxpool.io:3336</span>
        <span style={{ color:T.dim }}>API:</span><span style={{ color:T.purple }}>http://luxxpool.io:8080</span>
        <span style={{ color:T.dim }}>Worker:</span><span><span style={{ color:T.orange }}>LTC_ADDRESS</span>.<span style={{ color:T.purple }}>workerName</span></span>
        <span style={{ color:T.dim }}>Password:</span><span style={{ color:"#5a6a7a" }}>x</span>
      </div>
    </Cd>
    <Se>Endpoint status</Se>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      <M label="Pool :3333" value="22 miners" s="found"/><M label="SSL :3334" value="0 miners" s="found"/>
      <M label="Solo :3336" value="0 miners" s="found"/><M label="API :8080" value="Online" s="found"/>
    </div>
  </div>;
}

// ═══════════════════ MAIN APP ═══════════════════

export default function App() {
  const [mode, setMode] = useState("public");
  const [pubView, setPubView] = useState("stats");
  const [prvView, setPrvView] = useState("cmd");
  const hr = useTick();
  const prv = mode === "private";

  const pubNavItems = [{ id:"stats", label:"Pool stats" },{ id:"connect", label:"Connect" },{ id:"faq", label:"Setup guide" },{ id:"lookup", label:"Miner lookup" }];
  const prvNavItems = [{ id:"cmd", label:"Command" },{ id:"sec", label:"Security" },{ id:"fleet", label:"Fleet" },{ id:"conn", label:"Connect" }];

  return (
    <div style={{ minHeight: "100vh", background: T.base, color: T.txt, fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#080c14}::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:3px}
        input:focus{outline:none}
      `}</style>

      <header style={{ padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.st.idle.b}`, background:"rgba(8,12,20,0.95)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:6, background:prv?"linear-gradient(135deg,#f87171,#fb923c)":"linear-gradient(135deg,#4a9eff,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#080c14", transition:"all .3s" }}>L</div>
          <div>
            <div style={{ fontWeight:800, fontSize:15, color:T.bright, letterSpacing:.5, lineHeight:1 }}>LUXX<span style={{ color:prv?T.red:T.blue, transition:"color .3s" }}>POOL</span></div>
            <div style={{ fontSize:9, color:T.dim, fontFamily:T.mono, letterSpacing:1.5 }}>{prv?"Operator dashboard":"Scrypt multi-coin merged mining"}</div>
          </div>
        </div>

        {prv
          ? <NavBar items={prvNavItems} cur={prvView} set={setPrvView} accent={T.st.alert}/>
          : <NavBar items={pubNavItems} cur={pubView} set={setPubView} accent={T.st.mining}/>}

        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div onClick={()=>setMode(m=>m==="public"?"private":"public")} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", userSelect:"none", padding:"4px 10px", borderRadius:16, background:prv?"rgba(248,113,113,.08)":"rgba(74,158,255,.08)", border:`1px solid ${prv?"rgba(248,113,113,.2)":"rgba(74,158,255,.2)"}`, transition:"all .3s" }}>
            <div style={{ width:28, height:16, borderRadius:8, position:"relative", background:prv?"rgba(248,113,113,.3)":"rgba(74,158,255,.3)", transition:"background .3s" }}>
              <div style={{ width:12, height:12, borderRadius:6, position:"absolute", top:2, left:prv?14:2, background:prv?T.red:T.blue, transition:"left .2s, background .3s" }}/>
            </div>
            <span style={{ fontSize:9, fontFamily:T.mono, fontWeight:600, letterSpacing:1, color:prv?T.red:T.blue, transition:"color .3s", minWidth:44 }}>{prv?"Private":"Public"}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontFamily:T.mono, color:T.green }}><div style={{ width:6, height:6, borderRadius:"50%", background:T.green, animation:"pulse 2s infinite" }}/>Live</div>
        </div>
      </header>

      {!prv && <div style={{ display:"flex", gap:4, padding:"6px 16px", borderBottom:`1px solid ${T.st.idle.b}`, flexWrap:"wrap" }}>
        {COINS.map(c=><span key={c.s} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:12, fontSize:10, fontFamily:T.mono, border:`1px solid ${c.on?cc(c.h,.15):T.st.idle.b}`, color:c.on?cc(c.h):"#2a3040", background:c.on?cc(c.h,.05):"transparent" }}><span style={{ width:4, height:4, borderRadius:"50%", background:c.on?T.green:"#1e2a3a" }}/>{c.s}</span>)}
      </div>}

      <div key={mode+"-"+pubView+"-"+prvView} style={{ padding:"14px 16px", animation:"fadeIn .25s ease", minHeight:440 }}>
        {prv ? (
          prvView==="cmd" ? <PrvCmd hr={hr}/> : prvView==="sec" ? <PrvSec/> : prvView==="fleet" ? <PrvFleet/> : <PrvConn/>
        ) : (
          pubView==="stats" ? <PubStats hr={hr}/> : pubView==="connect" ? <PubConnect/> : pubView==="faq" ? <PubFaq/> : <PubLookup/>
        )}
      </div>

      <footer style={{ padding:"8px 16px", borderTop:`1px solid ${T.st.idle.b}`, display:"flex", justifyContent:"space-between", fontSize:9, color:"#1e2a3a", fontFamily:T.mono }}>
        <span>LUXXPOOL v2.0 — Christina Lake, BC</span>
        <span>{prv ? "Operator · Fleet: 20 · Public: 2" : "Scrypt multi-coin merged mining · 10 coins · PPLNS"}</span>
      </footer>
    </div>
  );
}
