# LUXXPOOL Dashboard v3.1

**Full-width responsive · Adaptive viewport · Three design skins · Dense metrics**

## Features

- **Three skins**: Terminal / Luxury / Zen — switch via header toggle
- **Public/Private toggle** on every skin
- **Adaptive viewport**: detects screen size, adapts grid columns, padding, font size, chart dimensions
- **Mobile-first**: 2-column grids on mobile, 3 on tablet, 5-6 on desktop, all elements scale
- **Full-width**: no max-width constraints, content fills the browser
- **200%+ metrics**: 12 metric cards per view, 6 chart types, expanded fleet table (8 columns)

## Views (8 total × 3 skins = 24 unique layouts)

### Public
- **Pool stats**: 12 metrics, 72h hashrate sparkline, 24h share bars, 24h miner count, 30d difficulty chart, 6 aux chain cards with hash/reward/progress bars, 8-row block history table
- **Connect**: pool/SSL/solo stratum URLs with copy, worker format, difficulty/VarDiff info, solo probability calculator, merged mining coin list
- **Setup guide**: 7 expandable sections in 2-column layout — wallet, hardware, config, merged mining, pool vs solo, payouts, troubleshooting
- **Miner lookup**: 12 result metrics — hashrate, workers, shares, accepted, pending, paid, reject rate, stale, best share, avg difficulty, DOGE earned

### Private
- **Command**: 12 metrics, 72h hashrate chart, fleet/public donut with power/efficiency, aux chain status with progress bars, block event feed, recent payments table
- **Security**: 5 security metrics with score bar, 3 detailed security layer cards, 8-vector threat matrix, 6-entry security event log with severity coloring
- **Fleet**: 6 fleet metrics with capacity bar, 20-miner table (8 columns: worker, hashrate, shares, reject%, temp, power, chip freq, health bar), fleet config with API endpoints, temperature donut with distribution
- **Connect**: 5 copy-to-clipboard endpoints, 4 endpoint status cards, 4 network metrics (bandwidth, latency, API requests, peak connections)

## Responsive breakpoints

| Width | Layout | Columns | Padding |
|---|---|---|---|
| < 768px | Mobile | 2 | 12px |
| 768-1199px | Tablet | 3 | 20px |
| 1200-1599px | Desktop | 5 | 32px |
| 1600px+ | Wide | 6 | 32px |

## Deploy

```bash
npm install && npm run dev    # local
npm run build                 # production
```

Push to Vercel for auto-deploy.

---

*LUXXPOOL — Aquatic Mining Operations — Christina Lake, BC, Canada*
