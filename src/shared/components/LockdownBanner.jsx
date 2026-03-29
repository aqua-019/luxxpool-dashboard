import { memo } from 'react';
import { TOKENS, getStateToken } from '../tokens';

const LOCKDOWN_LEVELS = {
  0: { label: 'Normal', desc: 'All systems operational' },
  1: { label: 'Alert', desc: 'Elevated threat level — monitoring active' },
  2: { label: 'Defense', desc: 'Active defense measures engaged' },
  3: { label: 'Lockdown', desc: 'Restricted operations — new connections limited' },
  4: { label: 'Full Lockdown', desc: 'All connections refused — emergency mode' },
};

function LockdownBanner({ level = 0, reason }) {
  if (level === 0) return null;
  const state = level >= 3 ? 'orphaned' : 'alert';
  const st = getStateToken(state);
  const info = LOCKDOWN_LEVELS[level] || LOCKDOWN_LEVELS[4];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 16px',
      borderRadius: TOKENS.radius.lg,
      background: st.bg,
      border: `1px solid ${st.border}`,
      color: st.fg,
    }}>
      <span style={{
        fontSize: 16,
        flexShrink: 0,
      }}>{level >= 3 ? '⚠' : '◈'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: TOKENS.fonts.display,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {info.label} — Level {level}
        </div>
        <div style={{
          fontSize: 12,
          color: TOKENS.text.secondary,
          marginTop: 2,
        }}>{reason || info.desc}</div>
      </div>
    </div>
  );
}

export default memo(LockdownBanner);
