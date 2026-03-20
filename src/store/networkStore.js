import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Network Store (Phase 3)
// Handles network difficulty and price events from ring buffer flush
// ═══════════════════════════════════════════════════════════

export const useNetworkStore = create((set) => ({
  ltcDifficulty: 33.94e6,
  ltcHeight: 2847261,
  ltcNetHashrate: 856.2e12,
  ltcBlockReward: 6.25,
  ltcPrice: 90.00,
  ltcPoolShare: 0.038,
  dogeDifficulty: 14.28e6,
  dogeHeight: 5482910,
  dogePrice: 0.170,
  fee: 2,
  soloFee: 1,
  luck: 112,
  avgBlockTime: 15120,

  ltcDiffHistory: Array.from({ length: 30 }, (_, i) =>
    i < 10 ? 32.8 : i < 20 ? 32.8 * 1.034 : 32.8 * 1.034 * 0.988
  ),
  dogeDiffHistory: Array.from({ length: 30 }, (_, i) =>
    14.2 + Math.sin(i / 3) * 0.8 + Math.sin(i / 7) * 0.4 + Math.random() * 0.3
  ),

  auxChains: {
    DOGE:  { blocks: 1847, hashrate: 18.2e9, lastBlock: 720, reward: '10,000', active: true },
    BELLS: { blocks: 38, hashrate: 4.1e9, lastBlock: 7200, reward: 'Random', active: true },
    LKY:   { blocks: 21, hashrate: 2.8e9, lastBlock: 14400, reward: 'Halving', active: true },
    PEP:   { blocks: 17, hashrate: 1.9e9, lastBlock: 21600, reward: 'Halving', active: true },
    DINGO: { blocks: 9, hashrate: 0.8e9, lastBlock: 50400, reward: 'Variable', active: true },
    SHIC:  { blocks: 55, hashrate: 8.3e9, lastBlock: 2700, reward: 'Halving', active: true },
  },

  ingest: (event) => {
    if (!event) return;

    set((state) => {
      if (event.type === 'network') {
        const updates = {};

        if (event.difficulty) {
          const d = event.difficulty;
          if (d.ltc) {
            updates.ltcDifficulty = d.ltc;
            // Push to history if significantly different from last point
            const lastHistVal = state.ltcDiffHistory[state.ltcDiffHistory.length - 1];
            if (Math.abs(d.ltc / 1e6 - lastHistVal) > 0.05) {
              updates.ltcDiffHistory = [...state.ltcDiffHistory.slice(1), d.ltc / 1e6];
            }
          }
          if (d.doge) {
            updates.dogeDifficulty = d.doge;
            updates.dogeDiffHistory = [...state.dogeDiffHistory.slice(1), d.doge / 1e6];
          }
          if (d.ltcHeight) updates.ltcHeight = d.ltcHeight;
          if (d.dogeHeight) updates.dogeHeight = d.dogeHeight;
        }

        if (event.prices) {
          const p = event.prices;
          if (p.LTC) updates.ltcPrice = p.LTC;
          if (p.DOGE) updates.dogePrice = p.DOGE;
        }

        return updates;
      }

      if (event.type === 'tick') {
        return {
          ltcHeight: state.ltcHeight + (Math.random() < 0.02 ? 1 : 0),
          dogeHeight: state.dogeHeight + (Math.random() < 0.05 ? 1 : 0),
        };
      }

      return {};
    });
  },
}));
