import { ema, movingAverage, standardDeviation, linearRegression, detectAnomaly, clamp } from '../utils/math';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 2: STATE DERIVE
// Transforms raw store data into computed state + UI hints
// This is where the "generative" intelligence lives
// ═══════════════════════════════════════════════════════════

/**
 * Derive computed state from all stores.
 * Called via useMemo in App.jsx whenever stores update.
 *
 * @param {Object} raw - { pool, fleet, network, security }
 * @returns {Object} derived state with UI generation hints
 */
export function deriveState({ pool, fleet, network, security }) {
  // ── Hashrate derivations ──
  const hrHistory = pool.hrHistory || [];
  const avg24h = movingAverage(hrHistory, 24);
  const stdDev = standardDeviation(hrHistory);
  const trend = linearRegression(hrHistory.slice(-12));
  const gap = pool.reported > 0 ? ((pool.reported - pool.hashrate) / pool.reported) * 100 : 0;

  const hashrate = {
    effective: pool.hashrate,
    reported: pool.reported,
    scoring: pool.scoring,
    avg24h: avg24h * 1e9,
    stdDev: stdDev * 1e9,
    gap,
    trend: trend.slope,
    trendDirection: trend.slope > 0.5 ? 'up' : trend.slope < -0.5 ? 'down' : 'stable',
    range: {
      min: Math.min(...hrHistory) * 1e9,
      max: Math.max(...hrHistory) * 1e9,
    },
  };

  // ── Share metrics ──
  const shares = {
    rate: pool.shareRate,
    acceptRate: pool.acceptRate,
    staleRate: pool.staleRate,
    rejectRate: pool.rejectRate,
    vardiffAvg: pool.vardiffAvg,
    totalSession: pool.shareHistory?.reduce((a, b) => a + b, 0) || 0,
    history: pool.shareHistory || [],
  };

  // ── Worker / fleet metrics ──
  const workers = {
    total: pool.miners,
    workerCount: pool.workers,
    fleet: {
      count: fleet.onlineCount + fleet.offlineCount + fleet.deadCount,
      online: fleet.onlineCount,
      offline: fleet.offlineCount,
      dead: fleet.deadCount,
      hashrate: fleet.totalHashrate,
      pct: fleet.fleetPct,
      power: fleet.totalPower,
      efficiency: fleet.efficiency,
      avgTemp: fleet.avgTemp,
    },
    publicMiners: pool.miners - fleet.miners?.length || 0,
  };

  // ── Earnings ──
  const earnings = {
    daily: pool.dailyRevenue,
    ltcBalance: pool.ltcBalance,
    dogeBalance: pool.dogeBalance,
    ltcPending: pool.ltcPending,
    ltcConfirmed: pool.ltcConfirmed,
    ppsRatio: pool.ppsRatio,
    lifetimePaid: pool.lifetimePaid,
    payoutsPending: pool.payoutsPending,
    payoutsTotal: pool.payoutsTotal,
    payoutCount: pool.payoutCount,
  };

  // ── Block metrics ──
  const blocks = {
    ltc: pool.blocksLTC,
    aux: pool.blocksAux,
    total: pool.blocksTotal,
    lastBlockAge: pool.lastBlockAge,
    history: pool.blocks || [],
    luckLTC: pool.luckLTC,
    luckDOGE: pool.luckDOGE,
    avgBlockTime: pool.avgBlockTime,
  };

  // ── Network ──
  const networkData = {
    ltcDifficulty: network.ltcDifficulty,
    ltcHeight: network.ltcHeight,
    ltcNetHashrate: network.ltcNetHashrate,
    ltcPrice: network.ltcPrice,
    ltcPoolShare: network.ltcPoolShare,
    dogeDifficulty: network.dogeDifficulty,
    dogeHeight: network.dogeHeight,
    dogePrice: network.dogePrice,
    ltcDiffHistory: network.ltcDiffHistory || [],
    dogeDiffHistory: network.dogeDiffHistory || [],
    auxChains: network.auxChains || {},
    fee: network.fee,
    soloFee: network.soloFee,
    luck: network.luck,
  };

  // ── Anomaly detection ──
  const anomalies = {
    hashrateLow: hrHistory.length > 5 && detectAnomaly(hrHistory[hrHistory.length - 1], hrHistory, 2),
    workerDown: (fleet.miners || []).filter(m => m.status !== 'online'),
    tempAlert: (fleet.miners || []).filter(m => m.temp > 75),
    rejectSpike: pool.rejectRate > 1.0,
    shareDip: pool.shareRate < 1500,
    count: 0, // computed below
  };
  anomalies.count = (anomalies.hashrateLow ? 1 : 0) +
    anomalies.workerDown.length +
    anomalies.tempAlert.length +
    (anomalies.rejectSpike ? 1 : 0);

  // ── Threshold states ──
  const thresholds = {
    ltcPayout: pool.ltcBalance >= 0.5,
    dogePayout: pool.dogeBalance >= 500,
    capacityWarn: pool.miners > 85,
    thermalWarn: anomalies.tempAlert.length > 0,
    rejectWarn: pool.rejectRate > 1.0,
  };

  // ── UI Generation Hints (the "generative" part) ──
  const uiHints = {
    // Urgency: 0-1, drives animation speed / attention
    urgency: clamp(anomalies.count / 5, 0, 1),

    // Density preference based on data volume
    density: pool.miners > 50 ? 'dense' : pool.miners > 10 ? 'normal' : 'sparse',

    // Focus: which component should be emphasized
    focus: pool.lastBlockAge < 60 ? 'blocks' :
           anomalies.workerDown.length > 0 ? 'fleet' :
           anomalies.rejectSpike ? 'shares' : 'hashrate',

    // Fresh block celebration flag
    freshBlock: pool.lastBlockAge < 60,

    // Active alert queue
    alerts: [
      ...anomalies.workerDown.map(w => ({
        type: w.status === 'dead' ? 'critical' : 'warning',
        message: `${w.id} ${w.status}`,
        component: 24,
      })),
      ...(anomalies.rejectSpike ? [{ type: 'warning', message: 'Reject rate elevated', component: 7 }] : []),
      ...(anomalies.hashrateLow ? [{ type: 'warning', message: 'Hashrate anomaly detected', component: 2 }] : []),
    ],
  };

  // ── Security ──
  const securityData = {
    score: security.score,
    maxScore: security.maxScore,
    activeAlerts: security.activeAlerts,
    bannedIPs: security.bannedIPs,
    peakConnections: security.peakConnections,
    layers: security.layers,
    threatMatrix: security.threatMatrix,
    events: security.events || [],
  };

  // ── Payments ──
  const payments = pool.payments || [];

  // ── History arrays for charts ──
  const history = {
    hr: pool.hrHistory || [],
    shares: pool.shareHistory || [],
    miners: pool.minerHistory || [],
    ltcDiff: network.ltcDiffHistory || [],
    dogeDiff: network.dogeDiffHistory || [],
  };

  // ── Uptime ──
  const uptime = pool.uptime || 0;

  return {
    hashrate, shares, workers, earnings, blocks,
    network: networkData, anomalies, thresholds, uiHints,
    security: securityData, payments, history, uptime,
    fleet: { miners: fleet.miners || [], ...workers.fleet, config: fleet.config },
  };
}
