import { memo } from 'react';
import { TOKENS } from '@shared/tokens';
import { ConnectionString } from '@shared/components';

function ConnectPage({ mobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 12 : 16 }}>
      {/* Stratum connections */}
      <div style={{
        ...TOKENS.typography.label,
        color: TOKENS.text.dim,
        fontSize: 11,
        marginBottom: -4,
      }}>Stratum connection</div>

      <ConnectionString
        label="Pool (Stratum)"
        url="stratum+tcp://pool.luxxpool.io:3333"
        port={3333}
      />
      <ConnectionString
        label="Pool SSL (Stratum+TLS)"
        url="stratum+ssl://pool.luxxpool.io:3334"
        port={3334}
        protocol="stratum+ssl"
      />
      <ConnectionString
        label="Solo Mining"
        url="stratum+tcp://pool.luxxpool.io:3336"
        port={3336}
      />

      {/* Port reference */}
      <div style={{
        background: TOKENS.card.background,
        border: TOKENS.card.border,
        borderRadius: TOKENS.card.borderRadius,
        padding: mobile ? '12px 14px' : '16px 20px',
      }}>
        <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 11, marginBottom: 12 }}>Port reference</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          gap: '8px 16px',
          fontFamily: TOKENS.fonts.mono,
          fontSize: 12,
        }}>
          {[
            ['Pool mining', '3333', 'Standard Stratum v1'],
            ['Pool SSL', '3334', 'TLS-encrypted Stratum'],
            ['Solo mining', '3336', 'Solo mode — full block reward'],
          ].map(([label, port, desc]) => (
            <div key={port} style={{ display: 'contents' }}>
              <span style={{ color: TOKENS.text.primary, fontWeight: 500 }}>{label}</span>
              <span style={{ color: TOKENS.brand.primary, fontWeight: 600 }}>{port}</span>
              <span style={{ color: TOKENS.text.secondary }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Miner config examples */}
      <div style={{
        background: TOKENS.card.background,
        border: TOKENS.card.border,
        borderRadius: TOKENS.card.borderRadius,
        padding: mobile ? '12px 14px' : '16px 20px',
      }}>
        <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 11, marginBottom: 12 }}>Miner configuration</div>
        {[
          {
            name: 'cgminer / bfgminer',
            config: `-o stratum+tcp://pool.luxxpool.io:3333 -u YOUR_LTC_ADDRESS.worker1 -p x`,
          },
          {
            name: 'Antminer L9 (web UI)',
            config: `URL: stratum+tcp://pool.luxxpool.io:3333\nWorker: YOUR_LTC_ADDRESS.L9_01\nPassword: x`,
          },
        ].map(m => (
          <div key={m.name} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: TOKENS.text.primary, fontWeight: 500, marginBottom: 6 }}>{m.name}</div>
            <pre style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: 11,
              color: TOKENS.brand.primary,
              background: 'rgba(74,158,255,0.06)',
              padding: '10px 12px',
              borderRadius: TOKENS.radius.md,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}>{m.config}</pre>
          </div>
        ))}
      </div>

      {/* Supported coins */}
      <div style={{
        background: TOKENS.card.background,
        border: TOKENS.card.border,
        borderRadius: TOKENS.card.borderRadius,
        padding: mobile ? '12px 14px' : '16px 20px',
      }}>
        <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 11, marginBottom: 8 }}>
          Merged mining — mine all coins simultaneously
        </div>
        <div style={{ fontSize: 13, color: TOKENS.text.secondary, lineHeight: 1.6 }}>
          LUXXPOOL uses Auxiliary Proof-of-Work (AuxPoW) to mine LTC as the parent chain plus 7 auxiliary Scrypt coins simultaneously.
          No additional configuration needed — merged mining is automatic. One connection mines all coins.
        </div>
      </div>
    </div>
  );
}

export default memo(ConnectPage);
