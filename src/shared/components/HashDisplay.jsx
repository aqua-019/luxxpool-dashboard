import { memo } from 'react';
import { fmtHash } from '../utils/format';
import { TOKENS } from '../tokens';

function HashDisplay({ hashrate, size = 'md', color }) {
  const formatted = fmtHash(hashrate || 0);
  const [num, unit] = formatted.split(' ');
  const sizes = { sm: 14, md: 22, lg: 32 };
  return (
    <span style={{
      fontFamily: TOKENS.fonts.mono,
      fontVariantNumeric: 'tabular-nums',
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 4,
    }}>
      <span style={{
        fontSize: sizes[size] || sizes.md,
        fontWeight: 600,
        color: color || TOKENS.text.primary,
        letterSpacing: '-0.02em',
      }}>{num}</span>
      <span style={{
        fontSize: Math.max(10, (sizes[size] || sizes.md) * 0.45),
        color: TOKENS.text.secondary,
        fontWeight: 400,
      }}>{unit}</span>
    </span>
  );
}

export default memo(HashDisplay);
