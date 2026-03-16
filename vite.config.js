# LUXXPOOL Dashboard v3.0

**Three design skins · Public/Private toggle · Rich charts and metrics**

## Design skins

Switch between three aesthetics via the header toggle:

- **Terminal** — JetBrains Mono, ASCII art, CLI prompts, traffic light dots, blinking cursor
- **Luxury** — Cormorant Garamond at large scale, orange accent line, extreme negative space
- **Zen** — Instrument Serif italic, kanji section headers, vertical orange line, wabi-sabi breathing room

## Features (all skins)

- Public/Private toggle in header
- **Public**: Pool stats, Connect (copy-to-clipboard), Setup guide, Miner lookup
- **Private**: Command center, Security (3-layer), Fleet (20 L9 table with reject% + temp), Connect
- Live-updating hashrate (3s tick)
- SVG sparkline charts (48h hashrate history)
- SVG bar charts (24h share distribution)
- SVG donut charts (fleet/public split, aux block distribution)
- Mini progress bars on aux chain cards
- Per-miner reject rate and temperature columns in fleet table
- Earnings estimates, pool share of network, payout totals

## Quick start

```bash
npm install
npm run dev
```

## Deploy

Push to Vercel — auto-deploys on `main`.

## Tech

- React 18 + Vite 6
- Single App.jsx (710 lines) — three skins, shared data, SVG charts
- Zero external chart libraries — pure SVG
- Google Fonts: JetBrains Mono, Cormorant Garamond, Instrument Serif, Manrope, Noto Serif JP

---

*LUXXPOOL — Aquatic Mining Operations — Christina Lake, BC, Canada*
