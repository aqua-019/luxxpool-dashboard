import { memo, useMemo } from 'react';
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

function Badge({ value, positive }) {
  return (
    <span style={{
      fontSize: 8, padding: '2px 6px', borderRadius: 10, fontWeight: 500,
      background: positive ? 'rgba(110,231,183,0.12)' : 'rgba(248,113,113,0.12)',
      color: positive ? '#6ee7b7' : '#fca5a5',
      fontVariantNumeric: 'tabular-nums',
    }}>{positive ? '▲' : '▼'}{value}</span>
  );
}

function C01({ viewport, skin, hashrate, workers, shares, earnings, blocks, network, history, uptime, anomalies }) {
  
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
        {/* Primary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: mob ? 8 : 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...t.label, color: c.dim, fontSize: 9 }}>Hashrate</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0' }}>
                <span style={{ ...t.value, fontSize: mob ? 20 : 26, color: '#fff' }}>{fmtHash(hashrate?.effective || 0)}</span>
                <Badge value={fmtPct(Math.abs(hashrate?.gap || 0))} positive={(hashrate?.trendDirection || '') === 'up'} />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 8, color: c.dim }}>Rep: {fmtHash(hashrate?.reported || 0)}</span>
                <span style={{ fontSize: 8, color: c.dim }}>Score: {fmtHash(hashrate?.scoring || 0)}</span>
                <span style={{ fontSize: 8, color: c.dim }}>Peak: {fmtHash(hashrate?.range?.max || 0)}</span>
              </div>
            </div>
            {!mob && <Spark data={(history?.hr || []).slice(-20)} color={c.a1 || '#5b9bf0'} />}
          </div>
          <div>
            <div style={{ ...t.label, color: c.dim, fontSize: 9 }}>Fleet</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0' }}>
              <span style={{ ...t.value, fontSize: mob ? 20 : 26, color: '#fff' }}>{workers?.fleet?.online || 0}</span>
              <span style={{ fontSize: 10, color: c.dim }}>/{workers?.fleet?.count || 0} L9</span>
            </div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', margin: '3px 0' }}>
              {Array.from({ length: workers?.fleet?.count || 20 }, (_, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 1.5,
                  background: i < (workers?.fleet?.online || 18) ? (c.success || '#6ee7b7')
                    : i < (workers?.fleet?.online || 18) + (workers?.fleet?.offline || 1) ? (c.warning || '#fbbf24')
                    : (c.danger || '#f87171'),
                }} />
              ))}
            </div>
            <div style={{ fontSize: 8, color: c.dim }}>Uptime: 99.2% · {workers?.total || 22} miners total</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...t.label, color: c.dim, fontSize: 9 }}>Share pipeline</div>
              <div style={{ ...t.value, fontSize: mob ? 20 : 26, color: '#fff', margin: '2px 0' }}>{fmtNum(shares?.rate || 0)}<span style={{ fontSize: 10, color: c.dim }}>/min</span></div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 8, color: c.success }}>Accept: {fmtPct(shares?.acceptRate || 0)}</span>
                <span style={{ fontSize: 8, color: c.dim }}>Stale: {fmtPct(shares?.staleRate || 0)}</span>
                <span style={{ fontSize: 8, color: c.dim }}>VarD: {shares?.vardiffAvg || 0}×</span>
              </div>
            </div>
            {!mob && <Spark data={(history?.shares || []).slice(-14)} color={c.a4 || '#818cf8'} />}
          </div>
          <div>
            <div style={{ ...t.label, color: c.dim, fontSize: 9 }}>24h revenue</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0' }}>
              <span style={{ ...t.value, fontSize: mob ? 20 : 26, color: '#fff' }}>{fmtUSD(earnings?.daily || 0)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '3px 0' }}>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(91,155,240,0.08)', color: c.a1 }}>LTC {(earnings?.ltcBalance || 0).toFixed(3)}</span>
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(251,191,36,0.08)', color: c.a5 }}>DOGE {fmtNum(Math.round(earnings?.dogeBalance || 0))}</span>
            </div>
            <div style={{ fontSize: 8, color: c.dim }}>PPS+: {earnings?.ppsRatio || 0} · Lifetime: {fmtUSD(earnings?.lifetimePaid || 0, 0)}</div>
          </div>
        </div>
        {/* Secondary strip */}
        <div style={{ display: 'flex', gap: 1, marginTop: 10, background: 'rgba(91,155,240,0.02)', borderRadius: 5, overflow: 'hidden' }}>
          {[
            { l: 'Blocks 24h', v: String(blocks?.total || 0), s: (blocks?.ltc||0)+'L·'+(blocks?.aux||0)+'A' },
            { l: 'LTC luck', v: fmtPct(blocks?.luckLTC||0,0), s: 'Avg: '+fmtDuration(blocks?.avgBlockTime||0) },
            { l: 'Pool share', v: fmtPct(network?.ltcPoolShare||0,3), s: fmtHash(network?.ltcNetHashrate||0) },
            { l: 'LTC diff', v: ((network?.ltcDifficulty||0)/1e6).toFixed(1)+'M', s: 'Blk '+ fmtNum(network?.ltcHeight||0) },
            ...(!mob ? [
              { l: 'DOGE diff', v: ((network?.dogeDifficulty||0)/1e6).toFixed(1)+'M', s: 'Blk '+fmtNum(network?.dogeHeight||0) },
              { l: 'Fee', v: (network?.fee||2)+'%', s: 'Solo: '+(network?.soloFee||1)+'%' },
              { l: 'Uptime', v: fmtDuration(uptime||0), s: 'Last: '+fmtAgo(blocks?.lastBlockAge||0) },
            ] : []),
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, padding: mob ? '4px 4px' : '5px 8px', textAlign: 'center', borderLeft: i ? '0.5px solid rgba(91,155,240,0.04)' : 'none' }}>
              <div style={{ fontSize: 7, color: c.dim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.l}</div>
              <div style={{ fontSize: mob ? 11 : 13, fontWeight: 500, color: c.br, fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{m.v}</div>
              <div style={{ fontSize: 8, color: c.dim }}>{m.s}</div>
            </div>
          ))}
        </div>
  
      </div>
    </div>
  );
}
export default memo(C01);