import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';






function C06({ viewport, skin, hashrate, network, blocks }) {
  
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
            <span style={{ fontSize: 9, fontWeight: 500, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#06</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Pool gauge + network</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7' }}>Public + Private</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{fmtPct(network?.ltcPoolShare || 0, 3)}</div>
            <div style={{ fontSize: 9, color: c.dim }}>of LTC network</div>
            <div style={{ fontSize: 10, color: c.dim, marginTop: 2 }}>{fmtHash(hashrate?.effective||0)} of {fmtHash(network?.ltcNetHashrate||0)}</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: mob ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 6 }}>
            {[
              { l: 'LTC diff', v: ((network?.ltcDifficulty||0)/1e6).toFixed(1)+'M', c: c.a1 },
              { l: 'DOGE diff', v: ((network?.dogeDifficulty||0)/1e6).toFixed(1)+'M', c: c.a5 },
              { l: 'Luck', v: fmtPct(network?.luck||0,0), c: c.success },
              { l: 'Avg block', v: fmtDuration(blocks?.avgBlockTime||0), c: c.dim },
              { l: 'LTC price', v: fmtUSD(network?.ltcPrice||0), c: c.dim },
              { l: 'DOGE price', v: fmtUSD(network?.dogePrice||0, 3), c: c.dim },
              { l: 'Fee', v: (network?.fee||2)+'%', c: c.dim },
              { l: 'Next halving', v: '~Aug 2027', c: c.dim },
            ].map((m, i) => (
              <div key={i} style={{ background: 'rgba(91,155,240,0.03)', borderRadius: 5, padding: '5px 6px' }}>
                <div style={{ fontSize: 7, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.l}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: m.c, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
  
      </div>
    </div>
  );
}
export default memo(C06);