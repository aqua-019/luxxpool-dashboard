import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';


function Bar({ data, color = '#5b9bf0', w = 400, h = 60 }) {
  if (!data || !data.length) return null;
  const mx = Math.max(...data, 1);
  const bw = (w / data.length) * 0.7;
  const gap = (w / data.length) * 0.3;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {data.map((v, i) => {
        const bh = Math.max(1, (v / mx) * (h - 4));
        return <rect key={i} x={i * (bw + gap) + gap / 2} y={h - bh} width={bw} height={bh} rx="2" fill={color} opacity={0.4 + 0.6 * (v / mx)} />;
      })}
    </svg>
  );
}




function C05({ viewport, skin, earnings, history }) {
  
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
            <span style={{ fontSize: 9, fontWeight: 500, color: '#6ee7b7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#05</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Revenue composition</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7' }}>Public + Private</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 8, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>30d total</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{fmtUSD((earnings?.daily || 38) * 30, 0)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Daily avg</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: c.dim, fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(earnings?.daily || 38)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ flex: 58, background: 'linear-gradient(90deg, #2563c4, #5b9bf0)' }} />
          <div style={{ flex: 34, background: 'linear-gradient(90deg, #a68c1a, #fbbf24)' }} />
          <div style={{ flex: 3, background: '#818cf8' }} />
          <div style={{ flex: 5, background: 'rgba(255,255,255,0.08)' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 9, marginBottom: 10 }}>
          {[{l:'LTC 58%',c:c.a1},{l:'DOGE 34%',c:c.a5},{l:'BELLS 3%',c:c.a4},{l:'Other 5%',c:c.dim}].map((m,i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 8, height: 3, borderRadius: 1, background: m.c }} />
              <span style={{ color: c.dim }}>{m.l}</span>
            </span>
          ))}
        </div>
        <Bar data={history?.shares || []} color={c.a1 || '#5b9bf0'} w={800} h={mob ? 60 : 100} />
  
      </div>
    </div>
  );
}
export default memo(C05);