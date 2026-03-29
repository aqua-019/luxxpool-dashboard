import { memo } from 'react';
import { TOKENS } from '@shared/tokens';

const FAQ_ITEMS = [
  {
    q: 'What hardware do I need?',
    a: 'LUXXPOOL is a Scrypt mining pool. You need a Scrypt ASIC miner — Antminer L9 (16 GH/s), Antminer L7 (9.5 GH/s), or ElphaPex DG2 (36 GH/s) are recommended. GPU and CPU mining is not profitable on Scrypt.',
  },
  {
    q: 'How do payouts work?',
    a: 'LUXXPOOL uses PPLNS (Pay Per Last N Shares) to discourage pool-hopping. Payouts are processed automatically when your balance reaches the minimum threshold (0.01 LTC). Auxiliary coin payouts are sent to the same address.',
  },
  {
    q: 'What is merged mining?',
    a: 'Merged mining (AuxPoW) lets you mine multiple Scrypt coins simultaneously with zero additional hashrate cost. When you mine LTC on LUXXPOOL, you also mine DOGE, BELLS, LKY, PEP, DINGO, and SHIC — all at once. The pool handles the AuxPoW proof construction automatically.',
  },
  {
    q: 'What is the pool fee?',
    a: '2% for pool mining. 1% for solo mining. Fleet operators with whitelisted IPs pay 0%.',
  },
  {
    q: 'How do I check my stats?',
    a: 'Visit the Miner Dashboard and enter your Litecoin address. No account or password needed — your address is your identity. You can see your hashrate, workers, pending balance, and payment history.',
  },
  {
    q: 'What is VarDiff?',
    a: 'Variable Difficulty automatically adjusts your share difficulty to target ~1 share every 15 seconds. This reduces bandwidth and improves efficiency. The retarget window is 90 seconds.',
  },
  {
    q: 'Is the pool secure?',
    a: 'LUXXPOOL runs a 9-layer SecurityEngine that detects and mitigates share manipulation, block withholding (BWH), Sybil attacks, and connection flooding in real time. IP reputation scoring and HMAC mining cookies protect against MitM attacks.',
  },
  {
    q: 'How do I mine solo?',
    a: 'Connect to port 3336 instead of 3333. Solo mining gives you the full block reward (6.25 LTC) when you find a block, minus the 1% solo fee. No PPLNS — you only earn when you find a block.',
  },
];

function FAQPage({ mobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 8 : 12 }}>
      <div style={{
        fontFamily: TOKENS.fonts.display,
        fontSize: mobile ? 18 : 22,
        fontWeight: 600,
        color: TOKENS.text.primary,
        letterSpacing: '-0.02em',
        marginBottom: 4,
      }}>Setup guide</div>

      {FAQ_ITEMS.map((item, i) => (
        <div key={i} style={{
          background: TOKENS.card.background,
          border: TOKENS.card.border,
          borderRadius: TOKENS.card.borderRadius,
          padding: mobile ? '12px 14px' : '16px 20px',
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: TOKENS.text.primary,
            marginBottom: 6,
          }}>{item.q}</div>
          <div style={{
            fontSize: 13,
            color: TOKENS.text.secondary,
            lineHeight: 1.6,
          }}>{item.a}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(FAQPage);
