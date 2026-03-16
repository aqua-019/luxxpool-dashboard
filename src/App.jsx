import { useState, useEffect, useCallback, useMemo, Fragment } from "react";

/*
 * LUXXPOOL Dashboard v3.1
 * Full-width responsive · Adaptive viewport · Three skins
 * Terminal · Luxury · Zen
 * Dense metrics · SVG charts · Mobile-first
 */

// ═══════════════════════════════════════════════════════════
// VIEWPORT DETECTION + RESPONSIVE HOOKS
// ═══════════════════════════════════════════════════════════

function useViewport() {
  const [vp, setVP] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1200, h: typeof window !== "undefined" ? window.innerHeight : 800 });
  useEffect(() => {
    const handler = () => setVP({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const mobile = vp.w < 768;
  const tablet = vp.w >= 768 && vp.w < 1200;
  const desktop = vp.w >= 1200;
  const wide = vp.w >= 1600;
  const cols = mobile ? 2 : tablet ? 3 : wide ? 6 : 5;
  const pad = mobile ? "12px" : tablet ? "20px" : "32px";
  const gap = mobile ? 6 : tablet ? 8 : 12;
  const fontSize = mobile ? 0.85 : tablet ? 0.92 : 1;
  return { ...vp, mobile, tablet, desktop, wide, cols, pad, gap, fontSize };
}

// ═══════════════════════════════════════════════════════════
// DATA ENGINE
// ═══════════════════════════════════════════════════════════

const COINS=[{s:"LTC",h:215,on:1,role:"parent"},{s:"DOGE",h:45,on:1},{s:"BELLS",h:25,on:1},{s:"LKY",h:140,on:1},{s:"PEP",h:150,on:1},{s:"DINGO",h:30,on:1},{s:"SHIC",h:35,on:1},{s:"JKC",h:200,on:0},{s:"TRMP",h:0,on:0},{s:"CRC",h:280,on:0}];
const AUX={DOGE:{blocks:142,hr:18.2e9,lastBlock:"12m",reward:"10,000"},BELLS:{blocks:38,hr:4.1e9,lastBlock:"2h",reward:"Random"},LKY:{blocks:21,hr:2.8e9,lastBlock:"4h",reward:"Halving"},PEP:{blocks:17,hr:1.9e9,lastBlock:"6h",reward:"Halving"},DINGO:{blocks:9,hr:0.8e9,lastBlock:"14h",reward:"Variable"},SHIC:{blocks:55,hr:8.3e9,lastBlock:"45m",reward:"Halving"}};
const fH=h=>h>=1e12?(h/1e12).toFixed(2)+" TH/s":h>=1e9?(h/1e9).toFixed(1)+" GH/s":h>=1e6?(h/1e6).toFixed(1)+" MH/s":Math.round(h)+" H/s";
const FLEET=Array.from({length:20},(_,i)=>({w:`L9_${String(i+1).padStart(2,"0")}`,hr:15.5+Math.random()*2,sh:Math.floor(800+Math.random()*500),rej:(Math.random()*1.5).toFixed(2),up:Math.floor(12+Math.random()*36),temp:Math.floor(62+Math.random()*12),power:Math.floor(3180+Math.random()*120),accepted:Math.floor(780+Math.random()*500),stale:Math.floor(Math.random()*8),fan:Math.floor(4200+Math.random()*800),chipFreq:Math.floor(580+Math.random()*40)}));

const BLOCKS_HISTORY=[
  {c:"LTC",h:2847261,t:"15s",r:"6.25 LTC",w:"L9_07",conf:0},
  {c:"DOGE",h:5281034,t:"12m",r:"10,000 DOGE",w:"pool",conf:89},
  {c:"SHIC",h:52019,t:"45m",r:"500 SHIC",w:"pool",conf:12},
  {c:"BELLS",h:189234,t:"2h",r:"Random",w:"pool",conf:147},
  {c:"LTC",h:2847255,t:"3h",r:"6.25 LTC",w:"L9_12",conf:412},
  {c:"DOGE",h:5280998,t:"5h",r:"10,000 DOGE",w:"pool",conf:523},
  {c:"LKY",h:89421,t:"8h",r:"50 LKY",w:"pool",conf:890},
  {c:"PEP",h:42187,t:"14h",r:"5,000 PEP",w:"pool",conf:1247},
];

const SEC_EVENTS=[
  {type:"SYBIL_SUSPECTED",ip:"203.0.113.42",d:"4 addresses from single IP",action:"Added to fleet whitelist",sev:"medium",t:"2h"},
  {type:"SHARE_FLOOD",ip:"45.33.22.11",d:"47 shares/sec (limit: 10)",action:"Auto-banned",sev:"critical",t:"6h"},
  {type:"TIMING_ANOMALY",ip:"91.120.45.8",d:"CV 0.012 — constant interval",action:"Monitoring",sev:"low",t:"1d"},
  {type:"NTIME_DRIFT",ip:"78.44.12.90",d:"ntime +340s from server",action:"Auto-banned",sev:"critical",t:"2d"},
  {type:"VARDIFF_GAMING",ip:"112.33.44.5",d:"16x difficulty swing detected",action:"Monitoring",sev:"medium",t:"3d"},
  {type:"BWH_PATTERN",ip:"91.120.45.8",d:"1,847 shares, 0 blocks over 72h",action:"Flagged for review",sev:"low",t:"4d"},
];

const PAYMENTS_RECENT=[
  {addr:"LhXk7...abc",amt:"0.0847 LTC",tx:"a3f8e2...cb41",t:"2h"},
  {addr:"Ltc1q...def",amt:"0.0123 LTC",tx:"d7c2b8...9e72",t:"12h"},
  {addr:"M3xp7...ghi",amt:"0.0456 LTC",tx:"f1e2d3...3a1b",t:"1d"},
];

function useData(){
  const[t,setT]=useState(0);
  const[hrHist]=useState(()=>Array.from({length:72},(_,i)=>290+Math.sin(i*.12)*40+Math.cos(i*.04)*25+Math.random()*10));
  const[shareHist]=useState(()=>Array.from({length:24},()=>Math.floor(800+Math.random()*600)));
  const[minerHist]=useState(()=>Array.from({length:24},()=>Math.floor(18+Math.random()*8)));
  const[diffHist]=useState(()=>Array.from({length:30},(_,i)=>28+Math.sin(i*.2)*1.5+Math.random()*.5));
  const[blockTimeHist]=useState(()=>Array.from({length:20},()=>Math.floor(100+Math.random()*200)));
  useEffect(()=>{const i=setInterval(()=>setT(k=>{
    hrHist.push(290+Math.sin((k+72)*.12)*40+Math.cos((k+72)*.04)*25+Math.random()*10);hrHist.shift();
    shareHist.push(Math.floor(800+Math.random()*600));shareHist.shift();
    minerHist.push(Math.floor(18+Math.random()*8));minerHist.shift();
    return k+1;
  }),3000);return()=>clearInterval(i)},[]);
  const hr=325e9+Math.sin(t*.08)*20e9+Math.cos(t*.03)*10e9;
  return{hr,hrHist,shareHist,minerHist,diffHist,blockTimeHist,t,
    miners:22,workers:26,diff:28462819,height:2847261+Math.floor(t/10),
    fee:"2%",soloFee:"1%",rejectRate:"0.8%",avgShareTime:"14.7s",staleRate:"0.3%",
    blocksLTC:8,blocksAux:39,blocksTotal:47,totalShares24h:"18,247",roundShares:"1,284",
    ltcEarned:"2.847",dogeEarned:"14,200",uptime:"14d 7h",lastBlock:"15s",
    fleetHR:312.5e9,pubHR:14.9e9,fleetPct:"95.4%",
    payoutsPending:"0.0234 LTC",payoutsTotal:"18.42 LTC",payoutCount:247,
    secAlerts:0,bannedIPs:3,secScore:"98/100",connectionsPeak:34,
    netHashrate:"847.3 TH/s",poolShare:"0.038%",luck:"112%",avgBlockTime:"4.2h",
    estDailyL9:"0.0089 LTC",estMonthlyL9:"0.267 LTC",estDailyDOGE:"142 DOGE",
    bestShare:"2.14B",worstBlock:"18h 42m",bestBlock:"12m",
    apiRequests24h:"4,712",stratumConns:22,sslConns:0,soloConns:0,
    bandwidth:"2.4 MB/s",latencyAvg:"12ms",
    fleetPower:"64.8 kW",fleetEfficiency:"5.06 GH/kW",
  };
}

// ═══════════════════════════════════════════════════════════
// SVG CHARTS
// ═══════════════════════════════════════════════════════════

function Spark({data=[],w=400,h=50,color="#4a9eff",fill=true,label=""}){
  if(data.length<2)return null;
  const mx=Math.max(...data),mn=Math.min(...data),rg=mx-mn||1;
  const pts=data.map((v,i)=>`${i*(w/(data.length-1))},${h-4-((v-mn)/rg)*(h-12)}`).join(" ");
  return<svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
    {fill&&<><defs><linearGradient id={`sf${color.slice(1)}${w}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0.02"/></linearGradient></defs>
    <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sf${color.slice(1)}${w})`}/></>}
    <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    {label&&<text x="4" y="12" fill={color} fontSize="10" fontFamily="inherit" opacity="0.7">{label}</text>}
  </svg>;
}

function Bar({data=[],w=400,h=80,color="#4a9eff",labels=[]}){
  if(!data.length)return null;
  const mx=Math.max(...data,1);const bw=w/data.length*.7;const gap=w/data.length*.3;
  return<svg width="100%" viewBox={`0 0 ${w} ${h+18}`} preserveAspectRatio="none" style={{display:"block"}}>
    {data.map((v,i)=>{const bh=Math.max(1,(v/mx)*(h-4));const x=i*(bw+gap)+gap/2;
    return<g key={i}><rect x={x} y={h-bh} width={bw} height={bh} rx="2" fill={color} opacity={0.5+0.5*(v/mx)}/>{labels[i]&&<text x={x+bw/2} y={h+14} textAnchor="middle" fill="#555" fontSize="9" fontFamily="inherit">{labels[i]}</text>}</g>;})}
  </svg>;
}

function Donut({segments=[],size=120,stroke=14,centerLabel="",centerValue=""}){
  const total=segments.reduce((a,s)=>a+s.value,0)||1;const r=(size-stroke)/2;const circ=2*Math.PI*r;let offset=0;
  return<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {segments.map((s,i)=>{const len=(s.value/total)*circ;const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${len} ${circ-len}`} strokeDashoffset={-offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>;offset+=len;return el;})}
    {centerLabel&&<text x={size/2} y={size/2-8} textAnchor="middle" fill="#666" fontSize="10" fontFamily="inherit">{centerLabel}</text>}
    {centerValue&&<text x={size/2} y={size/2+10} textAnchor="middle" fill="#ccc" fontSize="18" fontWeight="700" fontFamily="inherit">{centerValue}</text>}
  </svg>;
}

function MiniBar({value=0,max=100,color="#4a9eff",h=5}){
  return<svg width="100%" height={h} style={{display:"block"}}><rect width="100%" height={h} rx={h/2} fill={color+"22"}/><rect width={`${Math.min(100,(value/max)*100)}%`} height={h} rx={h/2} fill={color}/></svg>;
}

function HeatBar({value=0,low=0,high=100,goodColor="#34d399",badColor="#f87171"}){
  const pct=Math.min(100,Math.max(0,((value-low)/(high-low))*100));
  const color=pct>70?badColor:pct>50?"#fb923c":goodColor;
  return<svg width="100%" height="6" style={{display:"block"}}><rect width="100%" height="6" rx="3" fill="#1a1a1a"/><rect width={`${pct}%`} height="6" rx="3" fill={color}/></svg>;
}

// ═══════════════════════════════════════════════════════════
// COPY HOOK
// ═══════════════════════════════════════════════════════════

function useCopy(){const[c,setC]=useState("");const go=useCallback(v=>{navigator.clipboard.writeText(v).catch(()=>{});setC(v);setTimeout(()=>setC(""),1500);},[]);return[c,go];}

// ═══════════════════════════════════════════════════════════
// RESPONSIVE GRID COMPONENT
// ═══════════════════════════════════════════════════════════

function G({cols=5,gap=8,children,style={},vp}){
  const v=vp||{mobile:false,tablet:false};
  const c=Math.min(cols,v.mobile?2:v.tablet?Math.min(cols,3):cols);
  return<div style={{display:"grid",gridTemplateColumns:`repeat(${c},1fr)`,gap,...style}}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════
// METRIC CARD (responsive)
// ═══════════════════════════════════════════════════════════

function Metric({label,value,sub,color="#ccc",labelColor="#555",spark=null,mini=null,style={}}){
  return<div style={{padding:"12px 14px",...style}}>
    <div style={{fontSize:10,color:labelColor,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>{label}</div>
    <div style={{fontSize:24,fontWeight:800,color,lineHeight:1.1,letterSpacing:-0.5}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#444",marginTop:2}}>{sub}</div>}
    {spark&&<div style={{marginTop:4}}>{spark}</div>}
    {mini&&<div style={{marginTop:4}}>{mini}</div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC VIEWS (shared across all skins via render props)
// ═══════════════════════════════════════════════════════════

function PubStatsContent({D,vp,colors,fonts}){
  const{a1,a2,a3,a4,a5,dim,br,card}=colors;
  return<>
    <G vp={vp} cols={6} gap={vp.gap}>
      <Metric label="Pool hashrate" value={fH(D.hr)} sub="Scrypt N=1024 r=1 p=1" color={a1} spark={<Spark data={D.hrHist.slice(-20)} w={200} h={24} color={a1} fill={false}/>}/>
      <Metric label="Active miners" value={D.miners} sub={`${D.workers} workers`} color={a2}/>
      <Metric label="Network diff" value={(D.diff/1e6).toFixed(1)+"M"} sub={`Block ${D.height.toLocaleString()}`} color={dim}/>
      <Metric label="Pool fee" value={D.fee} sub={`Solo: ${D.soloFee}`} color={a5}/>
      <Metric label="Pool share" value={D.poolShare} sub={`of ${D.netHashrate}`} color={a4}/>
      <Metric label="Luck" value={D.luck} sub={`Avg block: ${D.avgBlockTime}`} color={a2}/>
    </G>
    <G vp={vp} cols={6} gap={vp.gap} style={{marginTop:vp.gap}}>
      <Metric label="Est. daily / L9" value={D.estDailyL9} sub={`Monthly: ${D.estMonthlyL9}`} color={a5}/>
      <Metric label="Reject rate" value={D.rejectRate} sub={`Stale: ${D.staleRate}`} color={a2} mini={<MiniBar value={0.8} max={5} color={a2}/>}/>
      <Metric label="Shares 24h" value={D.totalShares24h} sub={`Round: ${D.roundShares}`} color={a1}/>
      <Metric label="Avg share time" value={D.avgShareTime} color={dim}/>
      <Metric label="Blocks found" value={D.blocksTotal} sub={`LTC: ${D.blocksLTC} · Aux: ${D.blocksAux}`} color={a2}/>
      <Metric label="Uptime" value={D.uptime} sub={`Last block: ${D.lastBlock}`} color={a2}/>
    </G>

    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap} style={{marginTop:vp.gap*2}}>
      <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>HASHRATE — 72H</div>
        <Spark data={D.hrHist} w={800} h={vp.mobile?60:80} color={a1}/>
      </div>
      <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>SHARES SUBMITTED — 24H</div>
        <Bar data={D.shareHist} w={800} h={vp.mobile?50:70} color={a4} labels={D.shareHist.map((_,i)=>i%4===0?`${i}h`:"")}/>
      </div>
    </G>

    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap} style={{marginTop:vp.gap*2}}>
      <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>MINER COUNT — 24H</div>
        <Bar data={D.minerHist} w={800} h={vp.mobile?50:60} color={a2} labels={D.minerHist.map((_,i)=>i%6===0?`${i}h`:"")}/>
      </div>
      <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>DIFFICULTY — 30D</div>
        <Spark data={D.diffHist} w={800} h={vp.mobile?50:60} color={a5} label="M"/>
      </div>
    </G>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>MERGED MINING — AUXILIARY CHAINS</div>
      <G vp={vp} cols={vp.mobile?2:3} gap={vp.gap}>
        {Object.entries(AUX).map(([k,v])=><div key={k} style={{background:card,borderRadius:8,padding:vp.mobile?10:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:vp.mobile?14:16,color:br}}>{k}</span>
            <span style={{width:6,height:6,borderRadius:"50%",background:a2}}/>
          </div>
          <div style={{fontSize:vp.mobile?22:28,fontWeight:800,color:a1}}>{v.blocks}</div>
          <div style={{fontSize:10,color:dim,marginBottom:4}}>blocks found</div>
          <MiniBar value={v.blocks} max={150} color={a1}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginTop:8,fontSize:10,color:dim}}>
            <div>Hash: <span style={{color:br}}>{fH(v.hr)}</span></div>
            <div>Last: <span style={{color:br}}>{v.lastBlock}</span></div>
            <div>Reward: <span style={{color:br}}>{v.reward}</span></div>
          </div>
        </div>)}
      </G>
    </div>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>RECENT BLOCKS</div>
      <div style={{background:card,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:vp.mobile?"60px 1fr 60px":"60px 100px 1fr 120px 100px 80px 60px",gap:8,padding:"8px 12px",fontSize:10,color:dim,borderBottom:"1px solid #1a1a1a"}}>
          <span>COIN</span>{!vp.mobile&&<span>HEIGHT</span>}<span>{vp.mobile?"INFO":"REWARD"}</span>{!vp.mobile&&<Fragment><span>WORKER</span><span>CONFS</span></Fragment>}<span>AGO</span>
        </div>
        {BLOCKS_HISTORY.map((b,i)=>{const col=b.conf>100?a2:a1;return<div key={i} style={{display:"grid",gridTemplateColumns:vp.mobile?"60px 1fr 60px":"60px 100px 1fr 120px 100px 80px 60px",gap:8,padding:"6px 12px",fontSize:vp.mobile?11:13,borderLeft:`2px solid ${col}`,borderBottom:"1px solid #0f0f0f"}}>
          <span style={{color:col,fontWeight:600}}>{b.c}</span>
          {!vp.mobile&&<span style={{color:"#666"}}>#{b.h.toLocaleString()}</span>}
          <span style={{color:br}}>{vp.mobile?b.r:b.r}</span>
          {!vp.mobile&&<Fragment><span style={{color:dim}}>{b.w}</span><span style={{color:col}}>{b.conf>0?`${b.conf} confs`:"mining..."}</span></Fragment>}
          <span style={{color:dim}}>{b.t}</span>
        </div>;})}
      </div>
    </div>
  </>;
}

function PubConnectContent({D,vp,colors,cp,copied}){
  const{a1,a2,a5,dim,br,card}=colors;
  const CL=({label,value,accent})=><div style={{marginBottom:12}}>
    <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:4}}>{label}</div>
    <div onClick={()=>cp(value)} style={{fontSize:vp.mobile?14:18,fontFamily:"'JetBrains Mono',monospace",color:accent,cursor:"pointer",padding:vp.mobile?"10px 12px":"12px 16px",background:card,borderRadius:4,border:`1px solid ${copied===value?a2+"66":"#1a1a1a"}`,display:"flex",justifyContent:"space-between",transition:"border-color 0.2s"}}>
      <span style={{wordBreak:"break-all"}}>{value}</span>
      <span style={{fontSize:10,color:copied===value?a2:dim,flexShrink:0,marginLeft:8}}>{copied===value?"Copied":"Copy"}</span>
    </div>
  </div>;
  return<>
    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap*2}>
      <div>
        <div style={{fontSize:vp.mobile?24:36,fontWeight:800,color:br,marginBottom:4}}>Pool mining <span style={{fontSize:vp.mobile?14:18,fontWeight:400,color:dim}}>2% fee · PPLNS</span></div>
        <CL label="STRATUM URL" value="stratum+tcp://luxxpool.io:3333" accent={a1}/>
        <CL label="SSL STRATUM (ENCRYPTED)" value="stratum+ssl://luxxpool.io:3334" accent={a2}/>
        <CL label="WORKER FORMAT" value="YOUR_LTC_ADDRESS.workerName" accent={a5}/>
        <CL label="PASSWORD" value="x" accent={dim}/>
        <G vp={vp} cols={2} gap={vp.gap} style={{marginTop:12}}>
          <Metric label="Starting diff" value="512" color={dim}/>
          <Metric label="VarDiff range" value="64 – 65,536" color={dim}/>
        </G>
      </div>
      <div>
        <div style={{fontSize:vp.mobile?24:36,fontWeight:800,color:a5,marginBottom:4}}>Solo mining <span style={{fontSize:vp.mobile?14:18,fontWeight:400,color:dim}}>1% fee · keep 99%</span></div>
        <CL label="SOLO STRATUM" value="stratum+tcp://luxxpool.io:3336" accent={a5}/>
        <div style={{fontSize:14,color:dim,lineHeight:1.6,marginBottom:12}}>Full block reward goes to your address. Same worker/password format. Higher variance, bigger individual payouts.</div>
        <G vp={vp} cols={2} gap={vp.gap}>
          <Metric label="Expected block time" value="~847 days" sub="per single L9" color={dim}/>
          <Metric label="Probability 24h" value="0.12%" sub="per single L9" color={dim}/>
        </G>
        <div style={{marginTop:16,fontSize:14,fontWeight:700,color:a2,marginBottom:8}}>Merged mining — automatic</div>
        <div style={{fontSize:13,color:dim,lineHeight:1.6,marginBottom:8}}>Connect once to mine LTC. All auxiliary coins earned automatically via AuxPoW. Zero extra configuration, zero extra power.</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {COINS.filter(c=>c.on&&c.s!=="LTC").map(c=><span key={c.s} style={{padding:"4px 10px",borderRadius:12,fontSize:12,fontFamily:"'JetBrains Mono',monospace",background:`hsla(${c.h},60%,55%,0.08)`,border:`1px solid hsla(${c.h},60%,55%,0.15)`,color:`hsl(${c.h},60%,55%)`}}>+{c.s}</span>)}
        </div>
      </div>
    </G>
  </>;
}

function PubGuideContent({vp,colors}){
  const{a1,a2,a5,dim,br,card}=colors;
  const sections=[
    {t:"Get a Litecoin wallet",b:"You need an LTC address to receive payouts. Recommended wallets: Litecoin Core (full node, most secure), Tangem (hardware card cold storage), Trust Wallet (mobile, supports LTC + DOGE), Exodus (desktop + mobile multi-coin). Use a wallet you control — never use an exchange deposit address for mining payouts."},
    {t:"Hardware requirements",b:"Scrypt ASIC miner required — GPU/CPU mining is not profitable for Litecoin.\n\nAntminer L9 — 16-17 GH/s, 3,260W, ~$5,400\nAntminer L7 — 9.5 GH/s, 3,425W, ~$2,800\nElphaPex DG2 — 17 GH/s, 3,420W, ~$5,500\nVOLCMINER D1 — 11 GH/s, 3,200W, ~$3,200\n\nAlso needed: 240V 30A dedicated circuit, ethernet cable (not WiFi), adequate ventilation (each miner outputs ~11,000 BTU/h of heat)."},
    {t:"Configure your miner — step by step",b:"1. Power on and connect ethernet — wait for fans and green LED\n2. Find your miner's IP — use Bitmain IP Reporter, Angry IP Scanner, or router DHCP list\n3. Open web interface — browser → miner IP → login root/root\n4. Miner Configuration → enter pool settings:\n   Pool 1: stratum+tcp://luxxpool.io:3333\n   Pool 2: stratum+ssl://luxxpool.io:3334\n   Worker: YOUR_LTC_ADDRESS.L9_01\n   Password: x\n5. Save & Apply — miner restarts and begins hashing within 1-2 minutes"},
    {t:"Merged mining — 10 coins at once",b:"LUXXPOOL uses AuxPoW (Auxiliary Proof of Work) to mine LTC and up to 9 auxiliary Scrypt coins simultaneously. Zero extra configuration, zero extra power, zero extra hardware. All aux coins mined automatically. Register wallet addresses for each coin via the dashboard to receive rewards."},
    {t:"Pool vs solo mining",b:"Pool mining (port 3333): 2% fee, PPLNS reward sharing, consistent payouts every 10 minutes. Best for steady income.\n\nSolo mining (port 3336): 1% fee, keep 99% of any block you find. Much higher variance — a single L9 expects ~847 days between blocks. Best for high-risk/high-reward operators."},
    {t:"Payouts",b:"Scheme: PPLNS (Pay Per Last N Shares)\nMinimum payout: 0.01 LTC\nPayout interval: Every 10 minutes\nBlock maturity: 100 confirmations (~4 hours)\nBlock reward: 6.25 LTC (current halving epoch)\nDOGE minimum: 40 DOGE\nPayment method: sendmany batch transactions"},
    {t:"Troubleshooting",b:"Zero hashrate: Wait 5-10 minutes. Hashrate estimated from shares.\nConnection failed: Verify stratum+tcp:// not http://. Check port 3333 isn't firewalled.\nHigh reject rate: Sync miner clock via NTP. Use unique worker names.\nNo DOGE rewards: Register DOGE address via dashboard. Rewards held until registered.\nMultiple miners, same address: Use different worker suffixes — ADDR.L9_01, ADDR.L9_02, etc."},
  ];
  return<G vp={vp} cols={vp.mobile?1:2} gap={vp.gap*2}>
    {sections.map((s,i)=><div key={i} style={{background:card,borderRadius:8,padding:vp.mobile?14:20}}>
      <div style={{fontSize:vp.mobile?16:20,fontWeight:700,color:br,marginBottom:8}}>{s.t}</div>
      <pre style={{fontSize:vp.mobile?12:14,color:dim,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>{s.b}</pre>
    </div>)}
  </G>;
}

function PubLookupContent({D,vp,colors}){
  const{a1,a2,a4,a5,dim,br,card}=colors;
  const[addr,setA]=useState("");const[res,setR]=useState(null);
  const go=()=>{if(!addr.trim())return;setR({hr:fH(16.25e9+Math.random()*2e9),wk:Math.ceil(Math.random()*3),sh:Math.floor(5e3+Math.random()*2e4).toLocaleString(),pend:(Math.random()*.05).toFixed(6),paid:(Math.random()*2.5).toFixed(4),last:Math.floor(Math.random()*120)+"s",rej:(Math.random()*1.2).toFixed(2)+"%",best:fH(Math.random()*5e9),avgDiff:Math.floor(512+Math.random()*512),accepted:Math.floor(5e3+Math.random()*15e3),stale:Math.floor(Math.random()*50),dogeEarned:(Math.random()*500).toFixed(0)+" DOGE"});};
  return<>
    <div style={{display:"flex",gap:vp.mobile?8:12,marginBottom:20}}>
      <input value={addr} onChange={e=>setA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter your Litecoin address (L..., M..., or ltc1...)" style={{flex:1,padding:vp.mobile?"12px":"14px 18px",background:card,border:"1px solid #1a1a1a",color:br,fontFamily:"'JetBrains Mono',monospace",fontSize:vp.mobile?14:17,borderRadius:6,outline:"none"}}/>
      <button onClick={go} style={{padding:vp.mobile?"12px 16px":"14px 24px",background:"transparent",border:`1px solid ${a1}44`,color:a1,fontSize:vp.mobile?13:15,borderRadius:6,cursor:"pointer",flexShrink:0}}>Look up</button>
    </div>
    {res?<>
      <div style={{fontSize:12,color:dim,marginBottom:4}}>Address</div>
      <div style={{fontSize:vp.mobile?12:15,fontFamily:"'JetBrains Mono',monospace",color:br,wordBreak:"break-all",marginBottom:16}}>{addr}</div>
      <G vp={vp} cols={vp.mobile?2:4} gap={vp.gap}>
        <Metric label="Hashrate" value={res.hr} color={a1}/><Metric label="Workers" value={res.wk} color={a2}/>
        <Metric label="Shares 24h" value={res.sh} color={dim}/><Metric label="Accepted" value={res.accepted.toLocaleString()} color={a2}/>
      </G>
      <G vp={vp} cols={vp.mobile?2:4} gap={vp.gap} style={{marginTop:vp.gap}}>
        <Metric label="Pending" value={res.pend+" LTC"} color={a4}/><Metric label="Total paid" value={res.paid+" LTC"} color={a2}/>
        <Metric label="Last share" value={res.last} color={a1}/><Metric label="Reject rate" value={res.rej} color={a5}/>
      </G>
      <G vp={vp} cols={vp.mobile?2:4} gap={vp.gap} style={{marginTop:vp.gap}}>
        <Metric label="Best share" value={res.best} color={dim}/><Metric label="Stale shares" value={res.stale} color={dim}/>
        <Metric label="Avg difficulty" value={res.avgDiff} color={dim}/><Metric label="DOGE earned" value={res.dogeEarned} color={a4}/>
      </G>
    </>:<div style={{textAlign:"center",padding:vp.mobile?30:50,color:"#333",fontSize:vp.mobile?13:15}}>Enter your mining address to view hashrate, workers, shares, payments, and earnings.</div>}
  </>;
}

// ═══════════════════════════════════════════════════════════
// PRIVATE VIEWS
// ═══════════════════════════════════════════════════════════

function PrvCmdContent({D,vp,colors}){
  const{a1,a2,a3,a4,a5,dim,br,card}=colors;
  return<>
    <G vp={vp} cols={vp.mobile?2:6} gap={vp.gap}>
      <Metric label="Pool hashrate" value={fH(D.hr)} color={a1} spark={<Spark data={D.hrHist.slice(-20)} w={200} h={20} color={a1} fill={false}/>}/>
      <Metric label="Fleet hashrate" value={fH(D.fleetHR)} sub="20 LUXX · 0% fee" color={a3}/>
      <Metric label="Public hashrate" value={fH(D.pubHR)} sub="2 miners · 2% fee" color={dim}/>
      <Metric label="Blocks found" value={D.blocksTotal} sub={`LTC: ${D.blocksLTC} · Aux: ${D.blocksAux}`} color={a2}/>
      <Metric label="Security" value={(D.secStatus||"clear").toUpperCase()} sub={`Score: ${D.secScore||"--"}`} color={a2}/>
      <Metric label="Luck" value={D.luck} sub={`Best: ${D.bestBlock}`} color={a5}/>
    </G>
    <G vp={vp} cols={vp.mobile?2:6} gap={vp.gap} style={{marginTop:vp.gap}}>
      <Metric label="Active miners" value={D.miners} sub={`${D.workers} workers`} color={a4}/>
      <Metric label="Network diff" value={(D.diff/1e6).toFixed(1)+"M"} color={dim}/>
      <Metric label="Pool share" value={D.poolShare} sub={`Net: ${D.netHashrate}`} color={a4}/>
      <Metric label="Payouts total" value={D.payoutsTotal} sub={`${D.payoutCount} payments`} color={a2}/>
      <Metric label="Pending" value={D.payoutsPending} color={a5}/>
      <Metric label="Uptime" value={D.uptime} color={a2}/>
    </G>

    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap} style={{marginTop:vp.gap*2}}>
      <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>HASHRATE — 72H</div>
        <Spark data={D.hrHist} w={800} h={vp.mobile?50:70} color={a3}/>
      </div>
      <div style={{display:"flex",gap:16,background:card,borderRadius:8,padding:vp.mobile?12:16,alignItems:"center"}}>
        <Donut segments={[{value:312.5,color:a3},{value:14.9,color:dim}]} size={vp.mobile?90:120} stroke={12} centerLabel="fleet" centerValue={D.fleetPct}/>
        <div>
          <div style={{fontSize:14,color:br,fontWeight:700,marginBottom:8}}>Fleet vs public</div>
          <div style={{fontSize:13,color:a3}}>■ Fleet: {fH(D.fleetHR)} (20 miners)</div>
          <div style={{fontSize:13,color:dim}}>■ Public: {fH(D.pubHR)} (2 miners)</div>
          <div style={{fontSize:11,color:dim,marginTop:8}}>Fleet power: {D.fleetPower}</div>
          <div style={{fontSize:11,color:dim}}>Efficiency: {D.fleetEfficiency}</div>
        </div>
      </div>
    </G>

    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap} style={{marginTop:vp.gap*2}}>
      <div>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>AUX CHAINS</div>
        <div style={{background:card,borderRadius:8,padding:"4px 0"}}>
          {Object.entries(AUX).map(([k,v])=><div key={k} style={{display:"grid",gridTemplateColumns:"60px 80px 1fr 60px",gap:8,padding:"6px 12px",fontSize:13,alignItems:"center"}}>
            <span style={{color:a3,fontWeight:600}}>{k}</span><span style={{color:br}}>{v.blocks} blk</span><MiniBar value={v.blocks} max={150} color={a3}/><span style={{color:dim,fontSize:10}}>{v.lastBlock}</span>
          </div>)}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>BLOCK EVENTS</div>
        <div style={{background:card,borderRadius:8,padding:"4px 0"}}>
          {BLOCKS_HISTORY.slice(0,6).map((b,i)=>{const col=b.conf>100?a2:a1;return<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 12px",fontSize:12,borderLeft:`2px solid ${col}`}}>
            <span><span style={{color:col,fontWeight:600}}>{b.c}</span> <span style={{color:dim}}>#{b.h.toLocaleString()} — {b.r}</span></span>
            <span style={{color:dim,fontSize:10}}>{b.t}</span>
          </div>;})}
        </div>
      </div>
    </G>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>RECENT PAYMENTS</div>
      <div style={{background:card,borderRadius:8,padding:"4px 0"}}>
        {PAYMENTS_RECENT.map((p,i)=><div key={i} style={{display:"grid",gridTemplateColumns:vp.mobile?"1fr 80px":"120px 1fr 120px 60px",gap:8,padding:"6px 12px",fontSize:13}}>
          <span style={{color:a3}}>{p.addr}</span>{!vp.mobile&&<span style={{color:dim,fontSize:10}}>{p.tx}</span>}<span style={{color:br}}>{p.amt}</span><span style={{color:dim,fontSize:10}}>{p.t}</span>
        </div>)}
      </div>
    </div>
  </>;
}

function PrvSecContent({D,vp,colors}){
  const{a1,a2,a3,a4,a5,dim,br,card}=colors;
  return<>
    <G vp={vp} cols={vp.mobile?2:5} gap={vp.gap}>
      <Metric label="Security score" value={D.secScore} color={a2} mini={<MiniBar value={98} max={100} color={a2}/>}/>
      <Metric label="Active alerts" value={D.secAlerts} color={a2}/>
      <Metric label="Banned IPs" value={D.bannedIPs} color={a5}/>
      <Metric label="Peak connections" value={D.connectionsPeak} color={a4}/>
      <Metric label="Events 7d" value={SEC_EVENTS.length} color={dim}/>
    </G>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>SECURITY LAYERS</div>
      <G vp={vp} cols={vp.mobile?1:3} gap={vp.gap}>
        {[{n:"L1",nm:"Mining cookies",d:"Per-connection HMAC secret. Prevents MitM share hijacking attacks (BiteCoin, WireGhost, StraTap).",c:a1},{n:"L2",nm:"Share fingerprinting",d:"Statistical BWH detection. Identifies miners who submit partial PoW but never full PoW. Analyzes share-to-block ratios over sliding windows.",c:a4},{n:"L3",nm:"Behavioral analysis",d:"Real-time anomaly detection on every share. Catches share flooding (>10/sec), ntime manipulation (>5min drift), vardiff gaming (>16x swings), Sybil patterns (>3 addr/IP), hashrate oscillation.",c:a5}].map(l=>
          <div key={l.n} style={{background:card,borderRadius:8,padding:vp.mobile?12:16,borderLeft:`3px solid ${l.c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:18,fontWeight:700,color:br}}>{l.n}: {l.nm}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:a2+"22",color:a2}}>Active</span>
            </div>
            <div style={{fontSize:13,color:dim,lineHeight:1.6}}>{l.d}</div>
          </div>
        )}
      </G>
    </div>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>THREAT MATRIX — COVERED VECTORS</div>
      <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap}>
        {[["L1","BiteCoin / WireGhost MitM hijacking",a1],["L2","Block withholding (BWH / FAW / ISM)",a4],["L3","Share flooding / DDoS",a5],["L3","Ntime manipulation / time-warp",a5],["L3","VarDiff gaming (slow-burst pattern)",a5],["L3","Sybil attack detection",a5],["L3","Hashrate oscillation / pool hopping",a5],["L2","Infiltrated selfish mining",a4]].map(([l,t,c],i)=>
          <div key={i} style={{background:card,borderRadius:6,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,padding:"2px 8px",borderRadius:8,background:c+"18",color:c,fontWeight:600,flexShrink:0}}>{l}</span>
            <span style={{fontSize:13,color:br}}>{t}</span>
          </div>
        )}
      </G>
    </div>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>SECURITY EVENT LOG</div>
      <div style={{background:card,borderRadius:8,overflow:"hidden"}}>
        {SEC_EVENTS.map((e,i)=>{const sc=e.sev==="critical"?"#f87171":e.sev==="medium"?a5:a1;return<div key={i} style={{display:"grid",gridTemplateColumns:vp.mobile?"1fr":"160px 120px 1fr 160px 80px",gap:8,padding:"8px 12px",fontSize:12,borderLeft:`2px solid ${sc}`,borderBottom:"1px solid #0f0f0f"}}>
          <span style={{color:sc,fontWeight:600}}>{e.type}</span>
          {!vp.mobile&&<span style={{color:dim}}>{e.ip}</span>}
          <span style={{color:br}}>{e.d}</span>
          {!vp.mobile&&<span style={{color:dim}}>{e.action}</span>}
          <span style={{color:dim}}>{e.t} ago</span>
        </div>;})}
      </div>
    </div>
    <div style={{fontSize:11,color:dim,marginTop:8}}>Security L2 + L3 apply to public miners only. Fleet miners bypass behavioral checks.</div>
  </>;
}

function PrvFleetContent({D,vp,colors}){
  const{a1,a2,a3,a5,dim,br,card}=colors;
  return<>
    <G vp={vp} cols={vp.mobile?2:6} gap={vp.gap}>
      <Metric label="Fleet miners" value="20" sub="of 100 capacity" color={a3} mini={<MiniBar value={20} max={100} color={a3}/>}/>
      <Metric label="Public miners" value="2" sub="2% fee" color={dim}/>
      <Metric label="Fleet hashrate" value={fH(D.fleetHR)} sub={D.fleetPct+" of pool"} color={a3}/>
      <Metric label="Fleet fee" value="0%" sub="Full block reward" color={a2}/>
      <Metric label="Fleet power" value={D.fleetPower} sub={D.fleetEfficiency} color={a5}/>
      <Metric label="Avg temp" value={Math.round(FLEET.reduce((a,m)=>a+m.temp,0)/FLEET.length)+"°C"} color={dim}/>
    </G>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>FLEET MINERS — CHRISTINA LAKE FACILITY</div>
      <div style={{background:card,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:vp.mobile?"80px 70px 60px 50px":"80px 90px 70px 60px 60px 70px 1fr 1fr",gap:8,padding:"8px 12px",fontSize:10,color:dim,borderBottom:"1px solid #1a1a1a"}}>
          <span>WORKER</span><span>HASHRATE</span><span>SHARES</span><span>REJ%</span>{!vp.mobile&&<Fragment><span>TEMP</span><span>POWER</span><span>CHIP</span><span>HEALTH</span></Fragment>}
        </div>
        <div style={{maxHeight:vp.mobile?300:500,overflowY:"auto"}}>
          {FLEET.map((m,i)=><div key={i} style={{display:"grid",gridTemplateColumns:vp.mobile?"80px 70px 60px 50px":"80px 90px 70px 60px 60px 70px 1fr 1fr",gap:8,padding:"5px 12px",fontSize:vp.mobile?12:14,fontFamily:"'JetBrains Mono',monospace",borderBottom:"1px solid #0d0d0d",alignItems:"center"}}>
            <span style={{color:a3}}>{m.w}</span>
            <span style={{color:br}}>{m.hr.toFixed(1)}</span>
            <span style={{color:dim}}>{m.sh}</span>
            <span style={{color:parseFloat(m.rej)>1?a5:a2}}>{m.rej}%</span>
            {!vp.mobile&&<>
              <span style={{color:m.temp>70?a5:dim}}>{m.temp}°C</span>
              <span style={{color:dim}}>{m.power}W</span>
              <span style={{color:dim}}>{m.chipFreq}MHz</span>
              <HeatBar value={m.temp} low={50} high={85}/>
            </>}
          </div>)}
        </div>
      </div>
    </div>

    <div style={{marginTop:vp.gap*2}}>
      <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>FLEET CONFIGURATION</div>
      <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap}>
        <div style={{background:card,borderRadius:8,padding:vp.mobile?12:16}}>
          <div style={{display:"grid",gridTemplateColumns:"120px 1fr",gap:"6px 12px",fontSize:13}}>
            {[["Whitelisted IPs","203.0.113.100 (facility)"],["Addresses","LhXk7...abc"],["Capacity","20 / 100"],["Fee","0%"],["Bypasses","IP limits, banning, sybil, anomaly"],["Runtime API","POST /api/v1/fleet/ip"],["","POST /api/v1/fleet/address"],["","PUT /api/v1/fleet/capacity"]].map(([l,v],i)=>
              <Fragment key={i}><span style={{color:dim}}>{l}</span><span style={{color:l?a3:dim}}>{v}</span></Fragment>
            )}
          </div>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center",background:card,borderRadius:8,padding:vp.mobile?12:16}}>
          <Donut segments={FLEET.map(m=>({value:m.hr,color:m.temp>70?a5:a3}))} size={vp.mobile?90:110} stroke={10} centerLabel="temps" centerValue={Math.round(FLEET.reduce((a,m)=>a+m.temp,0)/FLEET.length)+"°"}/>
          <div style={{fontSize:12,color:dim,lineHeight:1.8}}>
            <div>Normal (&lt;70°C): <span style={{color:a2}}>{FLEET.filter(m=>m.temp<=70).length} miners</span></div>
            <div>Warm (70-80°C): <span style={{color:a5}}>{FLEET.filter(m=>m.temp>70&&m.temp<=80).length} miners</span></div>
            <div>Hot (&gt;80°C): <span style={{color:"#f87171"}}>{FLEET.filter(m=>m.temp>80).length} miners</span></div>
          </div>
        </div>
      </G>
    </div>
  </>;
}

function PrvConnContent({D,vp,colors,cp,copied}){
  const{a1,a2,a3,a4,a5,dim,br,card}=colors;
  const CL=({label,value,accent})=><div onClick={()=>cp(value)} style={{padding:"10px 14px",background:card,borderRadius:6,cursor:"pointer",border:`1px solid ${copied===value?a2+"66":"#1a1a1a"}`,marginBottom:8}}>
    <div style={{fontSize:10,color:dim,letterSpacing:1.5,marginBottom:2}}>{label}</div>
    <div style={{fontSize:vp.mobile?14:17,fontFamily:"'JetBrains Mono',monospace",color:accent,wordBreak:"break-all"}}>{value}</div>
  </div>;
  return<>
    <G vp={vp} cols={vp.mobile?1:2} gap={vp.gap*2}>
      <div>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>CONNECTION DETAILS</div>
        <CL label="POOL STRATUM" value="stratum+tcp://luxxpool.io:3333" accent={a1}/>
        <CL label="SSL STRATUM" value="stratum+ssl://luxxpool.io:3334" accent={a2}/>
        <CL label="SOLO STRATUM" value="stratum+tcp://luxxpool.io:3336" accent={a5}/>
        <CL label="REST API" value="http://luxxpool.io:8080" accent={a4}/>
        <CL label="WORKER FORMAT" value="LTC_ADDRESS.workerName" accent={a5}/>
      </div>
      <div>
        <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>ENDPOINT STATUS</div>
        <G vp={vp} cols={2} gap={vp.gap}>
          <Metric label="Pool :3333" value={`${D.stratumConns} miners`} color={a2}/><Metric label="SSL :3334" value={`${D.sslConns} miners`} color={a2}/>
          <Metric label="Solo :3336" value={`${D.soloConns} miners`} color={a2}/><Metric label="API :8080" value="Online" color={a2}/>
        </G>
        <div style={{marginTop:vp.gap*2}}>
          <div style={{fontSize:11,color:dim,letterSpacing:1.5,marginBottom:8}}>NETWORK METRICS</div>
          <G vp={vp} cols={2} gap={vp.gap}>
            <Metric label="Bandwidth" value={D.bandwidth} color={dim}/><Metric label="Avg latency" value={D.latencyAvg} color={dim}/>
            <Metric label="API reqs 24h" value={D.apiRequests24h} color={dim}/><Metric label="Peak conns" value={D.connectionsPeak} color={dim}/>
          </G>
        </div>
      </div>
    </G>
  </>;
}

// ═══════════════════════════════════════════════════════════
// SKIN WRAPPERS — Apply design language around shared content
// ═══════════════════════════════════════════════════════════

const SKIN_COLORS={
  terminal:{a1:"#4a9eff",a2:"#34d399",a3:"#5DCAA5",a4:"#a78bfa",a5:"#fb923c",dim:"#2a4a2a",br:"#c0f0c0",card:"#0d120d",bg:"#0a0e0a"},
  luxury:{a1:"#4a9eff",a2:"#34d399",a3:"#5DCAA5",a4:"#a78bfa",a5:"#e8753c",dim:"#383838",br:"#e8e4df",card:"#111111",bg:"#0a0a0a"},
  zen:{a1:"#4a9eff",a2:"#34d399",a3:"#5DCAA5",a4:"#a78bfa",a5:"#d4622a",dim:"#2a2a2a",br:"#d4cfca",card:"#0f0f0f",bg:"#090909"},
};

const SKIN_FONTS={
  terminal:{display:"'JetBrains Mono',monospace",body:"'JetBrains Mono',monospace",heading:"'JetBrains Mono',monospace"},
  luxury:{display:"'Cormorant Garamond',Georgia,serif",body:"'Manrope',system-ui,sans-serif",heading:"'Cormorant Garamond',Georgia,serif"},
  zen:{display:"'Instrument Serif',Georgia,serif",body:"'Manrope',system-ui,sans-serif",heading:"'Instrument Serif',Georgia,serif"},
};

function SkinShell({skin,mode,children,vp,tabs,curTab,setTab,setMode,setSkin}){
  const colors=SKIN_COLORS[skin];const fonts=SKIN_FONTS[skin];
  const prv=mode==="private";
  const isT=skin==="terminal";const isL=skin==="luxury";const isZ=skin==="zen";
  const accent=prv?(isT?"#f87171":colors.a5):colors.a1;

  return<div style={{minHeight:"100vh",width:"100%",background:colors.bg,fontFamily:fonts.body,fontSize:vp.fontSize*16+"px",color:colors.dim}}>
    <header style={{padding:vp.mobile?"8px 12px":`12px ${vp.pad}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:vp.mobile?6:12,borderBottom:`1px solid ${isT?"#2a4a2a33":"#161616"}`,background:isT?"#111611":colors.bg,position:"sticky",top:0,zIndex:100,flexWrap:vp.mobile?"wrap":"nowrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:isT?12:0,flexShrink:0}}>
        {isT&&<div style={{display:"flex",gap:5}}><div style={{width:10,height:10,borderRadius:"50%",background:"#ff5f57"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#febc2e"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#28c840"}}/></div>}
        <div style={{fontSize:isT?(vp.mobile?12:14):isL?(vp.mobile?18:22):(vp.mobile?16:20),fontFamily:fonts.display,fontStyle:isZ?"italic":"normal",fontWeight:isL?500:400,color:isT?"#2a4a2a":colors.br,letterSpacing:isT?0:3}}>
          {isT?"luxxpool@aquatic ~ $":<>{isL?"LUXX":"luxx"}<span style={{color:colors.a5}}>{isL?"POOL":"pool"}</span></>}
        </div>
      </div>

      <div style={{display:"flex",gap:2,background:"#ffffff08",borderRadius:6,padding:2,flexShrink:0}}>
        {["terminal","luxury","zen"].map(s=><button key={s} onClick={()=>setSkin(s)} style={{padding:vp.mobile?"3px 8px":"5px 14px",border:"none",borderRadius:4,cursor:"pointer",fontSize:vp.mobile?10:12,fontFamily:"'Manrope',sans-serif",fontWeight:500,letterSpacing:1,background:skin===s?accent+"22":"transparent",color:skin===s?accent:"#444",transition:"all 0.2s"}}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
      </div>

      <div style={{display:"flex",gap:vp.mobile?4:8,flexWrap:"wrap",justifyContent:"center",flex:1}}>
        {tabs.map(t=><span key={t.id} onClick={()=>setTab(t.id)} style={{padding:vp.mobile?"3px 8px":"4px 12px",cursor:"pointer",fontSize:vp.mobile?10:13,fontFamily:fonts.body,color:curTab===t.id?(isT?accent:colors.br):colors.dim,background:curTab===t.id?(isT?accent+"11":"transparent"):"transparent",borderRadius:isT?3:0,borderBottom:!isT&&curTab===t.id?`1px solid ${colors.a5}`:"1px solid transparent",fontWeight:curTab===t.id?600:400,letterSpacing:isT?0:1.5,transition:"all 0.15s"}}>{t.l}</span>)}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:vp.mobile?6:12,flexShrink:0}}>
        <div onClick={()=>setMode(m=>m==="public"?"private":"public")} style={{cursor:"pointer",padding:vp.mobile?"3px 8px":"4px 12px",borderRadius:isT?3:16,border:`1px solid ${accent}44`,fontSize:vp.mobile?10:13,fontFamily:isT?fonts.body:"'Manrope',sans-serif",color:accent,letterSpacing:isT?0:2,transition:"all 0.3s"}}>
          {isT?`[${prv?"private":"public"}]`:(prv?"Private":"Public")}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#34d399"}}/>
          {isT&&<span style={{color:"#34d399",fontSize:vp.mobile?10:13,fontFamily:fonts.body}}>live</span>}
        </div>
      </div>
    </header>

    {isT&&!vp.mobile&&<div style={{padding:"5px "+vp.pad,borderBottom:"1px solid #2a4a2a22",display:"flex",gap:8,fontSize:12,fontFamily:fonts.body,flexWrap:"wrap"}}>
      {COINS.map(c=><span key={c.s} style={{color:c.on?"#34d399":"#2a4a2a66"}}>{c.on?"●":"○"} {c.s}</span>)}
    </div>}

    <main style={{padding:vp.pad,width:"100%"}}>{children}</main>

    <footer style={{padding:`12px ${vp.pad}`,borderTop:`1px solid ${isT?"#2a4a2a22":"#161616"}`,fontSize:vp.mobile?10:12,color:isT?"#2a4a2a":"#222",fontFamily:fonts.body,display:"flex",justifyContent:"space-between",letterSpacing:isT?0:1}}>
      <span>{isT?"luxxpool":"LUXXPOOL"} v3.1 — Christina Lake, BC</span>
      <span>{prv?`Operator · Fleet: 20 · Public: 2`:`Scrypt multi-coin · PPLNS`}</span>
    </footer>
  </div>;
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function App(){
  const[skin,setSkin]=useState("terminal");
  const[mode,setMode]=useState("public");
  const[pubV,setPubV]=useState("stats");
  const[prvV,setPrvV]=useState("cmd");
  const D=useData();
  const vp=useViewport();
  const[copied,cp]=useCopy();
  const prv=mode==="private";
  const colors=SKIN_COLORS[skin];

  const pubTabs=[{id:"stats",l:"Pool stats"},{id:"connect",l:"Connect"},{id:"guide",l:"Setup guide"},{id:"lookup",l:"Miner lookup"}];
  const prvTabs=[{id:"cmd",l:"Command"},{id:"sec",l:"Security"},{id:"fleet",l:"Fleet"},{id:"conn",l:"Connect"}];

  return<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600&family=Noto+Serif+JP:wght@300;400&display=swap');
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      *{margin:0;padding:0;box-sizing:border-box}
      html,body{width:100%;overflow-x:hidden}
      ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${colors.bg}}::-webkit-scrollbar-thumb{background:#222;border-radius:2px}
      input:focus{outline:none}
    `}</style>
    <SkinShell skin={skin} mode={mode} vp={vp} tabs={prv?prvTabs:pubTabs} curTab={prv?prvV:pubV} setTab={prv?setPrvV:setPubV} setMode={setMode} setSkin={setSkin}>
      {prv?<>
        {prvV==="cmd"&&<PrvCmdContent D={D} vp={vp} colors={colors}/>}
        {prvV==="sec"&&<PrvSecContent D={D} vp={vp} colors={colors}/>}
        {prvV==="fleet"&&<PrvFleetContent D={D} vp={vp} colors={colors}/>}
        {prvV==="conn"&&<PrvConnContent D={D} vp={vp} colors={colors} cp={cp} copied={copied}/>}
      </>:<>
        {pubV==="stats"&&<PubStatsContent D={D} vp={vp} colors={colors}/>}
        {pubV==="connect"&&<PubConnectContent D={D} vp={vp} colors={colors} cp={cp} copied={copied}/>}
        {pubV==="guide"&&<PubGuideContent vp={vp} colors={colors}/>}
        {pubV==="lookup"&&<PubLookupContent D={D} vp={vp} colors={colors}/>}
      </>}
    </SkinShell>
  </>;
}
