export const terminal = {
  id: 'terminal',
  name: 'Terminal',
  colors: {
    a1: '#4a9eff', a2: '#34d399', a3: '#5DCAA5', a4: '#a78bfa', a5: '#fb923c',
    dim: '#2a4a2a', br: '#c0f0c0', card: '#0d120d', bg: '#0a0e0a',
    luxx50: '#c0f0c0', luxx100: '#8ad08a', luxx200: '#34d399', luxx300: '#1a8a5a',
    luxx400: '#0d5a3a', luxx500: '#0a3a2a', luxx600: '#0d120d', luxx700: '#0a0e0a', luxx800: '#080c08',
    success: '#34d399', warning: '#fb923c', danger: '#f87171', info: '#4a9eff',
  },
  fonts: {
    display: "'JetBrains Mono', monospace",
    body: "'JetBrains Mono', monospace",
    heading: "'JetBrains Mono', monospace",
    mono: "'JetBrains Mono', monospace",
  },
  typography: {
    display: { letterSpacing: '0', fontWeight: 700, lineHeight: 1 },
    label:   { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 400 },
    value:   { fontVariantNumeric: 'tabular-nums', fontWeight: 800, letterSpacing: '-0.5px' },
    sub:     { fontSize: '11px', letterSpacing: '0' },
    micro:   { fontSize: '10px', color: '#2a4a2a' },
  },
  card: {
    background: '#0d120d', border: '1px solid #2a4a2a33', borderRadius: '4px',
    stripe: 'none',
  },
  grid: { color: '#2a4a2a22', divider: '#2a4a2a33' },
  chart: { gridColor: '#2a4a2a22', axisColor: '#2a4a2a', tooltipBg: '#111611ee', tooltipBorder: '#2a4a2a66' },
};
