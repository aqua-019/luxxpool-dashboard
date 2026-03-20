import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';


function Spark({ data, color = '#5b9bf0', w = 200, h = 30, fill = true }) {
  if (!data || data.length < 3) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h-3-((v-mn)/rg)*(h-6)}`).join(' ');
  const id = 'sf' + color.replace('#','') + w;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {fill && <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
      </linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} /></>}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function C02({ viewport, skin, hashrate, history }) {
  
  const s = skin || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const cd = s.card || {};
  const f = s.fonts || {};
  const vp = viewport || {};
  const mob = vp.mobile;
  return (
    <div style={{
      background: cd.background || '#0c1845',
      border: cd.border || '0.5px solid rgba(91,155,240,0.1)',
      borderRadius: cd.borderRadius || '12px',
      padding: mob ? '10px 12px' : '14px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      {cd.stripe && cd.stripe !== 'none' && (
        <div style={{ position: 'absolute', inset: 0, background: cd.stripe, pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: c.br, letterSpacing: '-0.03em' }}>Hashrate</div>
            <div style={{ fontSize: 10, color: c.dim, marginTop: 1 }}>Christina Lake · 20× L9</div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {['1h','6h','24h','7d','30d'].map(r => (
              <span key={r} style={{ padding: mob ? '2px 6px' : '3px 10px', borderRadius: 5, fontSize: mob ? 9 : 10, cursor: 'pointer', background: r === '24h' ? 'rgba(91,155,240,0.12)' : 'transparent', color: r === '24h' ? (c.a1 || '#5b9bf0') : c.dim }}>{r}</span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 8, marginBottom: 10 }}>
          {[
            { l: 'Effective', v: fmtHash(hashrate?.effective || 0), c: c.a1 },
            { l: 'Reported', v: fmtHash(hashrate?.reported || 0), c: c.dim },
            { l: 'Scoring EMA', v: fmtHash(hashrate?.scoring || 0), c: c.a4 },
            ...(!mob ? [
              { l: '24h avg', v: fmtHash(hashrate?.avg24h || 0), c: c.a5 },
              { l: '24h range', v: fmtHash(hashrate?.range?.min||0).split(' ')[0] + '–' + fmtHash(hashrate?.range?.max||0).split(' ')[0], c: c.dim },
              { l: 'Std dev', v: '±' + fmtHash(hashrate?.stdDev || 0), c: c.dim },
            ] : []),
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: 8, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.l}</div>
              <div style={{ fontSize: mob ? 14 : 18, fontWeight: 500, color: m.c, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 12, height: 2, borderRadius: 1, background: c.a1 }} /><span style={{ color: c.dim }}>Effective</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 12, height: 1.5, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} /><span style={{ color: c.dim }}>Reported</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 12, height: 2, borderRadius: 1, background: c.a4 }} /><span style={{ color: c.dim }}>Scoring</span></span>
        </div>
        <Spark data={history || []} color={c.a1 || '#5b9bf0'} w={800} h={mob ? 80 : 140} />
  
      </div>
    </div>
  );
}
export default memo(C02);