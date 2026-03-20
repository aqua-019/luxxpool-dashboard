// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Constants
// Coin definitions, default data, pipeline configuration
// ═══════════════════════════════════════════════════════════

export const COINS = [
  { symbol: 'LTC',   name: 'Litecoin',  hue: 215, role: 'parent', slot: null, active: true,  blockTime: 150,  reward: '6.25',    color: '#5b9bf0' },
  { symbol: 'DOGE',  name: 'Dogecoin',  hue: 45,  role: 'aux',    slot: 0,    active: true,  blockTime: 60,   reward: '10,000',  color: '#fbbf24' },
  { symbol: 'BELLS', name: 'Bells',     hue: 260, role: 'aux',    slot: 1,    active: true,  blockTime: 60,   reward: 'Random',  color: '#818cf8' },
  { symbol: 'LKY',   name: 'Luckycoin', hue: 185, role: 'aux',    slot: 2,    active: true,  blockTime: 60,   reward: 'Halving', color: '#22d3ee' },
  { symbol: 'PEP',   name: 'Pepecoin',  hue: 330, role: 'aux',    slot: 3,    active: true,  blockTime: 60,   reward: 'Halving', color: '#f472b6' },
  { symbol: 'DINGO', name: 'Dingo',     hue: 90,  role: 'aux',    slot: 4,    active: true,  blockTime: 60,   reward: 'Variable', color: '#a3e635' },
  { symbol: 'SHIC',  name: 'ShiaCoin',  hue: 170, role: 'aux',    slot: 5,    active: true,  blockTime: 60,   reward: 'Halving', color: '#2dd4bf' },
  { symbol: 'JKC',   name: 'JunkCoin',  hue: 25,  role: 'aux',    slot: 6,    active: false, blockTime: 60,   reward: 'Halving', color: '#fb923c' },
  { symbol: 'TRMP',  name: 'Trumpcoin', hue: 350, role: 'aux',    slot: 7,    active: false, blockTime: 60,   reward: 'Halving', color: '#fb7185' },
  { symbol: 'CRC',   name: 'CrowCoin',  hue: 280, role: 'aux',    slot: 8,    active: false, blockTime: 60,   reward: 'Halving', color: '#c084fc' },
];

export const ACTIVE_COINS = COINS.filter(c => c.active);
export const AUX_COINS = COINS.filter(c => c.role === 'aux' && c.active);

// Fleet hardware constants
export const FLEET_CONFIG = {
  facility: 'Christina Lake, BC, Canada',
  model: 'Antminer L9',
  count: 20,
  nameplateGHs: 16.25,
  powerPerUnit: 3260, // watts
  capacity: 100,
  ipWhitelist: ['203.0.113.0/24'],
  feeClass: 0,
  securityBypass: true,
};

// Pipeline timing constants
export const PIPELINE_CONFIG = {
  wsFlushInterval: 1000,     // 1s ring buffer flush
  restPollIntervals: {
    poolStats: 10000,        // 10s
    networkInfo: 30000,      // 30s
    coinPrices: 60000,       // 60s
    fleetTelemetry: 5000,    // 5s
  },
  mockTickInterval: 3000,    // 3s for Phase 1 mock data
  historyLengths: {
    hashrate: 72,            // 72 data points
    shares: 24,
    miners: 24,
    difficulty: 30,
    blockTime: 20,
  },
};

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile:  { max: 767,  cols: 2, gap: 6,  pad: 12, fontSize: 0.85, chartH: 120 },
  tablet:  { min: 768,  max: 1199, cols: 3, gap: 8,  pad: 20, fontSize: 0.92, chartH: 180 },
  desktop: { min: 1200, max: 1599, cols: 5, gap: 12, pad: 32, fontSize: 1.0,  chartH: 260 },
  wide:    { min: 1600, cols: 6, gap: 12, pad: 32, fontSize: 1.0,  chartH: 300 },
};

// Component registry: ID → metadata
export const COMPONENT_REGISTRY = {
  1:  { name: 'KPI Command Strip',      scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  2:  { name: 'Hashrate Chart',          scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  3:  { name: 'Fleet Matrix',            scope: 'private', tier: 'above-fold',  span: { mobile: [2,2], tablet: [3,2], desktop: [5,2], wide: [6,2] } },
  4:  { name: 'Merged Earnings Matrix',  scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  5:  { name: 'Revenue Composition',     scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [2,1], desktop: [3,1], wide: [4,1] } },
  6:  { name: 'Pool Gauge + Network',    scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [1,1], desktop: [2,1], wide: [2,1] } },
  7:  { name: 'Share Heatmap',           scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  8:  { name: 'Payment Ledger',          scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  9:  { name: 'AuxPoW Architecture',     scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  10: { name: 'Hashrate Histogram',      scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [1,1], desktop: [2,1], wide: [3,1] } },
  11: { name: 'Block Timeline',          scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  12: { name: 'Dual Difficulty',         scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  13: { name: 'Glassmorphism Hero',      scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  14: { name: 'Data Pipeline',           scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  15: { name: 'Skeleton Loading',        scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  16: { name: 'Network Topology',        scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  17: { name: 'Security Engine',         scope: 'private', tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  18: { name: 'Profitability Model',     scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  19: { name: 'Color System',            scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  20: { name: 'Tech Stack',             scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  21: { name: 'Live Counters',           scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  22: { name: 'Mining Calculator',       scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  23: { name: 'Luck Tracker',            scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  24: { name: 'Operator Panel',          scope: 'private', tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  25: { name: 'Vardiff Distribution',    scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [1,1], desktop: [2,1], wide: [3,1] } },
  26: { name: 'Growth Tiers',            scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  27: { name: 'Navigation Shell',        scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  28: { name: 'Responsive Demo',         scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  29: { name: 'Version Timeline',        scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  30: { name: 'Dashboard Composite',     scope: 'both',    tier: 'critical',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  31: { name: 'Watcher Link',            scope: 'public',  tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  32: { name: 'Stratum Config',          scope: 'both',    tier: 'above-fold',  span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  33: { name: 'Worker Sparklines',       scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  34: { name: 'Pool Settings',           scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  35: { name: 'API Access',             scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  36: { name: 'Emulation Suite',         scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  37: { name: 'UX Copy System',          scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  38: { name: 'Platform Compat',         scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  39: { name: 'GenUI Pipeline',          scope: 'private', tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
  40: { name: 'Component Registry',      scope: 'both',    tier: 'deferred',    span: { mobile: [2,1], tablet: [3,1], desktop: [5,1], wide: [6,1] } },
};

// View → template mappings for Step 3
export const VIEW_TEMPLATES = {
  'pub.stats':   [1, 2, 5, 6, 11, 12, 21, 23],
  'pub.connect': [32, 31, 9, 22],
  'pub.guide':   [38],
  'pub.lookup':  [1, 2, 4],
  'prv.command': [1, 2, 4, 5, 6, 11, 13, 21, 24],
  'prv.security':[17, 7, 16],
  'prv.fleet':   [3, 10, 24, 25, 33],
  'prv.connect': [14, 32, 35, 34],
  'prv.ops':     [18, 22, 26, 29, 36],
};
