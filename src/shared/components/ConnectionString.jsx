import { memo } from 'react';
import { useCopy } from '../hooks/useCopy';
import { TOKENS } from '../tokens';

function ConnectionString({ label, url, port, protocol = 'stratum+tcp' }) {
  const [copied, copy] = useCopy();
  const fullUrl = url || `${protocol}://pool.luxxpool.io:${port}`;
  const isCopied = copied === fullUrl;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      borderRadius: TOKENS.radius.lg,
      border: `1px solid ${isCopied ? TOKENS.brand.success + '40' : 'rgba(255,255,255,0.06)'}`,
      background: isCopied ? 'rgba(110,231,183,0.05)' : 'rgba(255,255,255,0.02)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          ...TOKENS.typography.label,
          fontSize: 10,
          color: TOKENS.text.dim,
          marginBottom: 3,
        }}>{label}</div>
        <div style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: 13,
          color: TOKENS.text.primary,
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{fullUrl}</div>
      </div>
      <button
        onClick={() => copy(fullUrl)}
        style={{
          padding: '6px 12px',
          borderRadius: TOKENS.radius.md,
          border: `1px solid ${isCopied ? TOKENS.brand.success + '30' : 'rgba(255,255,255,0.1)'}`,
          background: isCopied ? 'rgba(110,231,183,0.1)' : 'rgba(255,255,255,0.04)',
          color: isCopied ? TOKENS.brand.success : TOKENS.text.secondary,
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 500,
          fontFamily: TOKENS.fonts.body,
          transition: 'all 0.15s ease',
          minWidth: 44,
          minHeight: 32,
        }}
      >{isCopied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

export default memo(ConnectionString);
