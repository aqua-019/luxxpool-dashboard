import { create } from 'zustand';
import { FLEET_CONFIG } from '../utils/constants';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Fleet Store (Phase 3)
// Handles telemetry events from ring buffer flush
// ═══════════════════════════════════════════════════════════

function generateFleet() {
  return Array.from({ length: FLEET_CONFIG.count }, (_, i) => ({
    id: `cl-l9-${String(i + 1).padStart(2, '0')}`,
    worker: `L9_${String(i + 1).padStart(2, '0')}`,
    hashrate: 15.5 + Math.random() * 2,
    reported: 16.0 + Math.random() * 1.5,
    shares: Math.floor(800 + Math.random() * 500),
    accepted: Math.floor(780 + Math.random() * 500),
    rejected: Math.floor(Math.random() * 10),
    stale: Math.floor(Math.random() * 8),
    rejectRate: parseFloat((Math.random() * 1.5).toFixed(2)),
    temp: Math.floor(58 + Math.random() * 16),
    power: Math.floor(3180 + Math.random() * 120),
    fan: Math.floor(4200 + Math.random() * 800),
    chipFreq: Math.floor(580 + Math.random() * 40),
    uptime: Math.floor(12 + Math.random() * 36) * 86400,
    lastShare: Date.now(),
    status: i < 18 ? 'online' : i === 18 ? 'offline' : 'dead',
  }));
}

export const useFleetStore = create((set, get) => ({
  miners: generateFleet(),
  totalHashrate: 312.5e9,
  publicHashrate: 14.9e9,
  fleetPct: 95.4,
  totalPower: 64800,
  efficiency: 5.06,
  avgTemp: 63,
  onlineCount: 18,
  offlineCount: 1,
  deadCount: 1,
  config: { ...FLEET_CONFIG, addresses: ['LhXk7...abc'] },

  ingest: (event) => {
    if (!event) return;

    set((state) => {
      if (event.type === 'telemetry' && event.payload?.miners) {
        // Full telemetry update from simulator or live feed
        const miners = event.payload.miners.map((m, i) => ({
          ...state.miners[i], // preserve fields not in telemetry
          ...m,               // override with fresh telemetry
          rejectRate: m.shares > 0 ? parseFloat(((m.rejected / m.shares) * 100).toFixed(2)) : 0,
        }));

        const online = miners.filter(m => m.status === 'online');
        const totalHR = online.reduce((a, m) => a + m.hashrate, 0) * 1e9;
        const totalPwr = online.reduce((a, m) => a + (m.power || 3260), 0);
        const avgT = online.length ? Math.round(online.reduce((a, m) => a + m.temp, 0) / online.length) : 0;

        return {
          miners,
          totalHashrate: totalHR,
          totalPower: totalPwr,
          efficiency: totalPwr > 0 ? parseFloat(((totalHR / 1e9) / (totalPwr / 1000)).toFixed(2)) : 0,
          avgTemp: avgT,
          onlineCount: online.length,
          offlineCount: miners.filter(m => m.status === 'offline').length,
          deadCount: miners.filter(m => m.status === 'dead').length,
          fleetPct: totalHR > 0 ? parseFloat(((totalHR / (totalHR + 14.9e9)) * 100).toFixed(1)) : 0,
        };
      }

      if (event.type === 'tick') {
        // Legacy Phase 1 compatibility
        const miners = state.miners.map(m => {
          if (m.status === 'dead') return m;
          if (m.status === 'offline') return { ...m, lastShare: m.lastShare + 3000 };
          return {
            ...m,
            hashrate: Math.max(14.5, m.hashrate + (Math.random() - 0.5) * 0.3),
            temp: Math.max(55, Math.min(80, m.temp + Math.floor(Math.random() * 3 - 1))),
            shares: m.shares + Math.floor(Math.random() * 5),
            lastShare: Date.now(),
          };
        });
        const online = miners.filter(m => m.status === 'online');
        return {
          miners,
          totalHashrate: online.reduce((a, m) => a + m.hashrate, 0) * 1e9,
          avgTemp: online.length ? Math.round(online.reduce((a, m) => a + m.temp, 0) / online.length) : 0,
          onlineCount: online.length,
        };
      }

      return {};
    });
  },
}));
