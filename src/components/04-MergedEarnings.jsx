import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';



function MiniBar({ value = 0, max = 100, color = '#5b9bf0', h = 3 }) {
  return (
    <svg width="100%" height={h} style={{ display: 'block' }}>
      <rect width="100%" height={h} rx={h/2} fill={color + '18'} />
      <rect width={`${Math.min(100, (value/max)*100)}%`} height={h} rx={h/2} fill={color} />
    </svg>
  );
}



function C04({ viewport, skin, earnings, network }) {
  
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 500, color: '#fbbf24', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#04</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Merged earnings</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7' }}>Public + Private</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[
            { sym: 'LTC', role: 'Parent chain', bal: (earnings?.ltcBalance||0).toFixed(4)+' LTC', usd: fmtUSD((earnings?.ltcBalance||0)*90), pend: (earnings?.ltcPending||0).toFixed(4), conf: (earnings?.ltcConfirmed||0).toFixed(4), pct: Math.min(100,((earnings?.ltcBalance||0)/0.5)*100), color: c.a1 || '#5b9bf0' },
            { sym: 'DOGE', role: 'Aux chain · slot 0', bal: fmtNum(Math.round(earnings?.dogeBalance||0))+' DOGE', usd: fmtUSD((earnings?.dogeBalance||0)*0.17), pend: '412.80', conf: '3,241.50', pct: Math.min(100,((earnings?.dogeBalance||0)/500)*100), color: c.a5 || '#fbbf24' },
          ].map((coin, i) => (
            <div key={i} style={{ background: 'rgba(91,155,240,0.03)', borderRadius: 8, padding: mob ? '10px 12px' : '12px 16px', border: '0.5px solid rgba(91,155,240,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: coin.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff' }}>{coin.sym[0]}</div>
                <div><div style={{ fontSize: 12, color: c.br, fontWeight: 500 }}>{coin.sym}</div><div style={{ fontSize: 9, color: c.dim }}>{coin.role}</div></div>
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: c.dim, marginBottom: 2 }}><span>Pending</span><span>{coin.pend}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: c.dim, marginBottom: 2 }}><span>Confirmed</span><span>{coin.conf}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, color: c.br, borderTop: '0.5px solid rgba(91,155,240,0.06)', paddingTop: 4, marginTop: 4 }}><span>Balance</span><span>{coin.bal}</span></div>
                <div style={{ fontSize: 10, color: c.dim, textAlign: 'right', marginTop: 1 }}>≈ {coin.usd}</div>
              </div>
              <MiniBar value={coin.pct} max={100} color={coin.color} h={3} />
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(91,155,240,0.02)', borderRadius: 6, padding: '8px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: c.br }}>Secondary merged coins</span>
            <span style={{ fontSize: 10, color: c.dim }}>8 chains · PPS+ ratio: <span style={{ color: c.a5 }}>{earnings?.ppsRatio || 1.437}</span></span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['BELLS','PEP','LKY','JKC','DINGO','SHIC','TRMP','CRC'].map((s, i) => (
              <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(91,155,240,0.04)', border: '0.5px solid rgba(91,155,240,0.06)', color: c.dim }}>{s}</span>
            ))}
          </div>
        </div>
  
      </div>
    </div>
  );
}
export default memo(C04);