import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';

function C32({ viewport, skin, network }) {
  
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
            <span style={{ fontSize: 9, fontWeight: 500, color: '#5b9bf0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#32</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Stratum config</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7' }}>Public + Private</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 6 }}>
          {Object.entries(network || {}).slice(0, 8).map(([k, v]) => (
            <div key={k} style={{ background: 'rgba(91,155,240,0.03)', borderRadius: 5, padding: '5px 8px' }}>
              <div style={{ fontSize: 7, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: c.br, fontVariantNumeric: 'tabular-nums', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {typeof v === 'object' ? (Array.isArray(v) ? '['+v.length+']' : '{…}') : String(v).slice(0,20)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: c.dim, marginTop: 8 }}>Pool/SSL/solo stratum URLs with copy-to-clipboard</div>
  
      </div>
    </div>
  );
}
export default memo(C32);