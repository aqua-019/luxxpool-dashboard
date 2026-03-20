import { memo } from 'react';
import { fmtHash, fmtNum, fmtPct, fmtUSD, fmtDuration, fmtAgo, fmtGH, fmtCompact, fmtCrypto, fmtTemp, fmtPower } from '../utils/format';






function C03({ viewport, skin, fleet, anomalies }) {
  
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
            <span style={{ fontSize: 9, fontWeight: 500, color: '#93bbf0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>#03</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: c.br || '#e0e8f0', letterSpacing: '-0.03em' }}>Fleet matrix</span>
          </div>
          <span style={{ fontSize: 7, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(91,155,240,0.08)', color: '#93bbf0' }}>Private only</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 6, marginBottom: 10 }}>
          {[
            { l: 'Online', v: String(fleet?.online || 18), c: c.success },
            { l: 'Offline', v: String(fleet?.offline || 1), c: c.warning },
            { l: 'Dead', v: String(fleet?.dead || 1), c: c.danger },
            ...(!mob ? [
              { l: 'Fleet HR', v: fmtHash(fleet?.hashrate || 0), c: c.a3 },
              { l: 'Power', v: fmtPower(fleet?.power || 0), c: '#fb923c' },
              { l: 'Avg temp', v: fmtTemp(fleet?.avgTemp || 0), c: c.a5 },
            ] : []),
          ].map((m, i) => (
            <div key={i} style={{ background: 'rgba(91,155,240,0.03)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 7, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.l}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: m.c, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{ borderRadius: 8, border: '0.5px solid rgba(91,155,240,0.06)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '70px 60px 50px 40px' : '80px 80px 60px 50px 50px 60px 60px 1fr', gap: 6, padding: '6px 10px', fontSize: 8, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(91,155,240,0.03)' }}>
            <span>Worker</span><span>GH/s</span><span>Shares</span><span>Rej%</span>
            {!mob && <><span>Temp</span><span>Power</span><span>Chip</span><span>Health</span></>}
          </div>
          <div style={{ maxHeight: mob ? 200 : 380, overflowY: 'auto' }}>
            {(fleet?.miners || []).map((m, i) => {
              const sc = m.status === 'online' ? (c.success || '#6ee7b7') : m.status === 'offline' ? (c.warning || '#fbbf24') : (c.danger || '#f87171');
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: mob ? '70px 60px 50px 40px' : '80px 80px 60px 50px 50px 60px 60px 1fr', gap: 6, padding: '4px 10px', fontSize: 12, fontFamily: f.mono, borderBottom: '0.5px solid rgba(91,155,240,0.03)', alignItems: 'center' }}>
                  <span style={{ color: sc, fontSize: 11 }}>{m.id || m.worker}</span>
                  <span style={{ color: m.hashrate > 0 ? (c.br || '#fff') : c.dim, fontWeight: 500 }}>{m.hashrate > 0 ? m.hashrate.toFixed(1) : '—'}</span>
                  <span style={{ color: c.dim }}>{m.shares || '—'}</span>
                  <span style={{ color: parseFloat(m.rejectRate) > 1 ? c.warning : c.dim }}>{m.rejectRate || '—'}%</span>
                  {!mob && <>
                    <span style={{ color: m.temp > 70 ? c.warning : c.dim }}>{m.temp ? fmtTemp(m.temp) : '—'}</span>
                    <span style={{ color: c.dim }}>{m.power || '—'}W</span>
                    <span style={{ color: c.dim }}>{m.chipFreq || '—'}MHz</span>
                    <svg width="100%" height="4" style={{ display: 'block' }}>
                      <rect width="100%" height="4" rx="2" fill="rgba(255,255,255,0.03)" />
                      <rect width={`${Math.min(100, Math.max(0, ((m.temp || 60) - 50) / 35 * 100))}%`} height="4" rx="2" fill={m.temp > 70 ? (c.danger || '#f87171') : m.temp > 60 ? (c.warning || '#fbbf24') : (c.success || '#6ee7b7')} />
                    </svg>
                  </>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontSize: 9, color: c.dim, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Fleet: {fmtHash(fleet?.hashrate || 0)} eff · {fmtPower(fleet?.power || 0)}</span>
          <span>IP whitelist: 1 CIDR · Sybil bypass: active · Fee: 0%</span>
        </div>
  
      </div>
    </div>
  );
}
export default memo(C03);