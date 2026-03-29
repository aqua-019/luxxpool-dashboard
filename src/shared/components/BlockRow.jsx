import { memo } from 'react';
import { fmtAgo, fmtNum } from '../utils/format';
import { TOKENS, getStateToken } from '../tokens';

function BlockRow({ coin, height, reward, age, worker, confirmations, confirmed, style }) {
  const state = confirmed === false ? 'orphaned' : confirmations === 0 ? 'found' : 'mining';
  const st = getStateToken(state);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      borderRadius: TOKENS.radius.md,
      background: state === 'found' ? st.glow : 'transparent',
      borderBottom: `1px solid rgba(255,255,255,0.03)`,
      fontFamily: TOKENS.fonts.mono,
      fontSize: 12,
      transition: 'background 0.3s ease',
      ...style,
    }}>
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: st.fg,
        flexShrink: 0,
      }} />
      <span style={{
        fontWeight: 600,
        color: st.fg,
        minWidth: 48,
      }}>{coin || 'LTC'}</span>
      <span style={{
        color: TOKENS.text.primary,
        fontWeight: 500,
        minWidth: 80,
      }}>{fmtNum(height)}</span>
      <span style={{
        color: TOKENS.brand.gold,
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{reward}</span>
      {worker && (
        <span style={{
          color: TOKENS.text.dim,
          fontSize: 11,
        }}>{worker}</span>
      )}
      <span style={{
        color: TOKENS.text.secondary,
        fontSize: 11,
        minWidth: 55,
        textAlign: 'right',
      }}>{typeof age === 'number' ? fmtAgo(age) : age}</span>
    </div>
  );
}

export default memo(BlockRow);
