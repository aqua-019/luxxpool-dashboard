import { memo } from 'react';
import { fmtCrypto, fmtAgo } from '../utils/format';
import { TOKENS } from '../tokens';
import { COINS } from '../utils/constants';

function PayoutRow({ coin, amount, txid, age, timestamp }) {
  const coinDef = COINS.find(c => c.symbol === coin);
  const color = coinDef?.color || TOKENS.brand.primary;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      fontFamily: TOKENS.fonts.mono,
      fontSize: 12,
    }}>
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      <span style={{
        fontWeight: 600,
        color: color,
        minWidth: 48,
      }}>{coin}</span>
      <span style={{
        color: TOKENS.text.primary,
        fontWeight: 500,
        flex: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>{fmtCrypto(amount, coin)}</span>
      {txid && (
        <span style={{
          color: TOKENS.text.dim,
          fontSize: 11,
          maxWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }} title={txid}>{txid.slice(0, 8)}...{txid.slice(-4)}</span>
      )}
      <span style={{
        color: TOKENS.text.secondary,
        fontSize: 11,
        minWidth: 55,
        textAlign: 'right',
      }}>{age != null ? fmtAgo(age) : '—'}</span>
    </div>
  );
}

export default memo(PayoutRow);
