import { memo } from 'react';
import { TOKENS } from '../tokens';

function CoinPill({ symbol, name, color, role, active = true, onClick, selected }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: TOKENS.radius.xl,
        border: `1px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`,
        background: selected ? `${color}15` : 'rgba(255,255,255,0.03)',
        cursor: onClick ? 'pointer' : 'default',
        opacity: active ? 1 : 0.4,
        transition: 'all 0.15s ease',
        fontFamily: TOKENS.fonts.mono,
        minHeight: 36,
        minWidth: 44,
      }}
    >
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: active ? color : TOKENS.text.dim,
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: active ? color : TOKENS.text.dim,
        letterSpacing: '0.02em',
      }}>{symbol}</span>
      {role === 'parent' && (
        <span style={{
          fontSize: 9,
          padding: '1px 4px',
          borderRadius: 3,
          background: 'rgba(255,255,255,0.06)',
          color: TOKENS.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>Parent</span>
      )}
    </button>
  );
}

export default memo(CoinPill);
