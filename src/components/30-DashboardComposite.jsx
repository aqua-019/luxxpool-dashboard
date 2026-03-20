import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';

function C30({ viewport, skin, ...data }) {
  
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
            <span style={{ fontSize: 9, fontWeight: 500, color: '#5b9bf0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#30</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Dashboard composite</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(110,231,183,0.08)', color: '#6ee7b7' }}>Public + Private</span>
        </div>

        <div style={{ fontSize: 11, color: c.dim, lineHeight: 1.7 }}>Full page layout reference showing all components</div>
        <div style={{ marginTop: 8, height: 2, borderRadius: 1, background: 'rgba(91,155,240,0.04)' }}>
          <div style={{ height: '100%', borderRadius: 1, width: '100%', background: '#5b9bf0', opacity: 0.15 }} />
        </div>
  
      </div>
    </div>
  );
}
export default memo(C30);