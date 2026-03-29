import { memo, useState } from 'react';
import { TOKENS } from '@shared/tokens';
import { fmtHash, fmtCrypto, fmtNum } from '@shared/utils/format';
import { MetricCell, Sparkline, WorkerRow, PayoutRow } from '@shared/components';
import { COINS } from '@shared/utils/constants';

function DashboardPage({ data, viewport }) {
  const mob = viewport.mobile;
  const [paymentFilter, setPaymentFilter] = useState('all');
  const allOffline = data.workersOnline === 0;
  const isNew = data.totalShares < 10;

  // Determine state for KPI cells
  const hrState = allOffline ? 'alert' : data.freshBlock ? 'found' : 'mining';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 12 : 16 }}>
      {/* New miner onboarding */}
      {isNew && (
        <div style={{
          background: TOKENS.state.aux.bg,
          border: `1px solid ${TOKENS.state.aux.border}`,
          borderRadius: TOKENS.radius.lg,
          padding: mob ? '12px 14px' : '16px 20px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.state.aux.fg, marginBottom: 6 }}>
            Welcome to LUXXPOOL
          </div>
          <div style={{ fontSize: 13, color: TOKENS.text.secondary, lineHeight: 1.6 }}>
            Your miner is connecting. Stats will appear once shares are submitted.
            Point your ASIC to <span style={{ fontFamily: TOKENS.fonts.mono, color: TOKENS.brand.primary }}>stratum+tcp://pool.luxxpool.io:3333</span> with
            your address as the worker name.
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: mob ? 8 : 12,
      }}>
        <MetricCell
          label="Your Hashrate"
          value={fmtHash(data.hashrate)}
          sub={`Reported: ${fmtHash(data.reportedHashrate)}`}
          state={hrState}
          mobile={mob}
        />
        <MetricCell
          label="Workers"
          value={`${data.workersOnline}/${data.workersTotal}`}
          sub={allOffline ? 'All workers offline' : `Last share: ${data.lastShare}s ago`}
          state={allOffline ? 'alert' : 'mining'}
          mobile={mob}
        />
        <MetricCell
          label="Pending Balance"
          value={fmtCrypto(data.pendingBalance, 'LTC')}
          sub={`Total paid: ${fmtCrypto(data.totalPaid, 'LTC')}`}
          state="idle"
          mobile={mob}
        />
      </div>

      {/* Hashrate sparkline */}
      <div style={{
        ...cardBase,
        padding: mob ? '12px 14px' : '16px 20px',
      }}>
        <div style={{
          ...TOKENS.typography.label,
          color: TOKENS.text.dim,
          fontSize: 11,
          marginBottom: 8,
        }}>Your hashrate — 24h</div>
        <Sparkline
          data={data.hrHistory}
          color={hrState === 'alert' ? TOKENS.brand.danger : TOKENS.brand.primary}
          h={mob ? 50 : 80}
        />
      </div>

      {/* Workers table */}
      <div style={cardBase}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px 8px',
        }}>
          <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 11 }}>
            Workers
          </div>
          <div style={{ fontSize: 11, color: TOKENS.text.secondary }}>
            {data.workersOnline} online · {data.workersTotal - data.workersOnline} offline
          </div>
        </div>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mob ? '1fr 70px 50px' : '1fr 80px 70px 60px 60px 70px',
          gap: 8,
          padding: '4px 12px',
          fontSize: 10,
          color: TOKENS.text.dim,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          <span>Worker</span>
          <span>Hashrate</span>
          <span>Diff</span>
          {!mob && <><span>Temp</span><span>Power</span><span>Last share</span></>}
        </div>
        {/* Rows */}
        <div style={{ maxHeight: mob ? 240 : 400, overflowY: 'auto' }}>
          {data.workers.map((w, i) => (
            <WorkerRow
              key={w.name || i}
              name={w.name}
              hashrate={w.hashrate}
              difficulty={w.difficulty}
              status={w.status}
              lastShare={w.lastShare}
              temp={w.temp}
              power={w.power}
              mobile={mob}
            />
          ))}
        </div>
      </div>

      {/* Pending payouts per coin */}
      <div style={cardBase}>
        <div style={{
          ...TOKENS.typography.label,
          color: TOKENS.text.dim,
          fontSize: 11,
          padding: '12px 14px 8px',
        }}>Pending payouts</div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          padding: '4px 14px 12px',
        }}>
          {(data.pendingByCoins || []).map(p => {
            const coinDef = COINS.find(c => c.symbol === p.coin);
            return (
              <div key={p.coin} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: TOKENS.radius.md,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: mob ? '45%' : 'auto',
                flex: mob ? '1 1 45%' : 'none',
              }}>
                <span style={{
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: coinDef?.color || TOKENS.brand.primary,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: coinDef?.color || TOKENS.text.primary,
                }}>{p.coin}</span>
                <span style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 12,
                  color: TOKENS.text.primary,
                  fontVariantNumeric: 'tabular-nums',
                }}>{typeof p.amount === 'number' ? p.amount.toFixed(p.coin === 'LTC' ? 4 : 1) : p.amount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      <div style={cardBase}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px 8px',
        }}>
          <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 11 }}>
            Payment history
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {['all', 'LTC', 'aux'].map(f => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                style={{
                  padding: '4px 10px',
                  borderRadius: TOKENS.radius.sm,
                  border: 'none',
                  background: paymentFilter === f ? 'rgba(74,158,255,0.12)' : 'transparent',
                  color: paymentFilter === f ? TOKENS.brand.primary : TOKENS.text.dim,
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 500,
                  fontFamily: TOKENS.fonts.body,
                  textTransform: 'uppercase',
                }}
              >{f === 'all' ? 'All' : f === 'LTC' ? 'LTC' : 'Aux'}</button>
            ))}
          </div>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {(data.payments || [])
            .filter(p => {
              if (paymentFilter === 'all') return true;
              if (paymentFilter === 'LTC') return p.coin === 'LTC';
              return p.coin !== 'LTC';
            })
            .map((p, i) => (
              <PayoutRow
                key={i}
                coin={p.coin}
                amount={p.amount}
                txid={p.txid}
                age={p.age}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

const cardBase = {
  background: TOKENS.card.background,
  border: TOKENS.card.border,
  borderRadius: TOKENS.card.borderRadius,
  overflow: 'hidden',
};

export default memo(DashboardPage);
