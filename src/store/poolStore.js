import { create } from 'zustand';
import { PIPELINE_CONFIG } from '../utils/constants';
import { ema } from '../utils/math';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pool Store (Phase 3)
// Handles batch events from the ring buffer flush engine.
// Maintains rolling history arrays and running totals.
// ═══════════════════════════════════════════════════════════

const HL = PIPELINE_CONFIG.historyLengths;

// Initial history arrays with realistic seed data
const seedHR = Array.from({ length: HL.hashrate }, (_, i) =>
  290 + Math.sin(i * 0.12) * 40 + Math.cos(i * 0.04) * 25 + Math.random() * 10
);
const seedShares = Array.from({ length: HL.shares }, () => Math.floor(800 + Math.random() * 600));
const seedMiners = Array.from({ length: HL.miners }, () => Math.floor(18 + Math.random() * 8));

export const usePoolStore = create((set, get) => ({
  // ── Current metrics ──
  hashrate: 325e9,
  reported: 335e9,
  scoring: 324e9,
  miners: 22,
  workers: 26,
  acceptRate: 99.88,
  staleRate: 0.08,
  rejectRate: 0.04,
  shareRate: 1847,
  vardiffAvg: 2.59,

  // ── Running share counters (per flush interval) ──
  sharesThisFlush: 0,
  acceptedThisFlush: 0,
  rejectedThisFlush: 0,
  staleThisFlush: 0,

  // ── Block data ──
  blocksLTC: 142,
  blocksAux: 39 + 55 + 38 + 21 + 17 + 9, // all aux combined
  blocksTotal: 142 + 39 + 55 + 38 + 21 + 17 + 9 + 1847,
  lastBlockAge: 15,
  lastBlockTime: Date.now() - 15000,
  luckLTC: 112,
  luckDOGE: 97,
  avgBlockTime: 15120,

  // ── Earnings ──
  ltcBalance: 2.1061,
  dogeBalance: 3654.3,
  ltcPending: 0.2341,
  ltcConfirmed: 1.872,
  ppsRatio: 1.437,
  dailyRevenue: 38.42,
  lifetimePaid: 4862,
  payoutsPending: 0.0234,
  payoutsTotal: 18.42,
  payoutCount: 247,

  // ── Uptime ──
  uptime: 1234567,

  // ── Histories (ring buffers) ──
  hrHistory: seedHR,
  shareHistory: seedShares,
  minerHistory: seedMiners,

  // ── Block history ──
  blocks: [
    { coin: 'LTC', height: 2847261, age: 15, reward: '6.25 LTC', worker: 'L9_07', confirmations: 0, timestamp: Date.now() - 15000 },
    { coin: 'DOGE', height: 5281034, age: 720, reward: '10,000 DOGE', worker: 'pool', confirmations: 89, timestamp: Date.now() - 720000 },
    { coin: 'SHIC', height: 52019, age: 2700, reward: '500 SHIC', worker: 'pool', confirmations: 12, timestamp: Date.now() - 2700000 },
    { coin: 'BELLS', height: 189234, age: 7200, reward: 'Random', worker: 'pool', confirmations: 147, timestamp: Date.now() - 7200000 },
    { coin: 'LTC', height: 2847255, age: 10800, reward: '6.25 LTC', worker: 'L9_12', confirmations: 412, timestamp: Date.now() - 10800000 },
    { coin: 'DOGE', height: 5280998, age: 18000, reward: '10,000 DOGE', worker: 'pool', confirmations: 523, timestamp: Date.now() - 18000000 },
  ],

  // ── Payment history ──
  payments: [
    { address: 'LhXk7...abc', amount: '0.0847 LTC', txid: 'a3f8e2...cb41', age: 7200, timestamp: Date.now() - 7200000 },
    { address: 'Ltc1q...def', amount: '0.0123 LTC', txid: 'd7c2b8...9e72', age: 43200, timestamp: Date.now() - 43200000 },
  ],

  // ── Ingest: batch handler from flush engine ──
  ingest: (event) => {
    if (!event) return;
    const now = Date.now();

    set((state) => {
      const updates = {};

      if (event.type === 'batch') {
        // Share aggregation
        const shares = event.shares || [];
        const accepted = shares.filter(s => s.type === 'share.accepted').length;
        const stale = shares.filter(s => s.type === 'share.stale').length;
        const rejected = shares.filter(s => s.type === 'share.rejected').length;
        const total = accepted + stale + rejected;

        if (total > 0) {
          updates.shareRate = total * 60; // extrapolate to per-minute
          updates.acceptRate = total > 0 ? (accepted / total) * 100 : state.acceptRate;
          updates.staleRate = total > 0 ? (stale / total) * 100 : state.staleRate;
          updates.rejectRate = total > 0 ? (rejected / total) * 100 : state.rejectRate;

          // Vardiff average from share difficulties
          const diffs = shares.filter(s => s.payload?.difficulty).map(s => s.payload.difficulty);
          if (diffs.length > 0) {
            updates.vardiffAvg = ema(state.vardiffAvg, diffs.reduce((a, b) => a + b, 0) / diffs.length, 0.1);
          }
        }

        // Hashrate from pool.hashrate event
        if (event.hashrate) {
          const hr = event.hashrate;
          updates.hashrate = hr.effective || state.hashrate;
          updates.reported = hr.reported || state.reported;
          updates.scoring = ema(state.scoring, hr.effective || state.hashrate, 0.08);

          // Push to history
          const newHR = [...state.hrHistory.slice(1), (hr.effective || state.hashrate) / 1e9];
          updates.hrHistory = newHR;
        }

        // Share history update
        const newShareHist = [...state.shareHistory.slice(1), total > 0 ? total * 60 : state.shareHistory[state.shareHistory.length - 1]];
        updates.shareHistory = newShareHist;

        // Block events
        const blocks = event.blocks || [];
        if (blocks.length > 0) {
          const newBlocks = blocks.map(b => ({
            coin: b.payload.coin,
            height: b.payload.height,
            age: 0,
            reward: b.payload.reward,
            worker: b.payload.worker,
            confirmations: 0,
            timestamp: b.payload.timestamp || now,
          }));

          updates.blocks = [...newBlocks, ...state.blocks].slice(0, 50);
          updates.lastBlockAge = 0;
          updates.lastBlockTime = now;

          // Count by type
          const ltcBlocks = blocks.filter(b => b.payload.coin === 'LTC').length;
          const auxBlocks = blocks.length - ltcBlocks;
          updates.blocksLTC = state.blocksLTC + ltcBlocks;
          updates.blocksAux = state.blocksAux + auxBlocks;
          updates.blocksTotal = state.blocksTotal + blocks.length;

          // Earnings from LTC blocks
          updates.ltcBalance = state.ltcBalance + ltcBlocks * 6.25;
        } else {
          // Increment block age
          updates.lastBlockAge = Math.floor((now - state.lastBlockTime) / 1000);
          // Age existing blocks
          updates.blocks = state.blocks.map(b => ({
            ...b,
            age: Math.floor((now - b.timestamp) / 1000),
            confirmations: b.confirmations + (Math.random() < 0.1 ? 1 : 0),
          }));
        }

        // Payment events
        const payments = event.payments || [];
        if (payments.length > 0) {
          const newPayments = payments.map(p => ({
            ...p.payload,
            age: 0,
          }));
          updates.payments = [...newPayments, ...state.payments].slice(0, 50);
          updates.payoutCount = state.payoutCount + payments.length;
        }

        // Uptime
        updates.uptime = state.uptime + 1;

      } else if (event.type === 'tick') {
        // Legacy Phase 1 compatibility
        const t = now;
        const hr = 325e9 + Math.sin(t * 0.00008) * 20e9 + Math.cos(t * 0.00003) * 10e9;
        updates.hashrate = hr;
        updates.reported = hr * 1.03;
        updates.scoring = ema(state.scoring, hr, 0.08);
        updates.hrHistory = [...state.hrHistory.slice(1), hr / 1e9];
        updates.shareHistory = [...state.shareHistory.slice(1), Math.floor(800 + Math.random() * 600)];
        updates.minerHistory = [...state.minerHistory.slice(1), Math.floor(18 + Math.random() * 8)];
        updates.lastBlockAge = state.lastBlockAge + 3;
        updates.uptime = state.uptime + 3;
      }

      return updates;
    });
  },
}));
