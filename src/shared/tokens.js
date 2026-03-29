// ═══════════════════════════════════════════════════════════
// LUXXPOOL v5.0 — Semantic Token System
// Intent-driven tokens: state.mining means "active work happening"
// The color is the outcome of that intent, not an arbitrary palette pick
// ═══════════════════════════════════════════════════════════

export const TOKENS = {
  // Semantic state tokens — encode pool/miner conditions
  state: {
    mining:   { bg: '#0d2847', fg: '#4a9eff', glow: 'rgba(74,158,255,0.12)',  border: 'rgba(74,158,255,0.2)'  },
    found:    { bg: '#0d3521', fg: '#34d399', glow: 'rgba(52,211,153,0.15)',  border: 'rgba(52,211,153,0.3)'  },
    orphaned: { bg: '#3b1320', fg: '#f87171', glow: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.2)' },
    alert:    { bg: '#3b2010', fg: '#fb923c', glow: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.2)'  },
    idle:     { bg: '#141a24', fg: '#94a3b8', glow: 'transparent',            border: 'rgba(71,85,105,0.15)'  },
    aux:      { bg: '#1a1535', fg: '#a78bfa', glow: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.2)' },
  },

  // Surface tokens — layered depth system
  surface: {
    base:    '#070e28',
    raised:  '#0e1420',
    card:    '#121a28',
    hover:   '#182030',
    overlay: 'rgba(7,14,40,0.95)',
  },

  // Text tokens
  text: {
    primary:   '#e0e8f0',
    secondary: 'rgba(255,255,255,0.55)',
    dim:       'rgba(255,255,255,0.25)',
    inverse:   '#070e28',
  },

  // Brand colors
  brand: {
    primary:   '#5b9bf0',
    secondary: '#818cf8',
    gold:      '#fbbf24',
    teal:      '#5DCAA5',
    success:   '#6ee7b7',
    warning:   '#fbbf24',
    danger:    '#f87171',
    info:      '#93bbf0',
  },

  // Spacing scale (px)
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },

  // Border radius scale (px)
  radius: { sm: 4, md: 8, lg: 12, xl: 16 },

  // Font stack
  fonts: {
    display: "'Unbounded', system-ui, sans-serif",
    body:    "'DM Sans', system-ui, sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

  // Typography presets
  typography: {
    display: { letterSpacing: '-0.04em', fontWeight: 600, lineHeight: 1 },
    heading: { letterSpacing: '-0.02em', fontWeight: 500, lineHeight: 1.2 },
    label:   { fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 },
    value:   { fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: '-0.02em' },
    body:    { fontSize: 14, lineHeight: 1.5, fontWeight: 400 },
    caption: { fontSize: 12, lineHeight: 1.4 },
    micro:   { fontSize: 10 },
  },

  // Card styling
  card: {
    background: 'linear-gradient(180deg, #0f1a2e, #0a1225)',
    border: '1px solid rgba(91,155,240,0.08)',
    borderRadius: 12,
  },
};

/** Get state token by condition */
export function getStateToken(condition) {
  return TOKENS.state[condition] || TOKENS.state.idle;
}

/** Helper: card base styles */
export function cardStyle(mobile) {
  return {
    background: TOKENS.card.background,
    border: TOKENS.card.border,
    borderRadius: TOKENS.card.borderRadius,
    padding: mobile ? '12px 14px' : '16px 20px',
  };
}
