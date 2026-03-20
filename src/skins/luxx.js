// ═══════════════════════════════════════════════════════════
// LUXXPOOL v4.0 — LUXX Skin (Default)
// Brand blue gradient palette, D09 editorial typography
// ═══════════════════════════════════════════════════════════

export const luxx = {
  id: 'luxx',
  name: 'LUXX',

  colors: {
    a1: '#5b9bf0',     // Primary blue (brand extracted)
    a2: '#6ee7b7',     // Success / online green
    a3: '#5DCAA5',     // Fleet teal
    a4: '#818cf8',     // Periwinkle accent (brand CTA)
    a5: '#fbbf24',     // Amber-gold complement
    dim: 'rgba(255,255,255,0.25)',
    br: '#e0e8f0',     // Bright text
    card: '#0c1845',
    bg: '#070e28',
    // Extended LUXX ramp
    luxx50:  '#c7ddf8',
    luxx100: '#93bbf0',
    luxx200: '#5b9bf0',
    luxx300: '#2563c4',
    luxx400: '#1a3480',
    luxx500: '#0f1f5e',
    luxx600: '#0c1845',
    luxx700: '#0a1235',
    luxx800: '#070e28',
    // Semantic
    success: '#6ee7b7',
    warning: '#fbbf24',
    danger:  '#f87171',
    info:    '#93bbf0',
  },

  fonts: {
    display: "'Instrument Serif', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    heading: "'Instrument Serif', Georgia, serif",
    mono: "'JetBrains Mono', monospace",
  },

  // D09 magazine editorial typography tokens
  typography: {
    display: { letterSpacing: '-0.04em', fontWeight: 500, lineHeight: 1 },
    label:   { fontSize: '7px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 },
    value:   { fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: '-0.04em' },
    sub:     { fontSize: '10px', letterSpacing: '-0.01em' },
    micro:   { fontSize: '8px', color: 'rgba(255,255,255,0.15)' },
  },

  // Card styling
  card: {
    background: 'linear-gradient(180deg, #0c1845, #0a1235)',
    border: '0.5px solid rgba(91,155,240,0.1)',
    borderRadius: '12px',
    stripe: 'repeating-linear-gradient(135deg, transparent, transparent 60px, rgba(255,255,255,0.005) 60px, rgba(255,255,255,0.005) 61px)',
  },

  // Grid line styling
  grid: {
    color: 'rgba(91,155,240,0.04)',
    divider: 'rgba(91,155,240,0.06)',
  },

  // Chart defaults
  chart: {
    gridColor: 'rgba(91,155,240,0.04)',
    axisColor: 'rgba(255,255,255,0.15)',
    tooltipBg: 'rgba(12,24,69,0.95)',
    tooltipBorder: 'rgba(91,155,240,0.2)',
  },
};
