import { memo } from 'react';
import { fmtAgo, fmtTemp, fmtPower } from '../utils/format';
import { TOKENS, getStateToken } from '../tokens';

function statusToState(status) {
  if (status === 'online') return 'mining';
  if (status === 'offline') return 'alert';
  if (status === 'dead') return 'orphaned';
  return 'idle';
}

function WorkerRow({ name, hashrate, difficulty, status, lastShare, temp, power, mobile }) {
  const state = statusToState(status);
  const st = getStateToken(state);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mobile
        ? '1fr 70px 50px'
        : '1fr 80px 70px 60px 60px 70px',
      gap: 8,
      alignItems: 'center',
      padding: '6px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      fontFamily: TOKENS.fonts.mono,
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: st.fg,
          flexShrink: 0,
        }} />
        <span style={{
          color: TOKENS.text.primary,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{name || '—'}</span>
        <span style={{
          fontSize: 10,
          color: st.fg,
          textTransform: 'uppercase',
        }}>{status}</span>
      </div>
      <span style={{
        color: hashrate > 0 ? TOKENS.text.primary : TOKENS.text.dim,
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {hashrate > 0 ? (hashrate / 1e9).toFixed(1) + ' GH/s' : '—'}
      </span>
      <span style={{
        color: TOKENS.text.secondary,
        fontVariantNumeric: 'tabular-nums',
      }}>{difficulty || '—'}</span>
      {!mobile && (
        <>
          <span style={{
            color: temp > 70 ? TOKENS.brand.warning : TOKENS.text.dim,
          }}>{temp ? fmtTemp(temp) : '—'}</span>
          <span style={{ color: TOKENS.text.dim }}>{power ? fmtPower(power) : '—'}</span>
          <span style={{
            color: TOKENS.text.dim,
            fontSize: 11,
          }}>{lastShare ? fmtAgo(lastShare) : '—'}</span>
        </>
      )}
    </div>
  );
}

export default memo(WorkerRow);
