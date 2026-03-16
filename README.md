# LUXXPOOL Dashboard

**Scrypt Multi-Coin Merged Mining Pool — Combined Dashboard**

Single-page app with a toggle switch between **Public** (miner-facing, blue accent) and **Private** (operator, red accent) dashboards.

Live: [luxxpool-dashboard.vercel.app](https://luxxpool-dashboard.vercel.app)

## Public dashboard (8 views across 4 tabs)

- **Pool stats** — live hashrate with sparkline, 5 metric cards, 9 aux chain cards, recent blocks feed
- **Connect** — copy-to-clipboard stratum URLs (pool/SSL/solo), worker format, merged mining info
- **Setup guide** — 5 collapsible FAQ sections: wallet, hardware, miner config, payouts, troubleshooting
- **Miner lookup** — search by Litecoin address, view hashrate/workers/shares/payments

## Private dashboard (4 tabs)

- **Command** — fleet vs public hashrate split, 8 metric cards, aux chain status, block event feed
- **Security** — 3-layer engine status (cookies/fingerprinting/anomaly), 8-vector threat model, recent events
- **Fleet** — 20 L9 worker table with per-miner stats, fleet config display, whitelist management
- **Connect** — all 4 endpoints with port status

## Toggle

Click the **Public/Private** pill in the header to switch. Blue = public, red = private.

## Quick start

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

Auto-deploys to Vercel on push to `main`.

## Tech

- React 18 + Vite 6
- Single `App.jsx` — both dashboards, shared components, zero dependencies
- Semantic state tokens (mining/found/warn/idle/aux/alert/fleet)
- Live-updating simulated data (3-second tick)

---

*LUXXPOOL — Aquatic Mining Operations — Christina Lake, BC, Canada*
