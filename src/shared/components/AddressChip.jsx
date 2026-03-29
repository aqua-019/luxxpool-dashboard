import { memo } from 'react';
import { useCopy } from '../hooks/useCopy';
import { TOKENS } from '../tokens';

function AddressChip({ address, truncate = true }) {
  const [copied, copy] = useCopy();
  if (!address) return null;
  const display = truncate && address.length > 16
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : address;
  const isCopied = copied === address;
  return (
    <button
      onClick={() => copy(address)}
      title={address}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: TOKENS.radius.md,
        border: `1px solid ${isCopied ? TOKENS.brand.success + '40' : 'rgba(255,255,255,0.08)'}`,
        background: isCopied ? 'rgba(110,231,183,0.08)' : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        fontFamily: TOKENS.fonts.mono,
        fontSize: 12,
        color: isCopied ? TOKENS.brand.success : TOKENS.text.primary,
        letterSpacing: '0.01em',
        transition: 'all 0.15s ease',
      }}
    >
      <span>{display}</span>
      <span style={{ fontSize: 10, opacity: 0.6 }}>{isCopied ? '✓' : '⧉'}</span>
    </button>
  );
}

export default memo(AddressChip);
