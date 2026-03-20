import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Security Store
// Three-layer security engine state
// ═══════════════════════════════════════════════════════════

export const useSecurityStore = create((set) => ({
  score: 98,
  maxScore: 100,
  activeAlerts: 0,
  bannedIPs: 3,
  peakConnections: 34,

  layers: {
    L1: { name: 'Mining cookies',       status: 'active', description: 'Per-connection HMAC secret. Prevents MitM share hijacking.' },
    L2: { name: 'Share fingerprinting',  status: 'active', description: 'Statistical BWH detection. Share-to-block ratio analysis.' },
    L3: { name: 'Behavioral analysis',   status: 'active', description: 'Real-time anomaly detection: flooding, ntime, vardiff gaming, Sybil.' },
  },

  threatMatrix: [
    { layer: 'L1', vector: 'BiteCoin / WireGhost MitM hijacking',    covered: true },
    { layer: 'L2', vector: 'Block withholding (BWH / FAW / ISM)',     covered: true },
    { layer: 'L3', vector: 'Share flooding / DDoS',                   covered: true },
    { layer: 'L3', vector: 'Ntime manipulation / time-warp',          covered: true },
    { layer: 'L3', vector: 'VarDiff gaming (slow-burst pattern)',     covered: true },
    { layer: 'L3', vector: 'Sybil attack detection',                  covered: true },
    { layer: 'L3', vector: 'Hashrate oscillation / pool hopping',     covered: true },
    { layer: 'L2', vector: 'Infiltrated selfish mining',              covered: true },
  ],

  events: [
    { type: 'SYBIL_SUSPECTED',  ip: '203.0.113.42', detail: '4 addresses from single IP',      action: 'Fleet whitelist', severity: 'medium',   age: 7200 },
    { type: 'SHARE_FLOOD',      ip: '45.33.22.11',  detail: '47 shares/sec (limit: 10)',       action: 'Auto-banned',     severity: 'critical',  age: 21600 },
    { type: 'TIMING_ANOMALY',   ip: '91.120.45.8',  detail: 'CV 0.012 — constant interval',   action: 'Monitoring',      severity: 'low',       age: 86400 },
    { type: 'NTIME_DRIFT',      ip: '78.44.12.90',  detail: 'ntime +340s from server',         action: 'Auto-banned',     severity: 'critical',  age: 172800 },
    { type: 'VARDIFF_GAMING',   ip: '112.33.44.5',  detail: '16x difficulty swing detected',   action: 'Monitoring',      severity: 'medium',    age: 259200 },
    { type: 'BWH_PATTERN',      ip: '91.120.45.8',  detail: '1,847 shares, 0 blocks over 72h', action: 'Flagged',        severity: 'low',       age: 345600 },
  ],

  ingest: (event) => set((state) => {
    switch (event.type) {
      case 'security.event':
        return { events: [event.payload, ...state.events.slice(0, 19)] };
      default:
        return {};
    }
  }),
}));
