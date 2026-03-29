import { COINS, AUX_COINS, FLEET_CONFIG, PIPELINE_CONFIG } from '../utils/constants';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Data Simulator
// High-fidelity production-cadence event generator
// Produces realistic mining events when no live server exists
//
// Share events:    ~30/sec (20 miners × ~1.5 shares/sec each)
// Block events:    ~1 every 5-60 min depending on chain
// Telemetry:       every 5 sec per miner
// Difficulty adj:  LTC every ~3.5 days, DOGE per-block
// Payment events:  every ~10 min
// Security events: random, ~1 per hour
// ═══════════════════════════════════════════════════════════

// Internal state for the simulator
let state = null;

function initState() {
  const now = Date.now();
  return {
    tick: 0,
    startTime: now,
    lastShareTime: now,
    lastBlockCheck: now,
    lastTelemetry: now,
    lastPaymentCheck: now,
    lastSecurityCheck: now,
    lastDiffCheck: now,

    // Running totals
    totalShares: 2847392,
    totalBlocks: { LTC: 142, DOGE: 1847, BELLS: 38, LKY: 21, PEP: 17, DINGO: 9, SHIC: 55 },
    ltcHeight: 2847261,
    dogeHeight: 5482910,

    // Simulated hashrate (oscillates realistically)
    baseHashrate: 325e9,
    hashPhase: 0,

    // Fleet state
    fleet: Array.from({ length: FLEET_CONFIG.count }, (_, i) => ({
      id: `cl-l9-${String(i + 1).padStart(2, '0')}`,
      hashrate: 15.5 + Math.random() * 2,
      temp: 58 + Math.floor(Math.random() * 16),
      power: 3180 + Math.floor(Math.random() * 120),
      fan: 4200 + Math.floor(Math.random() * 800),
      chipFreq: 580 + Math.floor(Math.random() * 40),
      shares: 0,
      accepted: 0,
      rejected: 0,
      stale: 0,
      lastShare: Date.now(),
      status: i < 18 ? 'online' : i === 18 ? 'offline' : 'dead',
    })),

    // Price simulation
    ltcPrice: 90.00,
    dogePrice: 0.170,

    // Earnings accumulator
    ltcEarned: 2.1061,
    dogeEarned: 3654.3,
    ltcPaid: 48.62,

    // Difficulty
    ltcDifficulty: 33.94e6,
    dogeDifficulty: 14.28e6,
  };
}

/**
 * Generate a batch of events for one flush interval (1 second).
 * Returns an array of typed events.
 */
export function generateBatch() {
  if (!state) state = initState();
  const now = Date.now();
  const events = [];
  state.tick++;
  state.hashPhase += 0.08;

  // ── SHARE EVENTS (~30 per second batch) ──
  const onlineMiners = state.fleet.filter(m => m.status === 'online');
  for (const miner of onlineMiners) {
    // Each L9 submits ~1.5 shares/sec average
    const shareCount = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 0;
    for (let j = 0; j < shareCount; j++) {
      const isAccepted = Math.random() > 0.0012; // 99.88% accept rate
      const isStale = !isAccepted && Math.random() > 0.5;
      const difficulty = [1, 2, 4, 8, 16, 32][Math.floor(Math.random() * 4.5)]; // weighted toward 4×

      state.totalShares++;
      miner.shares++;
      if (isAccepted) miner.accepted++;
      else if (isStale) miner.stale++;
      else miner.rejected++;
      miner.lastShare = now;

      events.push({
        type: isAccepted ? 'share.accepted' : isStale ? 'share.stale' : 'share.rejected',
        payload: {
          worker: miner.id,
          difficulty,
          nonce: Math.floor(Math.random() * 0xFFFFFFFF).toString(16),
          timestamp: now,
        },
      });
    }

    // Hashrate drift (small random walk per miner)
    miner.hashrate = Math.max(14.5, Math.min(17.5,
      miner.hashrate + (Math.random() - 0.5) * 0.15
    ));
  }

  // ── HASHRATE UPDATE (aggregated from miners) ──
  const poolHashrate = onlineMiners.reduce((a, m) => a + m.hashrate, 0) * 1e9;
  const oscillation = Math.sin(state.hashPhase) * 15e9 + Math.cos(state.hashPhase * 0.37) * 8e9;
  const publicHashrate = 14.9e9 + (Math.random() - 0.5) * 2e9;

  events.push({
    type: 'pool.hashrate',
    payload: {
      effective: poolHashrate + publicHashrate,
      fleet: poolHashrate,
      public: publicHashrate,
      reported: (poolHashrate + publicHashrate) * 1.03,
      timestamp: now,
    },
  });

  // ── BLOCK EVENTS (probabilistic) ──
  // LTC: ~0.038% of network = ~1 block per 7.7 days at current hashrate
  // But we speed this up for demo: ~1 block per 5-20 min
  if (now - state.lastBlockCheck > 5000) {
    state.lastBlockCheck = now;

    // LTC block (rare)
    if (Math.random() < 0.003) { // ~1 per 5-6 min in demo
      state.ltcHeight++;
      state.totalBlocks.LTC++;
      state.ltcEarned += 6.25;
      const finder = onlineMiners[Math.floor(Math.random() * onlineMiners.length)];
      events.push({
        type: 'block.found',
        payload: {
          coin: 'LTC',
          height: state.ltcHeight,
          reward: '6.25 LTC',
          worker: finder?.id || 'pool',
          confirmations: 0,
          timestamp: now,
        },
      });
    }

    // DOGE block (more frequent — ~6× LTC rate)
    if (Math.random() < 0.018) {
      state.dogeHeight++;
      state.totalBlocks.DOGE++;
      state.dogeEarned += 10000;
      events.push({
        type: 'block.found',
        payload: {
          coin: 'DOGE',
          height: state.dogeHeight,
          reward: '10,000 DOGE',
          worker: 'pool',
          confirmations: 0,
          timestamp: now,
        },
      });
    }

    // Aux chain blocks (variable frequency)
    for (const aux of ['BELLS', 'LKY', 'PEP', 'DINGO', 'SHIC']) {
      const freq = { BELLS: 0.005, LKY: 0.003, PEP: 0.002, DINGO: 0.001, SHIC: 0.008 }[aux];
      if (Math.random() < freq) {
        state.totalBlocks[aux] = (state.totalBlocks[aux] || 0) + 1;
        events.push({
          type: 'block.found',
          payload: {
            coin: aux,
            height: 100000 + state.totalBlocks[aux],
            reward: aux + ' reward',
            worker: 'pool',
            confirmations: 0,
            timestamp: now,
          },
        });
      }
    }
  }

  // ── FLEET TELEMETRY (every 5 seconds) ──
  if (now - state.lastTelemetry > 5000) {
    state.lastTelemetry = now;
    for (const miner of state.fleet) {
      if (miner.status === 'dead') continue;
      // Temperature drift
      miner.temp = Math.max(55, Math.min(80,
        miner.temp + Math.floor(Math.random() * 3 - 1)
      ));
      // Fan adjusts with temp
      miner.fan = Math.max(3500, Math.min(6000,
        miner.fan + (miner.temp > 68 ? 50 : -30) + Math.floor(Math.random() * 100 - 50)
      ));
    }
    events.push({
      type: 'fleet.telemetry',
      payload: {
        miners: state.fleet.map(m => ({ ...m })),
        timestamp: now,
      },
    });
  }

  // ── PAYMENT EVENTS (every ~10 min simulated) ──
  if (now - state.lastPaymentCheck > 30000) { // Every 30s in demo
    state.lastPaymentCheck = now;
    if (Math.random() < 0.1) {
      const amt = (0.01 + Math.random() * 0.08).toFixed(4);
      events.push({
        type: 'payment.sent',
        payload: {
          address: 'L' + Math.random().toString(36).slice(2, 8) + '...' + Math.random().toString(36).slice(2, 5),
          amount: amt + ' LTC',
          txid: Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6),
          timestamp: now,
        },
      });
    }
  }

  // ── SECURITY EVENTS (rare — ~1 per hour simulated) ──
  if (now - state.lastSecurityCheck > 60000) {
    state.lastSecurityCheck = now;
    if (Math.random() < 0.05) {
      const types = ['SYBIL_SUSPECTED', 'SHARE_FLOOD', 'TIMING_ANOMALY', 'NTIME_DRIFT', 'VARDIFF_GAMING'];
      const severities = ['low', 'medium', 'critical'];
      events.push({
        type: 'security.event',
        payload: {
          type: types[Math.floor(Math.random() * types.length)],
          ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
          detail: 'Automated detection triggered',
          action: Math.random() > 0.5 ? 'Auto-banned' : 'Monitoring',
          severity: severities[Math.floor(Math.random() * severities.length)],
          timestamp: now,
        },
      });
    }
  }

  // ── DIFFICULTY UPDATES ──
  if (now - state.lastDiffCheck > 20000) {
    state.lastDiffCheck = now;
    // DOGE difficulty varies per-block (small random walk)
    state.dogeDifficulty *= (1 + (Math.random() - 0.5) * 0.02);
    // LTC difficulty steps every ~3.5 days (very rare change)
    if (Math.random() < 0.001) {
      state.ltcDifficulty *= (1 + (Math.random() - 0.5) * 0.06);
    }
    events.push({
      type: 'network.difficulty',
      payload: {
        ltc: state.ltcDifficulty,
        doge: state.dogeDifficulty,
        ltcHeight: state.ltcHeight,
        dogeHeight: state.dogeHeight,
        timestamp: now,
      },
    });
  }

  // ── PRICE DRIFT ──
  state.ltcPrice *= (1 + (Math.random() - 0.5) * 0.002);
  state.dogePrice *= (1 + (Math.random() - 0.5) * 0.003);

  events.push({
    type: 'network.prices',
    payload: {
      LTC: state.ltcPrice,
      DOGE: state.dogePrice,
      timestamp: now,
    },
  });

  return events;
}

/** Reset simulator state (for testing) */
export function resetSimulator() {
  state = initState();
}

/** Get current simulator internal state (for debugging) */
export function getSimulatorState() {
  return state ? { ...state } : null;
}
