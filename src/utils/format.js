// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Format Utilities
// Display formatting for all metric types
// ═══════════════════════════════════════════════════════════

/** Format hashrate with auto-scaling units */
export function fmtHash(h) {
  if (h >= 1e15) return (h / 1e15).toFixed(2) + ' PH/s';
  if (h >= 1e12) return (h / 1e12).toFixed(2) + ' TH/s';
  if (h >= 1e9)  return (h / 1e9).toFixed(1) + ' GH/s';
  if (h >= 1e6)  return (h / 1e6).toFixed(1) + ' MH/s';
  if (h >= 1e3)  return (h / 1e3).toFixed(1) + ' KH/s';
  return Math.round(h) + ' H/s';
}

/** Format hashrate in GH/s only (for fleet display) */
export function fmtGH(h) {
  return (h / 1e9).toFixed(2);
}

/** Format large numbers with commas */
export function fmtNum(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString();
}

/** Format compact numbers (1.2K, 3.4M) */
export function fmtCompact(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(Math.round(n));
}

/** Format percentage */
export function fmtPct(value, decimals = 1) {
  if (value == null) return '—';
  return value.toFixed(decimals) + '%';
}

/** Format USD currency */
export function fmtUSD(value, decimals = 2) {
  if (value == null) return '—';
  return '$' + Number(value).toFixed(decimals);
}

/** Format crypto amount */
export function fmtCrypto(value, symbol, decimals = 4) {
  if (value == null) return '—';
  return Number(value).toFixed(decimals) + ' ' + symbol;
}

/** Format time ago from seconds */
export function fmtAgo(seconds) {
  if (seconds < 60) return Math.round(seconds) + 's ago';
  if (seconds < 3600) return Math.round(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.round(seconds / 3600) + 'h ago';
  return Math.round(seconds / 86400) + 'd ago';
}

/** Format duration (uptime) */
export function fmtDuration(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  if (d > 0) return d + 'd ' + h + 'h';
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm ' + Math.floor(seconds % 60) + 's';
}

/** Format temperature with color hint */
export function fmtTemp(celsius) {
  return celsius + '°C';
}

/** Format power in watts/kilowatts */
export function fmtPower(watts) {
  if (watts >= 1000) return (watts / 1000).toFixed(1) + ' kW';
  return watts + ' W';
}
