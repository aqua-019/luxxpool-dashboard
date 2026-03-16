import { useState, useEffect, useRef, useCallback } from "react";

/*
 * LUXXPOOL Dashboard v3.0
 * Three skins: Terminal · Luxury · Zen
 * Design switcher + Public/Private toggle
 * Rich charts, metrics, live data
 */

// ═══════════════════════════════════════════════════════════
// DATA ENGINE — shared across all skins
// ═══════════════════════════════════════════════════════════

const COINS=[{s:"LTC",h:215,on:1,role:"parent"},{s:"DOGE",h:45,on:1},{s:"BELLS",h:25,on:1},{s:"LKY",h:140,on:1},{s:"PEP",h:150,on:1},{s:"DINGO",h:30,on:1},{s:"SHIC",h:35,on:1},{s:"JKC",h:200,on:0},{s:"TRMP",h:0,on:0},{s:"CRC",h:280,on:0}];
const AUX={DOGE:142,BELLS:38,LKY:21,PEP:17,DINGO:9,SHIC:55};
const fH=h=>h>=1e12?(h/1e12).toFixed(2)+" TH/s":h>=1e9?(h/1e9).toFixed(1)+" GH/s":h>=1e6?(h/1e6).toFixed(1)+" MH/s":Math.round(h)+" H/s";
const FLEET=Array.from({length:20},(_,i)=>({w:`L9_${String(i+1).padStart(2,"0")}`,hr:15.5+Math.random()*2,sh:Math.floor(800+Math.random()*500),rej:(Math.random()*1.5).toFixed(2),up:Math.floor(12+Math.random()*36),temp:Math.floor(62+Math.random()*12)}));

function useData(){
  const [t,setT]=useState(0);
  const [hrHist]=useState(()=>Array.from({length:48},(_,i)=>290+Math.sin(i*.15)*40+Math.cos(i*.06)*20+Math.random()*10));
  const [shareHist]=useState(()=>Array.from({length:24},()=>Math.floor(800+Math.random()*600)));
  const [minerHist]=useState(()=>Array.from({length:24},()=>Math.floor(18+Math.random()*8)));
  useEffect(()=>{const i=setInterval(()=>setT(k=>{
    hrHist.push(290+Math.sin((k+48)*.15)*40+Math.cos((k+48)*.06)*20+Math.random()*10);
    hrHist.shift();
    shareHist.push(Math.floor(800+Math.random()*600));shareHist.shift();
    minerHist.push(Math.floor(18+Math.random()*8));minerHist.shift();
    return k+1;
  }),3000);return()=>clearInterval(i)},[]);
  const hr=325e9+Math.sin(t*.08)*20e9+Math.cos(t*.03)*10e9;
  return{hr,hrHist,shareHist,minerHist,t,
    miners:22,workers:26,diff:28462819,height:2847261+Math.floor(t/10),
    fee:"2%",soloFee:"1%",rejectRate:"0.8%",avgShareTime:"14.7s",
    blocksLTC:8,blocksAux:39,blocksTotal:47,
    ltcEarned:"2.847",dogeEarned:"14,200",
    uptime:"14d 7h 23m",lastBlock:"15s ago",
    fleetHR:312.5e9,pubHR:14.9e9,fleetPct:"95.4%",
    payoutsPending:"0.0234 LTC",payoutsTotal:"18.42 LTC",
    secAlerts:0,secStatus:"clear",
    netHashrate:"847.3 TH/s",poolShare:"0.038%",
    estDaily:"0.0089 LTC",estMonthly:"0.267 LTC",
  };
}

// ═══════════════════════════════════════════════════════════
// CHART COMPONENTS — SVG, no dependencies
// ═══════════════════════════════════════════════════════════

function Spark({data=[],w=400,h=50,color="#4a9eff",fill=true}){
  if(data.length<2)return null;
  const mx=Math.max(...data),mn=Math.min(...data),rg=mx-mn||1;
  const pts=data.map((v,i)=>`${i*(w/(data.length-1))},${h-4-((v-mn)/rg)*(h-8)}`).join(" ");
  return<svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
    {fill&&<><defs><linearGradient id={`sf${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sf${color.replace('#','')})`}/></>}
    <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>;
}

function BarChart({data=[],w=400,h=100,color="#4a9eff",labels=[]}){
  if(!data.length)return null;
  const mx=Math.max(...data,1);
  const bw=w/data.length*.7;const gap=w/data.length*.3;
  return<svg width="100%" viewBox={`0 0 ${w} ${h+20}`} style={{display:"block"}}>
    {data.map((v,i)=>{
      const bh=(v/mx)*(h-10);const x=i*(bw+gap)+gap/2;
      return<g key={i}>
        <rect x={x} y={h-bh} width={bw} height={bh} rx="2" fill={color} opacity={0.7+0.3*(v/mx)}/>
        {labels[i]&&<text x={x+bw/2} y={h+14} textAnchor="middle" fill="#555" fontSize="10" fontFamily="inherit">{labels[i]}</text>}
      </g>;
    })}
  </svg>;
}

function Donut({segments=[],size=120,stroke=14,centerLabel="",centerValue=""}){
  const total=segments.reduce((a,s)=>a+s.value,0)||1;
  const r=(size-stroke)/2;const circ=2*Math.PI*r;
  let offset=0;
  return<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{display:"block"}}>
    {segments.map((s,i)=>{
      const len=(s.value/total)*circ;const dash=`${len} ${circ-len}`;
      const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>;
      offset+=len;return el;
    })}
    <text x={size/2} y={size/2-6} textAnchor="middle" fill="#888" fontSize="11" fontFamily="inherit">{centerLabel}</text>
    <text x={size/2} y={size/2+12} textAnchor="middle" fill="#e0e0e0" fontSize="20" fontWeight="700" fontFamily="inherit">{centerValue}</text>
  </svg>;
}

function MiniBar({value=0,max=100,color="#4a9eff",w=80,h=6}){
  return<svg width={w} height={h}><rect width={w} height={h} rx={h/2} fill={color+"22"}/><rect width={w*(value/max)} height={h} rx={h/2} fill={color}/></svg>;
}

// ═══════════════════════════════════════════════════════════
// COPY TO CLIPBOARD
// ═══════════════════════════════════════════════════════════

function useCopy(){
  const[c,setC]=useState(false);
  const go=useCallback(v=>{navigator.clipboard.writeText(v).catch(()=>{});setC(true);setTimeout(()=>setC(false),1500);},[]);
  return[c,go];
}

// ═══════════════════════════════════════════════════════════
// SKIN: TERMINAL
// ═══════════════════════════════════════════════════════════

const TF="'JetBrains Mono',monospace";
const TC={bg:"#0a0e0a",card:"#0d120d",g:"#4a9eff",a:"#34d399",w:"#fb923c",p:"#a78bfa",r:"#f87171",t:"#5DCAA5",d:"#2a4a2a",tx:"#6aaa6a",br:"#c0f0c0"};

function TermPub({D}){
  const[c,cp]=useCopy();const[addr,setA]=useState("");const[res,setR]=useState(null);
  const[v,setV]=useState("stats");
  const doLookup=()=>{if(!addr.trim())return;setR({hr:fH(16.25e9+Math.random()*2e9),wk:Math.ceil(Math.random()*3),sh:Math.floor(5e3+Math.random()*2e4).toLocaleString(),pend:(Math.random()*.05).toFixed(6),paid:(Math.random()*2.5).toFixed(4),last:Math.floor(Math.random()*120)+"s"});};
  return<div style={{fontFamily:TF,color:TC.tx}}>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{["stats","connect","setup","lookup"].map(t=><span key={t} onClick={()=>setV(t)} style={{padding:"3px 10px",cursor:"pointer",fontSize:14,color:v===t?TC.a:TC.d,background:v===t?TC.a+"11":"transparent",borderRadius:3,fontWeight:v===t?700:400}}>{t}</span>)}</div>

    {v==="stats"&&<>
      <pre style={{color:TC.g,fontSize:12,lineHeight:1.2,marginBottom:16,opacity:.6}}>{` ██╗     ██╗   ██╗██╗  ██╗██╗  ██╗\n ██║     ██║   ██║╚██╗██╔╝╚██╗██╔╝\n ██║     ██║   ██║ ╚███╔╝  ╚███╔╝\n ███████╗╚██████╔╝██╔╝ ██╗██╔╝ ██╗\n ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`}</pre>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --status</span></div>
      <div style={{paddingLeft:20,fontSize:16,lineHeight:1.9,marginBottom:12}}>
        {[["Pool hashrate",fH(D.hr),TC.g],["Active miners",`${D.miners} (${D.workers} workers)`,TC.a],["Network difficulty",D.diff.toLocaleString()],["Reject rate",D.rejectRate,TC.a],["Avg share time",D.avgShareTime],["Pool share of network",D.poolShare,TC.p],["Est. daily (per L9)",D.estDaily,TC.w],["Uptime",D.uptime,TC.a]].map(([l,val,c],i)=>
          <div key={i}><span style={{color:TC.d}}># </span>{l}: <span style={{color:c||TC.a,fontWeight:700}}>{val}</span></div>
        )}
      </div>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --hashrate-graph</span></div>
      <div style={{padding:"8px 0 16px",paddingLeft:20}}><Spark data={D.hrHist} w={600} h={60} color={TC.g}/></div>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --shares-24h</span></div>
      <div style={{padding:"8px 0 16px",paddingLeft:20}}><BarChart data={D.shareHist} w={600} h={70} color={TC.a} labels={D.shareHist.map((_,i)=>i%6===0?`${i}h`:"")}/></div>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --aux-blocks</span></div>
      <div style={{paddingLeft:20,fontSize:16,lineHeight:1.9,marginBottom:12}}>{Object.entries(AUX).map(([k,v])=><div key={k}><span style={{color:TC.d}}># </span><span style={{display:"inline-block",width:60}}>{k}</span><span style={{color:TC.t,fontWeight:700}}>{v} blocks</span> <MiniBar value={v} max={150} color={TC.t} w={100} h={5}/></div>)}</div>
    </>}

    {v==="connect"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --connect</span></div>
      {[["STRATUM","stratum+tcp://luxxpool.io:3333",TC.g],["SSL","stratum+ssl://luxxpool.io:3334",TC.a],["WORKER","YOUR_LTC_ADDRESS.workerName",TC.w],["PASSWORD","x",TC.d],["SOLO (1%)","stratum+tcp://luxxpool.io:3336",TC.w]].map(([l,val,col])=>
        <div key={l} style={{marginBottom:8,paddingLeft:20}}>
          <div style={{fontSize:12,color:TC.d}}>#{" "+l}</div>
          <div onClick={()=>cp(val)} style={{fontSize:16,color:col,cursor:"pointer",padding:"6px 10px",background:"#060a06",border:`1px solid ${TC.d}33`,borderRadius:3,display:"flex",justifyContent:"space-between"}}>
            <span>{val}</span><span style={{fontSize:11,color:TC.d}}>[click]</span>
          </div>
        </div>
      )}
    </>}

    {v==="setup"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>man luxxpool</span></div>
      {[{h:"WALLET",b:"Litecoin Core, Tangem, Trust Wallet, Exodus.\nWARNING: Never use an exchange deposit address."},{h:"HARDWARE",b:"Scrypt ASIC required.\n  Antminer L9 .. 16-17 GH/s 3,260W\n  Antminer L7 ..  9.5  GH/s 3,425W\n  ElphaPex DG2 . 17    GH/s 3,420W"},{h:"CONFIGURE",b:"Pool 1: stratum+tcp://luxxpool.io:3333\nWorker: LTC_ADDRESS.L9_01\nPassword: x → Save & Apply"},{h:"PAYOUTS",b:"PPLNS | Min: 0.01 LTC | Interval: 10 min\nMaturity: 100 confs | Reward: 6.25 LTC/block"}].map(s=>
        <div key={s.h} style={{paddingLeft:20,marginBottom:16}}><div style={{color:TC.g,fontSize:17,fontWeight:700}}>{s.h}</div><pre style={{color:TC.tx,fontSize:15,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{s.b}</pre></div>
      )}
    </>}

    {v==="lookup"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.a}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool --lookup</span></div>
      <div style={{display:"flex",gap:8,paddingLeft:20,marginBottom:12}}>
        <span style={{color:TC.a,fontSize:17}}>addr: </span>
        <input value={addr} onChange={e=>setA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLookup()} placeholder="L... / ltc1..." style={{flex:1,background:"transparent",border:"none",borderBottom:`1px solid ${TC.d}`,color:TC.br,fontFamily:TF,fontSize:17,outline:"none"}}/>
        <span onClick={doLookup} style={{color:TC.a,cursor:"pointer",fontSize:16}}>[enter]</span>
      </div>
      {res&&<div style={{paddingLeft:20,fontSize:16,lineHeight:1.9}}>
        {[["Hashrate",res.hr,TC.g],["Workers",res.wk,TC.a],["Shares/24h",res.sh],["Pending",res.pend+" LTC",TC.p],["Total paid",res.paid+" LTC",TC.a],["Last share",res.last+" ago"]].map(([l,v,c])=>
          <div key={l}><span style={{color:TC.d}}># </span>{l}: <span style={{color:c||TC.a,fontWeight:700}}>{v}</span></div>)}
      </div>}
    </>}
    <div style={{color:TC.a,fontSize:18,marginTop:12}}>$ <span style={{animation:"blink 1s infinite"}}>█</span></div>
  </div>;
}

function TermPrv({D}){
  const[v,setV]=useState("cmd");
  return<div style={{fontFamily:TF,color:TC.tx}}>
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>{["cmd","security","fleet","conn"].map(t=><span key={t} onClick={()=>setV(t)} style={{padding:"3px 10px",cursor:"pointer",fontSize:14,color:v===t?TC.r:TC.d,background:v===t?TC.r+"11":"transparent",borderRadius:3,fontWeight:v===t?700:400}}>{t}</span>)}</div>

    {v==="cmd"&&<>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool-admin --command</span></div>
      <div style={{paddingLeft:20,fontSize:16,lineHeight:1.9,marginBottom:12}}>
        {[["Pool hashrate",fH(D.hr),TC.g],["Fleet hashrate","312.5 GH/s (20 LUXX · 0%)",TC.t],["Public hashrate","14.9 GH/s (2 miners · 2%)",TC.tx],["Blocks found","47 (LTC: 8 · Aux: 39)",TC.a],["Security","CLEAR",TC.a],["Pool share",D.poolShare,TC.p],["Payout pending",D.payoutsPending],["Payout total",D.payoutsTotal,TC.a]].map(([l,val,c],i)=>
          <div key={i}><span style={{color:TC.d}}># </span>{l}: <span style={{color:c||TC.a,fontWeight:700}}>{val}</span></div>)}
      </div>
      <div style={{fontSize:18,marginBottom:4}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool-admin --hashrate-graph</span></div>
      <div style={{padding:"8px 0 16px",paddingLeft:20}}><Spark data={D.hrHist} w={600} h={60} color={TC.r}/></div>
      <div style={{display:"flex",gap:24,paddingLeft:20,marginBottom:12,alignItems:"center"}}>
        <Donut segments={[{value:312.5,color:TC.t},{value:14.9,color:TC.d}]} size={100} stroke={12} centerLabel="fleet" centerValue="95.4%"/>
        <div style={{fontSize:15,lineHeight:1.8}}>
          <div><span style={{color:TC.t}}>■</span> Fleet: 312.5 GH/s (20 miners)</div>
          <div><span style={{color:TC.d}}>■</span> Public: 14.9 GH/s (2 miners)</div>
        </div>
      </div>
    </>}

    {v==="security"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool-admin --security</span></div>
      {[{n:"L1",nm:"Mining cookies",d:"MitM defense",c:TC.g},{n:"L2",nm:"Share fingerprinting",d:"BWH detection",c:TC.p},{n:"L3",nm:"Behavioral analysis",d:"Floods / ntime / vardiff / sybil",c:TC.w}].map(l=>
        <div key={l.n} style={{paddingLeft:20,borderLeft:`2px solid ${l.c}`,marginBottom:12,paddingTop:4,paddingBottom:4}}>
          <span style={{color:l.c,fontWeight:700}}>[{l.n}]</span> <span style={{color:TC.br,fontWeight:600}}>{l.nm}</span> <span style={{color:TC.a}}>ACTIVE</span><br/>
          <span style={{color:TC.d,paddingLeft:40}}>{l.d}</span>
        </div>
      )}
      <div style={{fontSize:18,marginBottom:4,marginTop:16}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>--threat-matrix</span></div>
      <div style={{paddingLeft:20,fontSize:15,lineHeight:1.8}}>{["BiteCoin/WireGhost MitM","Block withholding (BWH/FAW)","Share flooding / DDoS","Ntime manipulation","VarDiff gaming","Sybil detection","Hashrate oscillation","Selfish mining"].map((t,i)=>
        <div key={i}><span style={{color:TC.a}}>✓</span> {t}</div>)}
      </div>
    </>}

    {v==="fleet"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool-admin --fleet</span></div>
      <div style={{paddingLeft:20,fontSize:16,lineHeight:1.9,marginBottom:12}}>
        {[["Fleet miners","20 / 100",TC.t],["Fleet hashrate","312.5 GH/s (95.4%)",TC.t],["Fleet fee","0%",TC.a],["Avg reject rate","0.8%",TC.a]].map(([l,val,c])=>
          <div key={l}><span style={{color:TC.d}}># </span>{l}: <span style={{color:c,fontWeight:700}}>{val}</span></div>)}
      </div>
      <div style={{paddingLeft:20,fontSize:13,color:TC.d,display:"grid",gridTemplateColumns:"80px 90px 70px 60px 60px",gap:8,marginBottom:4}}>
        <span>WORKER</span><span>HASHRATE</span><span>SHARES</span><span>REJ%</span><span>TEMP</span>
      </div>
      <div style={{paddingLeft:20,maxHeight:280,overflowY:"auto"}}>
        {FLEET.map((m,i)=><div key={i} style={{fontSize:15,display:"grid",gridTemplateColumns:"80px 90px 70px 60px 60px",gap:8,lineHeight:1.9}}>
          <span style={{color:TC.t}}>{m.w}</span><span style={{color:TC.br}}>{m.hr.toFixed(1)}</span><span style={{color:TC.d}}>{m.sh}</span><span style={{color:parseFloat(m.rej)>1?TC.w:TC.a}}>{m.rej}%</span><span style={{color:m.temp>70?TC.w:TC.tx}}>{m.temp}°C</span>
        </div>)}
      </div>
    </>}

    {v==="conn"&&<>
      <div style={{fontSize:18,marginBottom:8}}><span style={{color:TC.r}}>$ </span><span style={{color:TC.br,fontWeight:700}}>luxxpool-admin --endpoints</span></div>
      {[["Pool","stratum+tcp://luxxpool.io:3333","22 miners",TC.g],["SSL","stratum+ssl://luxxpool.io:3334","0",TC.a],["Solo","stratum+tcp://luxxpool.io:3336","0",TC.w],["API","http://luxxpool.io:8080","online",TC.p]].map(([l,v,s,c])=>
        <div key={l} style={{paddingLeft:20,fontSize:16,lineHeight:1.9}}><span style={{color:TC.d}}># </span><span style={{color:c,fontWeight:700}}>{l}</span>: {v} <span style={{color:TC.d}}>[{s}]</span></div>
      )}
    </>}
    <div style={{color:TC.r,fontSize:18,marginTop:12}}>$ <span style={{animation:"blink 1s infinite"}}>█</span></div>
  </div>;
}

// ═══════════════════════════════════════════════════════════
// SKIN: LUXURY
// ═══════════════════════════════════════════════════════════

const LF="'Cormorant Garamond',Georgia,serif";
const LB="'Manrope',system-ui,sans-serif";
const LC={bg:"#0a0a0a",o:"#e8753c",br:"#e8e4df",tx:"#666",d:"#383838"};

function LuxPub({D}){
  const[v,setV]=useState("stats");const[addr,setA]=useState("");const[res,setR]=useState(null);const[,cp]=useCopy();
  const doLookup=()=>{if(!addr.trim())return;setR({hr:fH(16.25e9+Math.random()*2e9),wk:Math.ceil(Math.random()*3),sh:Math.floor(5e3+Math.random()*2e4).toLocaleString(),pend:(Math.random()*.05).toFixed(6),paid:(Math.random()*2.5).toFixed(4)});};
  const Dv=()=><div style={{width:60,height:2,background:LC.o,margin:"24px 0"}}/>;
  const Sm=({l,val,a})=><div><div style={{fontSize:12,fontFamily:LB,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:32,fontWeight:400,fontFamily:LF,color:a||LC.br,lineHeight:1.1}}>{val}</div></div>;
  return<div style={{fontFamily:LB,color:LC.tx}}>
    <div style={{display:"flex",gap:24,marginBottom:24}}>{["stats","connect","guide","lookup"].map(t=><span key={t} onClick={()=>setV(t)} style={{fontSize:14,cursor:"pointer",color:v===t?LC.br:LC.d,letterSpacing:1.5,textTransform:"uppercase",borderBottom:v===t?`1px solid ${LC.o}`:"1px solid transparent",paddingBottom:2}}>{t}</span>)}</div>

    {v==="stats"&&<div style={{paddingTop:20}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Pool status</div>
      <div style={{fontSize:80,fontFamily:LF,fontWeight:300,color:LC.br,lineHeight:1,letterSpacing:-2}}>{fH(D.hr).split(" ")[0]}<span style={{fontSize:36,color:LC.tx}}> {fH(D.hr).split(" ")[1]}</span></div>
      <div style={{fontSize:18,color:LC.tx,marginBottom:4}}>Combined hashrate — Scrypt (N=1024)</div>
      <Dv/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:32,marginBottom:36}}>
        <Sm l="Miners" val={D.miners} a="#34d399"/><Sm l="Difficulty" val={(D.diff/1e6).toFixed(1)+"M"}/><Sm l="Coins" val="7" a="#a78bfa"/><Sm l="Fee" val="2%" a={LC.o}/><Sm l="Pool share" val={D.poolShare} a="#4a9eff"/>
      </div>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:12,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Hashrate — 48h</div>
        <Spark data={D.hrHist} w={700} h={70} color={LC.o}/>
      </div>
      <div style={{display:"flex",gap:32,marginBottom:32,alignItems:"center"}}>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Shares submitted — 24h</div>
          <BarChart data={D.shareHist} w={450} h={80} color="#4a9eff" labels={D.shareHist.map((_,i)=>i%6===0?`${i}h`:"")}/>
        </div>
        <Donut segments={[{value:142,color:"#fb923c"},{value:55,color:"#a78bfa"},{value:38,color:"#34d399"},{value:47,color:"#4a9eff"}]} size={130} stroke={14} centerLabel="aux blocks" centerValue="282"/>
      </div>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:16}}>Merged mining</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {Object.entries(AUX).map(([k,val])=><div key={k} style={{borderLeft:`2px solid ${LC.o}33`,paddingLeft:16}}>
          <div style={{fontSize:14,color:LC.tx,letterSpacing:1}}>{k}</div>
          <div style={{fontSize:40,fontFamily:LF,fontWeight:300,color:LC.br}}>{val}</div>
          <MiniBar value={val} max={150} color={LC.o} w={100} h={4}/>
        </div>)}
      </div>
    </div>}

    {v==="connect"&&<div style={{paddingTop:20,maxWidth:520}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Connect</div>
      <div style={{fontSize:52,fontFamily:LF,fontWeight:300,color:LC.br,lineHeight:1.2}}>Point your miner.<br/><span style={{color:LC.o}}>Start earning.</span></div>
      <Dv/>
      {[["Pool stratum","stratum+tcp://luxxpool.io:3333","#4a9eff"],["SSL stratum","stratum+ssl://luxxpool.io:3334","#34d399"],["Worker","YOUR_LTC_ADDRESS.workerName",LC.o],["Password","x",LC.d],["Solo (1%)","stratum+tcp://luxxpool.io:3336",LC.o]].map(([l,val,col])=>
        <div key={l} style={{marginBottom:16}}>
          <div style={{fontSize:12,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{l}</div>
          <div onClick={()=>cp(val)} style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",color:col,cursor:"pointer",padding:"12px 16px",background:"#111",borderRadius:4,border:"1px solid #1a1a1a"}}>{val}</div>
        </div>
      )}
    </div>}

    {v==="guide"&&<div style={{paddingTop:20,maxWidth:560}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Setup guide</div>
      <div style={{fontSize:52,fontFamily:LF,fontWeight:300,color:LC.br,lineHeight:1.2}}>How to mine<br/><span style={{color:LC.o}}>Litecoin.</span></div>
      <Dv/>
      {[{t:"Get a wallet",b:"Litecoin Core, Tangem, Trust Wallet, or Exodus. Never an exchange address."},{t:"Hardware",b:"Scrypt ASIC: Antminer L9 (16-17 GH/s), L7 (9.5 GH/s), ElphaPex DG2 (17 GH/s). 240V, ethernet, ventilation."},{t:"Configure",b:"Pool 1: stratum+tcp://luxxpool.io:3333 · Worker: LTC_ADDRESS.L9_01 · Password: x · Save & Apply."},{t:"Payouts",b:"PPLNS. Min 0.01 LTC. Every 10 min. 100 confirmations."}].map(s=>
        <div key={s.t} style={{marginBottom:28}}><div style={{fontSize:28,fontFamily:LF,fontWeight:400,color:LC.br,marginBottom:6}}>{s.t}</div><div style={{fontSize:17,color:LC.tx,lineHeight:1.7}}>{s.b}</div></div>
      )}
    </div>}

    {v==="lookup"&&<div style={{paddingTop:20}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Miner lookup</div>
      <div style={{display:"flex",gap:12,maxWidth:520,marginBottom:24}}>
        <input value={addr} onChange={e=>setA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLookup()} placeholder="Litecoin address" style={{flex:1,padding:"14px 16px",background:"#111",border:"1px solid #1a1a1a",color:LC.br,fontFamily:"'JetBrains Mono',monospace",fontSize:17,borderRadius:4,outline:"none"}}/>
        <button onClick={doLookup} style={{padding:"14px 24px",background:"transparent",border:`1px solid ${LC.o}44`,color:LC.o,fontFamily:LB,fontSize:15,borderRadius:4,cursor:"pointer"}}>Look up</button>
      </div>
      {res&&<><Dv/><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40}}><Sm l="Hashrate" val={res.hr} a="#4a9eff"/><Sm l="Workers" val={res.wk} a="#34d399"/><Sm l="Shares" val={res.sh}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40,marginTop:24}}><Sm l="Pending" val={res.pend} a="#a78bfa"/><Sm l="Paid" val={res.paid} a="#34d399"/></div></>}
    </div>}
  </div>;
}

function LuxPrv({D}){
  const[v,setV]=useState("cmd");
  const Dv=()=><div style={{width:60,height:2,background:LC.o,margin:"24px 0"}}/>;
  const Sm=({l,val,a})=><div><div style={{fontSize:12,fontFamily:LB,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:28,fontWeight:400,fontFamily:LF,color:a||LC.br,lineHeight:1.1}}>{val}</div></div>;
  return<div style={{fontFamily:LB,color:LC.tx}}>
    <div style={{display:"flex",gap:24,marginBottom:24}}>{["cmd","security","fleet","conn"].map(t=><span key={t} onClick={()=>setV(t)} style={{fontSize:14,cursor:"pointer",color:v===t?LC.br:LC.d,letterSpacing:1.5,textTransform:"uppercase",borderBottom:v===t?`1px solid ${LC.o}`:"1px solid transparent",paddingBottom:2}}>{t}</span>)}</div>

    {v==="cmd"&&<div style={{paddingTop:20}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Command</div>
      <div style={{fontSize:68,fontFamily:LF,fontWeight:300,color:LC.br,lineHeight:1}}>{fH(D.hr).split(" ")[0]}<span style={{fontSize:32,color:LC.tx}}> {fH(D.hr).split(" ")[1]}</span></div>
      <Dv/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:32,marginBottom:32}}>
        <Sm l="Fleet" val="312.5 GH/s" a="#5DCAA5"/><Sm l="Public" val="14.9 GH/s"/><Sm l="Blocks" val="47" a="#34d399"/><Sm l="Security" val="Clear" a="#34d399"/><Sm l="Payouts" val={D.payoutsTotal} a="#4a9eff"/>
      </div>
      <div style={{display:"flex",gap:32,alignItems:"center",marginBottom:24}}>
        <div style={{flex:1}}><div style={{fontSize:12,color:LC.tx,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Hashrate — 48h</div><Spark data={D.hrHist} w={500} h={60} color="#f87171"/></div>
        <Donut segments={[{value:312.5,color:"#5DCAA5"},{value:14.9,color:"#383838"}]} size={110} stroke={12} centerLabel="fleet" centerValue="95.4%"/>
      </div>
    </div>}

    {v==="security"&&<div style={{paddingTop:20}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Security</div>
      <div style={{fontSize:48,fontFamily:LF,fontWeight:300,color:LC.br,lineHeight:1.2}}>Three layers.<br/><span style={{color:LC.o}}>Always watching.</span></div>
      <Dv/>
      {[{nm:"Mining cookies",d:"Per-connection HMAC — MitM defense",c:"#4a9eff"},{nm:"Share fingerprinting",d:"Statistical BWH detection",c:"#a78bfa"},{nm:"Behavioral analysis",d:"Floods, ntime, vardiff, sybil",c:"#fb923c"}].map(l=>
        <div key={l.nm} style={{borderLeft:`2px solid ${l.c}`,paddingLeft:20,marginBottom:24}}>
          <div style={{fontSize:24,fontFamily:LF,color:LC.br}}>{l.nm}</div>
          <div style={{fontSize:15,color:LC.tx,marginTop:4}}>{l.d}</div>
          <div style={{fontSize:11,color:"#34d399",letterSpacing:2,marginTop:4}}>ACTIVE</div>
        </div>
      )}
    </div>}

    {v==="fleet"&&<div style={{paddingTop:20}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Fleet</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,marginBottom:24}}>
        <Sm l="Fleet" val="20" a="#5DCAA5"/><Sm l="Public" val="2"/><Sm l="Hash" val="312.5 GH/s" a="#5DCAA5"/><Sm l="Fee" val="0%" a="#34d399"/>
      </div>
      <Dv/>
      <div style={{display:"grid",gridTemplateColumns:"100px 100px 80px 60px 60px",gap:12,fontSize:12,color:LC.d,letterSpacing:1,marginBottom:6}}>
        <span>WORKER</span><span>HASHRATE</span><span>SHARES</span><span>REJ%</span><span>TEMP</span>
      </div>
      <div style={{maxHeight:320,overflowY:"auto"}}>
        {FLEET.map((m,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"100px 100px 80px 60px 60px",gap:12,fontSize:17,fontFamily:"'JetBrains Mono',monospace",lineHeight:2}}>
          <span style={{color:"#5DCAA5"}}>{m.w}</span><span style={{color:LC.br}}>{m.hr.toFixed(1)}</span><span style={{color:LC.d}}>{m.sh}</span><span style={{color:parseFloat(m.rej)>1?"#fb923c":"#34d399"}}>{m.rej}%</span><span style={{color:m.temp>70?"#fb923c":LC.tx}}>{m.temp}°</span>
        </div>)}
      </div>
    </div>}

    {v==="conn"&&<div style={{paddingTop:20,maxWidth:520}}>
      <div style={{fontSize:13,color:LC.o,letterSpacing:4,textTransform:"uppercase",marginBottom:12}}>Endpoints</div>
      {[["Pool","stratum+tcp://luxxpool.io:3333","22 miners","#4a9eff"],["SSL","stratum+ssl://luxxpool.io:3334","0","#34d399"],["Solo","stratum+tcp://luxxpool.io:3336","0",LC.o],["API","http://luxxpool.io:8080","online","#a78bfa"]].map(([l,val,s,c])=>
        <div key={l} style={{borderLeft:`2px solid ${c}33`,paddingLeft:16,marginBottom:18}}>
          <div style={{fontSize:14,color:LC.tx,letterSpacing:1}}>{l}</div>
          <div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",color:c}}>{val}</div>
          <div style={{fontSize:12,color:LC.d}}>{s}</div>
        </div>
      )}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// SKIN: ZEN
// ═══════════════════════════════════════════════════════════

const ZF="'Instrument Serif',Georgia,serif";
const ZB="'Manrope',system-ui,sans-serif";
const ZC={bg:"#090909",o:"#d4622a",br:"#d4cfca",tx:"#555",d:"#2a2a2a"};

function ZenPub({D}){
  const[v,setV]=useState("stats");const[addr,setA]=useState("");const[res,setR]=useState(null);const[,cp]=useCopy();
  const doLookup=()=>{if(!addr.trim())return;setR({hr:fH(16.25e9+Math.random()*2e9),wk:Math.ceil(Math.random()*3),sh:Math.floor(5e3+Math.random()*2e4).toLocaleString(),pend:(Math.random()*.05).toFixed(6),paid:(Math.random()*2.5).toFixed(4)});};
  const Vl=()=><div style={{width:2,height:40,background:ZC.o,margin:"28px 0"}}/>;
  const Sm=({l,val,a})=><div><div style={{fontSize:11,fontFamily:ZB,color:ZC.tx,letterSpacing:2,marginBottom:4}}>{l}</div><div style={{fontSize:28,fontFamily:ZF,fontStyle:"italic",color:a||ZC.br,lineHeight:1.1}}>{val}</div></div>;
  return<div style={{fontFamily:ZB,color:ZC.tx}}>
    <div style={{display:"flex",gap:32,marginBottom:24}}>{["stats","connect","guide","lookup"].map(t=><span key={t} onClick={()=>setV(t)} style={{fontSize:13,cursor:"pointer",color:v===t?ZC.br:"#333",letterSpacing:2}}>{t}</span>)}</div>

    {v==="stats"&&<div style={{paddingTop:40}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>採掘 · MINING · PROOF OF WORK</div>
      <div style={{fontSize:88,fontFamily:ZF,fontStyle:"italic",color:ZC.br,lineHeight:1}}>{fH(D.hr).split(" ")[0]}</div>
      <div style={{fontSize:24,fontFamily:ZF,fontStyle:"italic",color:ZC.tx}}>{fH(D.hr).split(" ")[1]} — pool hashrate</div>
      <Vl/>
      <div style={{fontSize:17,color:ZC.tx,lineHeight:1.8,maxWidth:480,marginBottom:36}}>Twenty machines hashing in unison. Scrypt proof of work. Litecoin and nine auxiliary chains, mined simultaneously.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:40,marginBottom:40}}>
        <Sm l="MINERS" val={D.miners} a="#34d399"/><Sm l="DIFFICULTY" val={(D.diff/1e6).toFixed(1)+"M"}/><Sm l="COINS" val="7" a="#a78bfa"/><Sm l="FEE" val="2%" a={ZC.o}/><Sm l="EST. DAILY" val={D.estDaily} a="#4a9eff"/>
      </div>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:12,letterSpacing:2,marginBottom:8}}>HASHRATE — 48H</div>
        <Spark data={D.hrHist} w={700} h={70} color={ZC.o}/>
      </div>
      <div style={{display:"flex",gap:32,marginBottom:32,alignItems:"center"}}>
        <div style={{flex:1}}><div style={{fontSize:12,letterSpacing:2,marginBottom:8}}>SHARES — 24H</div><BarChart data={D.shareHist} w={450} h={70} color="#4a9eff" labels={D.shareHist.map((_,i)=>i%6===0?`${i}h`:"")}/></div>
        <Donut segments={Object.entries(AUX).map(([k,val])=>({value:val,color:`hsl(${COINS.find(c=>c.s===k)?.h||0},60%,55%)`}))} size={120} stroke={12} centerLabel="aux" centerValue={Object.values(AUX).reduce((a,b)=>a+b,0)}/>
      </div>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>合併 · MERGED MINING</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {Object.entries(AUX).map(([k,val])=><div key={k} style={{paddingLeft:14,borderLeft:`2px solid ${ZC.o}22`}}>
          <div style={{fontSize:13,letterSpacing:1}}>{k}</div>
          <div style={{fontSize:36,fontFamily:ZF,fontStyle:"italic",color:ZC.br}}>{val}</div>
          <MiniBar value={val} max={150} color={ZC.o} w={100} h={4}/>
        </div>)}
      </div>
    </div>}

    {v==="connect"&&<div style={{paddingTop:40,maxWidth:520}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>接続 · CONNECT</div>
      <div style={{fontSize:48,fontFamily:ZF,fontStyle:"italic",color:ZC.br,lineHeight:1.15}}>Point your miner.<br/>Begin the <span style={{color:ZC.o}}>work.</span></div>
      <Vl/>
      {[["POOL STRATUM","stratum+tcp://luxxpool.io:3333","#4a9eff"],["SSL","stratum+ssl://luxxpool.io:3334","#34d399"],["WORKER","YOUR_LTC_ADDRESS.workerName",ZC.o],["PASSWORD","x","#333"],["SOLO (1%)","stratum+tcp://luxxpool.io:3336",ZC.o]].map(([l,val,c])=>
        <div key={l} style={{marginBottom:14}}>
          <div style={{fontSize:11,letterSpacing:2,marginBottom:4}}>{l}</div>
          <div onClick={()=>cp(val)} style={{fontSize:17,fontFamily:"'JetBrains Mono',monospace",color:c,cursor:"pointer",padding:"10px 14px",background:"#0f0f0f",borderLeft:`2px solid ${c}22`,borderRadius:2}}>{val}</div>
        </div>
      )}
    </div>}

    {v==="guide"&&<div style={{paddingTop:40,maxWidth:560}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>案内 · GUIDE</div>
      <div style={{fontSize:48,fontFamily:ZF,fontStyle:"italic",color:ZC.br,lineHeight:1.15}}>The path to<br/><span style={{color:ZC.o}}>mining.</span></div>
      <Vl/>
      {[{t:"Wallet",b:"Litecoin Core, Tangem, Trust Wallet, Exodus. Never an exchange address."},{t:"Hardware",b:"Scrypt ASIC: Antminer L9 (16-17 GH/s), L7 (9.5 GH/s), ElphaPex DG2 (17 GH/s). 240V, ethernet, ventilation."},{t:"Configure",b:"Pool 1: stratum+tcp://luxxpool.io:3333 · Worker: LTC_ADDRESS.L9_01 · Password: x · Save & Apply."},{t:"Payouts",b:"PPLNS. Min 0.01 LTC. Every 10 min. 100 confs."}].map(s=>
        <div key={s.t} style={{paddingLeft:16,borderLeft:`2px solid ${ZC.o}22`,marginBottom:28}}>
          <div style={{fontSize:28,fontFamily:ZF,fontStyle:"italic",color:ZC.br,marginBottom:6}}>{s.t}</div>
          <div style={{fontSize:16,lineHeight:1.8}}>{s.b}</div>
        </div>
      )}
    </div>}

    {v==="lookup"&&<div style={{paddingTop:40}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>検索 · LOOKUP</div>
      <div style={{display:"flex",gap:12,maxWidth:520,marginBottom:24}}>
        <input value={addr} onChange={e=>setA(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLookup()} placeholder="Litecoin address" style={{flex:1,padding:"14px 16px",background:"#0f0f0f",border:"none",borderBottom:`1px solid ${ZC.d}`,color:ZC.br,fontFamily:"'JetBrains Mono',monospace",fontSize:17,outline:"none"}}/>
        <button onClick={doLookup} style={{padding:"14px 20px",background:"transparent",border:"none",borderBottom:`1px solid ${ZC.o}`,color:ZC.o,fontFamily:ZB,fontSize:15,cursor:"pointer",letterSpacing:2}}>FIND</button>
      </div>
      {res&&<><Vl/><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40}}><Sm l="HASHRATE" val={res.hr} a="#4a9eff"/><Sm l="WORKERS" val={res.wk} a="#34d399"/><Sm l="SHARES" val={res.sh}/></div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:40,marginTop:24}}><Sm l="PENDING" val={res.pend} a="#a78bfa"/><Sm l="PAID" val={res.paid} a="#34d399"/></div></>}
    </div>}
  </div>;
}

function ZenPrv({D}){
  const[v,setV]=useState("cmd");
  const Vl=()=><div style={{width:2,height:40,background:ZC.o,margin:"28px 0"}}/>;
  const Sm=({l,val,a})=><div><div style={{fontSize:11,fontFamily:ZB,color:ZC.tx,letterSpacing:2,marginBottom:4}}>{l}</div><div style={{fontSize:26,fontFamily:ZF,fontStyle:"italic",color:a||ZC.br,lineHeight:1.1}}>{val}</div></div>;
  return<div style={{fontFamily:ZB,color:ZC.tx}}>
    <div style={{display:"flex",gap:32,marginBottom:24}}>{["cmd","security","fleet","conn"].map(t=><span key={t} onClick={()=>setV(t)} style={{fontSize:13,cursor:"pointer",color:v===t?ZC.br:"#333",letterSpacing:2}}>{t}</span>)}</div>

    {v==="cmd"&&<div style={{paddingTop:40}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>指揮 · COMMAND</div>
      <div style={{fontSize:72,fontFamily:ZF,fontStyle:"italic",color:ZC.br,lineHeight:1}}>{fH(D.hr).split(" ")[0]}</div>
      <div style={{fontSize:20,color:ZC.tx}}>Total hashrate — 22 miners</div>
      <Vl/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:36,marginBottom:32}}>
        <Sm l="FLEET" val="312.5 GH/s" a="#5DCAA5"/><Sm l="PUBLIC" val="14.9 GH/s"/><Sm l="BLOCKS" val="47" a="#34d399"/><Sm l="SECURITY" val="Clear" a="#34d399"/><Sm l="PAYOUTS" val={D.payoutsTotal} a="#4a9eff"/>
      </div>
      <div style={{display:"flex",gap:32,alignItems:"center",marginBottom:24}}>
        <div style={{flex:1}}><div style={{fontSize:12,letterSpacing:2,marginBottom:8}}>HASHRATE — 48H</div><Spark data={D.hrHist} w={500} h={60} color="#f87171"/></div>
        <Donut segments={[{value:312.5,color:"#5DCAA5"},{value:14.9,color:"#2a2a2a"}]} size={110} stroke={12} centerLabel="fleet" centerValue="95.4%"/>
      </div>
    </div>}

    {v==="security"&&<div style={{paddingTop:40}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>防衛 · SECURITY</div>
      <div style={{fontSize:48,fontFamily:ZF,fontStyle:"italic",color:ZC.br,lineHeight:1.15}}>Three layers<br/>of <span style={{color:ZC.o}}>vigilance.</span></div>
      <Vl/>
      {[{nm:"Mining cookies",d:"Per-connection HMAC — MitM defense",c:"#4a9eff"},{nm:"Share fingerprinting",d:"Statistical BWH detection",c:"#a78bfa"},{nm:"Behavioral analysis",d:"Floods, ntime, vardiff, sybil",c:"#fb923c"}].map(l=>
        <div key={l.nm} style={{paddingLeft:16,borderLeft:`2px solid ${l.c}`,marginBottom:28}}>
          <div style={{fontSize:26,fontFamily:ZF,fontStyle:"italic",color:ZC.br}}>{l.nm}</div>
          <div style={{fontSize:15,marginTop:4}}>{l.d}</div>
          <div style={{fontSize:11,color:"#34d399",letterSpacing:2,marginTop:4}}>ACTIVE</div>
        </div>
      )}
    </div>}

    {v==="fleet"&&<div style={{paddingTop:40}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>艦隊 · FLEET</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:40,marginBottom:24}}>
        <Sm l="FLEET" val="20" a="#5DCAA5"/><Sm l="PUBLIC" val="2"/><Sm l="HASHRATE" val="312.5 GH/s" a="#5DCAA5"/><Sm l="FEE" val="0%" a="#34d399"/>
      </div>
      <Vl/>
      <div style={{display:"grid",gridTemplateColumns:"80px 100px 80px 60px 60px",gap:12,fontSize:11,letterSpacing:2,marginBottom:6}}>
        <span>WORKER</span><span>HASHRATE</span><span>SHARES</span><span>REJ%</span><span>TEMP</span>
      </div>
      <div style={{maxHeight:340,overflowY:"auto"}}>
        {FLEET.map((m,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"80px 100px 80px 60px 60px",gap:12,fontSize:16,fontFamily:"'JetBrains Mono',monospace",lineHeight:2.2,borderBottom:"1px solid #111"}}>
          <span style={{color:"#5DCAA5"}}>{m.w}</span><span style={{color:ZC.br}}>{m.hr.toFixed(1)}</span><span style={{color:ZC.d}}>{m.sh}</span><span style={{color:parseFloat(m.rej)>1?"#fb923c":"#34d399"}}>{m.rej}%</span><span style={{color:m.temp>70?"#fb923c":ZC.tx}}>{m.temp}°</span>
        </div>)}
      </div>
    </div>}

    {v==="conn"&&<div style={{paddingTop:40,maxWidth:520}}>
      <div style={{fontSize:14,letterSpacing:6,marginBottom:20}}>端点 · ENDPOINTS</div>
      {[["Pool","stratum+tcp://luxxpool.io:3333","22 miners","#4a9eff"],["SSL","stratum+ssl://luxxpool.io:3334","0","#34d399"],["Solo","stratum+tcp://luxxpool.io:3336","0",ZC.o],["API","http://luxxpool.io:8080","online","#a78bfa"]].map(([l,val,s,c])=>
        <div key={l} style={{paddingLeft:14,borderLeft:`2px solid ${c}22`,marginBottom:20}}>
          <div style={{fontSize:13,letterSpacing:1}}>{l}</div>
          <div style={{fontSize:18,fontFamily:"'JetBrains Mono',monospace",color:c}}>{val}</div>
          <div style={{fontSize:12,color:ZC.d}}>{s}</div>
        </div>
      )}
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// MAIN APP — DESIGN SWITCHER + MODE TOGGLE
// ═══════════════════════════════════════════════════════════

const SKINS = [
  { id: "terminal", label: "Terminal", bg: "#0a0e0a", accent: "#34d399", accentAlt: "#f87171" },
  { id: "luxury", label: "Luxury", bg: "#0a0a0a", accent: "#e8753c", accentAlt: "#e8753c" },
  { id: "zen", label: "Zen", bg: "#090909", accent: "#d4622a", accentAlt: "#d4622a" },
];

export default function App() {
  const [skin, setSkin] = useState("terminal");
  const [mode, setMode] = useState("public");
  const D = useData();
  const prv = mode === "private";
  const sk = SKINS.find(s => s.id === skin);

  const skinFont = skin === "terminal" ? "'JetBrains Mono',monospace"
    : skin === "luxury" ? "'Cormorant Garamond',Georgia,serif"
    : "'Instrument Serif',Georgia,serif";

  return (
    <div style={{ minHeight: "100vh", background: sk.bg, fontFamily: "system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600&family=Noto+Serif+JP:wght@300;400&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${sk.bg}}::-webkit-scrollbar-thumb{background:#222;border-radius:2px}
        input:focus{outline:none}
      `}</style>

      {/* UNIFIED HEADER */}
      <header style={{ padding: skin === "terminal" ? "10px 16px" : "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${skin === "terminal" ? "#2a4a2a33" : "#161616"}`, background: skin === "terminal" ? "#111611" : sk.bg, position: "sticky", top: 0, zIndex: 100 }}>

        {/* LEFT: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: skin === "terminal" ? 12 : 0 }}>
          {skin === "terminal" && <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>}
          <div style={{
            fontSize: skin === "terminal" ? 14 : skin === "luxury" ? 22 : 20,
            fontFamily: skin === "terminal" ? TF : skinFont,
            fontStyle: skin === "zen" ? "italic" : "normal",
            fontWeight: skin === "luxury" ? 500 : 400,
            color: skin === "terminal" ? "#2a4a2a" : "#e0dcd7",
            letterSpacing: skin === "terminal" ? 0 : 3,
          }}>
            {skin === "terminal" ? "luxxpool@aquatic ~ $" : <>
              {skin === "luxury" ? "LUXX" : "luxx"}<span style={{ color: sk.accent }}>{skin === "luxury" ? "POOL" : "pool"}</span>
            </>}
          </div>
        </div>

        {/* CENTER: Design switcher */}
        <div style={{ display: "flex", gap: 2, background: "#ffffff08", borderRadius: 6, padding: 2 }}>
          {SKINS.map(s => <button key={s.id} onClick={() => setSkin(s.id)} style={{
            padding: "5px 14px", border: "none", borderRadius: 4, cursor: "pointer",
            fontSize: 12, fontFamily: "'Manrope',sans-serif", fontWeight: 500, letterSpacing: 1,
            background: skin === s.id ? (prv ? s.accentAlt : s.accent) + "22" : "transparent",
            color: skin === s.id ? (prv ? s.accentAlt : s.accent) : "#444",
            transition: "all 0.2s",
          }}>{s.label}</button>)}
        </div>

        {/* RIGHT: Mode toggle + live */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div onClick={() => setMode(m => m === "public" ? "private" : "public")} style={{
            cursor: "pointer", padding: "4px 12px", borderRadius: skin === "terminal" ? 3 : 16,
            border: `1px solid ${prv ? (sk.accentAlt || sk.accent) + "44" : sk.accent + "44"}`,
            fontSize: skin === "terminal" ? 14 : 13,
            fontFamily: skin === "terminal" ? TF : "'Manrope',sans-serif",
            color: prv ? (sk.accentAlt || sk.accent) : sk.accent,
            letterSpacing: skin === "terminal" ? 0 : 2,
            transition: "all 0.3s",
          }}>
            {skin === "terminal" ? `[${prv ? "private" : "public"}]` : (prv ? "Private" : "Public")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
            {skin === "terminal" && <span style={{ color: "#34d399", fontSize: 13, fontFamily: TF }}>live</span>}
          </div>
        </div>
      </header>

      {/* COIN BAR (terminal only) */}
      {skin === "terminal" && <div style={{ padding: "6px 16px", borderBottom: "1px solid #2a4a2a22", display: "flex", gap: 8, fontSize: 13, fontFamily: TF, flexWrap: "wrap" }}>
        {COINS.map(c => <span key={c.s} style={{ color: c.on ? "#34d399" : "#2a4a2a66" }}>{c.on ? "●" : "○"} {c.s}</span>)}
      </div>}

      {/* BODY */}
      <main style={{ padding: skin === "terminal" ? "20px 24px" : "0 40px 60px", maxWidth: 960, margin: "0 auto" }}>
        {skin === "terminal" && (prv ? <TermPrv D={D} /> : <TermPub D={D} />)}
        {skin === "luxury" && (prv ? <LuxPrv D={D} /> : <LuxPub D={D} />)}
        {skin === "zen" && (prv ? <ZenPrv D={D} /> : <ZenPub D={D} />)}
      </main>

      {/* FOOTER */}
      <footer style={{ padding: skin === "terminal" ? "8px 16px" : "16px 40px", borderTop: `1px solid ${skin === "terminal" ? "#2a4a2a22" : "#161616"}`, fontSize: skin === "terminal" ? 12 : 11, color: skin === "terminal" ? "#2a4a2a" : "#222", fontFamily: skin === "terminal" ? TF : "'Manrope',sans-serif", display: "flex", justifyContent: "space-between", letterSpacing: skin === "terminal" ? 0 : 1 }}>
        <span>{skin === "terminal" ? "luxxpool v3.0" : "LUXXPOOL v3.0"} — Christina Lake, BC</span>
        <span>{prv ? `Operator · Fleet: 20 · Public: 2` : `Scrypt multi-coin · PPLNS`}</span>
      </footer>
    </div>
  );
}
