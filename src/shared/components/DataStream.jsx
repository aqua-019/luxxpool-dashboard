import { memo } from 'react';
import { fmtAgo, fmtNum } from '../utils/format';
import { TOKENS, getStateToken } from '../tokens';

const EVENT_STYLES = {
  'block.found': 'found',
  'share.rejected': 'alert',
  'security.event': 'orphaned',
  'payment.sent': 'aux',
  default: 'mining',
};

function DataStream({ events = [], maxItems = 8, style }) {
  const visible = events.slice(0, maxItems);
  return (
    <div style={{
      borderRadius: TOKENS.radius.lg,
      border: TOKENS.card.border,
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        ...TOKENS.typography.label,
        fontSize: 10,
        color: TOKENS.text.dim,
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>Live feed</div>
      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {visible.length === 0 && (
          <div style={{ padding: '16px 12px', color: TOKENS.text.dim, fontSize: 12, textAlign: 'center' }}>
            No events yet — pool is mining
          </div>
        )}
        {visible.map((evt, i) => {
          const state = EVENT_STYLES[evt.type] || EVENT_STYLES.default;
          const st = getStateToken(state);
          return (
            <div key={evt.id || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              fontSize: 11,
              fontFamily: TOKENS.fonts.mono,
              animation: i === 0 ? 'fadeIn 0.3s ease' : undefined,
            }}>
              <span style={{
                width: 5, height: 5,
                borderRadius: '50%',
                background: st.fg,
                flexShrink: 0,
              }} />
              <span style={{ color: st.fg, fontWeight: 500, minWidth: 50 }}>
                {evt.coin || evt.type?.split('.')[0] || '—'}
              </span>
              <span style={{ color: TOKENS.text.secondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {evt.message || evt.detail || `${evt.type}`}
              </span>
              <span style={{ color: TOKENS.text.dim, fontSize: 10 }}>
                {evt.age != null ? fmtAgo(evt.age) : 'now'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(DataStream);
