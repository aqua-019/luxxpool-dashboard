// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — Math Utilities
// Statistical functions for the derive pipeline
// ═══════════════════════════════════════════════════════════

/** Exponential Moving Average */
export function ema(prev, current, alpha = 0.08) {
  if (prev == null) return current;
  return prev * (1 - alpha) + current * alpha;
}

/** Simple Moving Average over an array */
export function movingAverage(data, window) {
  if (!data || data.length === 0) return 0;
  const slice = data.slice(-window);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/** Standard Deviation */
export function standardDeviation(data) {
  if (!data || data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/** Linear Regression — returns { slope, intercept, r2 } */
export function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += data[i]; sumXY += i * data[i]; sumX2 += i * i; sumY2 += data[i] * data[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const ssRes = data.reduce((s, v, i) => s + Math.pow(v - (slope * i + intercept), 2), 0);
  const ssTot = data.reduce((s, v) => s + Math.pow(v - sumY / n, 2), 0);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  return { slope, intercept, r2 };
}

/** Anomaly detection: returns true if value exceeds sigmas from rolling mean */
export function detectAnomaly(value, history, sigmas = 2) {
  if (!history || history.length < 5) return false;
  const mean = movingAverage(history, history.length);
  const std = standardDeviation(history);
  if (std === 0) return false;
  return Math.abs(value - mean) > sigmas * std;
}

/** Clamp a number between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Percentage with bounds */
export function pct(value, total, decimals = 1) {
  if (!total) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
}
