import { memo } from 'react';
import { TOKENS } from '../tokens';

function Sparkline({ data, color, w = 200, h = 40, fill = true, style }) {
  const c = color || TOKENS.brand.primary;
  if (!data || data.length < 3) {
    return (
      <div style={{ width: '100%', height: h, background: 'rgba(255,255,255,0.02)', borderRadius: TOKENS.radius.sm, ...style }} />
    );
  }
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const rg = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - mn) / rg) * (h - 6)}`).join(' ');
  const id = 'sp' + c.replace(/[^a-z0-9]/gi, '') + w + h;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', ...style }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.25" />
              <stop offset="100%" stopColor={c} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
        </>
      )}
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default memo(Sparkline);
