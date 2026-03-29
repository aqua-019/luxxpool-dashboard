import { memo } from 'react';
import { TOKENS, getStateToken, cardStyle } from '../tokens';

function MetricCell({ label, value, sub, state = 'idle', mobile }) {
  const st = getStateToken(state);
  return (
    <div style={{
      background: st.bg,
      border: `1px solid ${st.border}`,
      borderRadius: TOKENS.radius.lg,
      padding: mobile ? '10px 12px' : '14px 16px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {state !== 'idle' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: st.glow,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative' }}>
        <div style={{
          ...TOKENS.typography.label,
          color: TOKENS.text.dim,
          fontSize: 11,
          marginBottom: 4,
        }}>{label}</div>
        <div style={{
          ...TOKENS.typography.value,
          fontSize: mobile ? 22 : 28,
          color: st.fg,
          lineHeight: 1,
        }}>{value}</div>
        {sub && (
          <div style={{
            ...TOKENS.typography.micro,
            color: TOKENS.text.secondary,
            marginTop: 4,
          }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

export default memo(MetricCell);
