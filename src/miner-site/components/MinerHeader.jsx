import { memo } from 'react';
import { TOKENS } from '@shared/tokens';
import { AddressChip } from '@shared/components';

function MinerHeader({ address, onLogout, mobile }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: mobile ? '16px 0' : '24px 0',
      borderBottom: `1px solid rgba(255,255,255,0.04)`,
      marginBottom: mobile ? 12 : 20,
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{
        fontFamily: TOKENS.fonts.display,
        fontSize: mobile ? 18 : 22,
        fontWeight: 700,
        color: TOKENS.text.primary,
        letterSpacing: '-0.03em',
      }}>
        <span style={{ color: TOKENS.brand.primary }}>LUXX</span>POOL
        <span style={{
          fontSize: 11,
          color: TOKENS.text.dim,
          fontFamily: TOKENS.fonts.body,
          fontWeight: 400,
          marginLeft: 8,
          letterSpacing: '0.02em',
        }}>Miner</span>
      </div>

      {address && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AddressChip address={address} />
          <button
            onClick={onLogout}
            style={{
              padding: '6px 12px',
              borderRadius: TOKENS.radius.md,
              border: `1px solid rgba(255,255,255,0.08)`,
              background: 'rgba(255,255,255,0.03)',
              color: TOKENS.text.secondary,
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: TOKENS.fonts.body,
              fontWeight: 500,
              minHeight: 32,
              minWidth: 44,
            }}
          >Logout</button>
        </div>
      )}
    </header>
  );
}

export default memo(MinerHeader);
