import { memo } from 'react';
import { TOKENS } from '@shared/tokens';
import { fmtHash, fmtNum, fmtPct, fmtDuration } from '@shared/utils/format';
import { MetricCell, Sparkline, CoinPill, BlockRow } from '@shared/components';
import { ACTIVE_COINS } from '@shared/utils/constants';

function StatsPage({ data, viewport }) {
  const mob = viewport.mobile;
  const state = data.freshBlock ? 'found' : 'mining';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 12 : 16 }}>
      {/* KPI strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: mob ? 8 : 12,
      }}>
        <MetricCell
          label="Pool Hashrate"
          value={fmtHash(data.hashrate)}
          sub={`${fmtNum(data.miners)} miners · ${fmtNum(data.workers)} workers`}
          state={state}
          mobile={mob}
        />
        <MetricCell
          label="Active Miners"
          value={String(data.miners)}
          sub={`${fmtPct(data.poolShare, 3)} of LTC network`}
          state="mining"
          mobile={mob}
        />
        <MetricCell
          label="Network Difficulty"
          value={(data.difficulty / 1e6).toFixed(1) + 'M'}
          sub={`Net: ${fmtHash(data.netHashrate)} · Block reward: ${data.blockReward} LTC`}
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
        }}>Pool hashrate — 48h</div>
        <Sparkline
          data={data.hrHistory}
          color={TOKENS.brand.primary}
          h={mob ? 60 : 100}
        />
      </div>

      {/* Coin rail */}
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: '4px 0',
      }}>
        {ACTIVE_COINS.map(c => (
          <CoinPill
            key={c.symbol}
            symbol={c.symbol}
            name={c.name}
            color={c.color}
            role={c.role}
            active={c.active}
          />
        ))}
      </div>

      {/* Recent blocks */}
      <div style={cardBase}>
        <div style={{
          ...TOKENS.typography.label,
          color: TOKENS.text.dim,
          fontSize: 11,
          padding: '12px 14px 8px',
        }}>Recent blocks</div>
        {data.blocks.map((b, i) => (
          <BlockRow
            key={i}
            coin={b.coin}
            height={b.height}
            reward={b.reward}
            age={b.age}
            worker={b.worker}
            confirmations={b.confirmations}
          />
        ))}
      </div>

      {/* Pool info strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {[
          { label: 'Fee', value: `${data.fee}%` },
          { label: 'Payout scheme', value: 'PPLNS' },
          { label: 'Uptime', value: fmtDuration(data.uptime) },
          { label: 'Coins', value: `${ACTIVE_COINS.length} Scrypt` },
        ].map(item => (
          <div key={item.label} style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: TOKENS.radius.md,
            padding: '10px 14px',
            textAlign: 'center',
          }}>
            <div style={{ ...TOKENS.typography.label, color: TOKENS.text.dim, fontSize: 10 }}>{item.label}</div>
            <div style={{
              ...TOKENS.typography.value,
              color: TOKENS.text.primary,
              fontSize: 16,
              marginTop: 4,
            }}>{item.value}</div>
          </div>
        ))}
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

export default memo(StatsPage);
