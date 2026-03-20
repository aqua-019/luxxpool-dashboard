import { lazy } from 'react';
import { COMPONENT_REGISTRY } from '../utils/constants';
import { getComponentPriority } from './template';

// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Pipeline Step 4: RENDER GENERATE
// Lazy-loaded component registry + data binding per component
// ═══════════════════════════════════════════════════════════

// ── Component Registry: ID → lazy-loaded React component ──
// Phase 1: All components are stubs
// Phase 2: Each stub gets replaced with the full production component

const C = {
  1:  lazy(() => import('../components/01-KPICommandStrip')),
  2:  lazy(() => import('../components/02-HashrateChart')),
  3:  lazy(() => import('../components/03-FleetMatrix')),
  4:  lazy(() => import('../components/04-MergedEarnings')),
  5:  lazy(() => import('../components/05-RevenueComposition')),
  6:  lazy(() => import('../components/06-PoolGaugeNetwork')),
  7:  lazy(() => import('../components/07-ShareHeatmap')),
  8:  lazy(() => import('../components/08-PaymentLedger')),
  9:  lazy(() => import('../components/09-AuxPoWArchitecture')),
  10: lazy(() => import('../components/10-HashrateHistogram')),
  11: lazy(() => import('../components/11-BlockTimeline')),
  12: lazy(() => import('../components/12-DualDifficulty')),
  13: lazy(() => import('../components/13-GlassmorphismHero')),
  14: lazy(() => import('../components/14-DataPipeline')),
  15: lazy(() => import('../components/15-SkeletonLoading')),
  16: lazy(() => import('../components/16-NetworkTopology')),
  17: lazy(() => import('../components/17-SecurityEngine')),
  18: lazy(() => import('../components/18-ProfitabilityModel')),
  19: lazy(() => import('../components/19-ColorSystem')),
  20: lazy(() => import('../components/20-TechStack')),
  21: lazy(() => import('../components/21-LiveCounters')),
  22: lazy(() => import('../components/22-MiningCalculator')),
  23: lazy(() => import('../components/23-LuckTracker')),
  24: lazy(() => import('../components/24-OperatorPanel')),
  25: lazy(() => import('../components/25-VardiffDistribution')),
  26: lazy(() => import('../components/26-GrowthTiers')),
  27: lazy(() => import('../components/27-NavigationShell')),
  28: lazy(() => import('../components/28-ResponsiveDemo')),
  29: lazy(() => import('../components/29-VersionTimeline')),
  30: lazy(() => import('../components/30-DashboardComposite')),
  31: lazy(() => import('../components/31-WatcherLink')),
  32: lazy(() => import('../components/32-StratumConfig')),
  33: lazy(() => import('../components/33-WorkerSparklines')),
  34: lazy(() => import('../components/34-PoolSettings')),
  35: lazy(() => import('../components/35-APIAccess')),
  36: lazy(() => import('../components/36-EmulationSuite')),
  37: lazy(() => import('../components/37-UXCopySystem')),
  38: lazy(() => import('../components/38-PlatformCompat')),
  39: lazy(() => import('../components/39-GenUIPipeline')),
  40: lazy(() => import('../components/40-ComponentRegistry')),
};

// ── Data Binding Map: component ID → props extractor ──
// Each function takes derived state and returns the props for that component.

const BINDINGS = {
  1: (d) => ({
    hashrate: d.hashrate, workers: d.workers, shares: d.shares,
    earnings: d.earnings, blocks: d.blocks, network: d.network,
    history: d.history, uptime: d.uptime, anomalies: d.anomalies,
  }),
  2: (d) => ({
    hashrate: d.hashrate, history: d.history.hr,
  }),
  3: (d) => ({
    fleet: d.fleet, anomalies: d.anomalies,
  }),
  4: (d) => ({
    earnings: d.earnings, network: d.network,
  }),
  5: (d) => ({
    earnings: d.earnings, history: d.history,
  }),
  6: (d) => ({
    hashrate: d.hashrate, network: d.network, blocks: d.blocks,
  }),
  7: (d) => ({
    shares: d.shares, anomalies: d.anomalies, history: d.history.shares,
  }),
  8: (d) => ({
    earnings: d.earnings, payments: d.payments,
  }),
  9: (d) => ({
    network: d.network,
  }),
  10: (d) => ({
    fleet: d.fleet,
  }),
  11: (d) => ({
    blocks: d.blocks,
  }),
  12: (d) => ({
    network: d.network, history: d.history,
  }),
  13: (d) => ({
    hashrate: d.hashrate, blocks: d.blocks, earnings: d.earnings,
    workers: d.workers, network: d.network,
  }),
  14: (d) => ({
    // Pipeline metrics — populated from getConnectionState() in Phase 3
  }),
  15: (d) => ({}), // Pure UI, no data
  16: (d) => ({
    fleet: d.fleet, workers: d.workers,
  }),
  17: (d) => ({
    security: d.security,
  }),
  18: (d) => ({
    earnings: d.earnings, network: d.network, fleet: d.fleet,
  }),
  19: (d) => ({}), // Static reference
  20: (d) => ({}), // Static reference
  21: (d) => ({
    shares: d.shares, blocks: d.blocks, earnings: d.earnings,
  }),
  22: (d) => ({
    hashrate: d.hashrate, network: d.network, earnings: d.earnings,
  }),
  23: (d) => ({
    blocks: d.blocks,
  }),
  24: (d) => ({
    fleet: d.fleet, earnings: d.earnings, anomalies: d.anomalies,
  }),
  25: (d) => ({
    shares: d.shares,
  }),
  26: (d) => ({
    workers: d.workers,
  }),
  27: (d) => ({}), // Shell — gets props directly
  28: (d) => ({}), // Dev reference
  29: (d) => ({}), // Static
  30: (d) => ({}), // Composite — renders via pipeline
  31: (d) => ({}), // User action
  32: (d) => ({
    network: d.network,
  }),
  33: (d) => ({
    fleet: d.fleet,
  }),
  34: (d) => ({
    network: d.network, earnings: d.earnings,
  }),
  35: (d) => ({}), // Static + connection status
  36: (d) => ({}), // Dev reference
  37: (d) => ({}), // Dev reference
  38: (d) => ({}), // Device detection
  39: (d) => ({}), // Pipeline metrics
  40: (d) => ({}), // Registry index
};

/**
 * Generate the component render list from template IDs + derived state.
 *
 * @param {number[]} templateIds - from selectTemplates()
 * @param {Object} derived - from deriveState()
 * @returns {Array<{ id, Component, props, priority }>}
 */
export function renderComponents(templateIds, derived) {
  return templateIds
    .map(id => {
      const Component = C[id];
      if (!Component) return null;

      const bindFn = BINDINGS[id] || (() => ({}));
      const props = bindFn(derived);
      const priority = getComponentPriority(id, derived);
      const meta = COMPONENT_REGISTRY[id] || {};

      return { id, Component, props, priority, meta };
    })
    .filter(Boolean)
    .sort((a, b) => a.priority - b.priority);
}
