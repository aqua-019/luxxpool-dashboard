# LUXXPOOL Dashboard

**Scrypt Multi-Coin Merged Mining Pool — Public Dashboard**

Live demo of the LUXXPOOL miner-facing dashboard. Built with React + Vite.

## Features

- **Pool Stats** — Live hashrate, active miners, network difficulty, merged mining chain status
- **Connect** — Copy-to-clipboard stratum URLs for pool mining, SSL, and solo mining
- **FAQ & Setup** — Complete guide: wallet setup, hardware requirements, step-by-step miner configuration, merged mining explanation, payout details, troubleshooting
- **Miner Lookup** — Search by Litecoin address to view hashrate, workers, shares, and payment history

## Supported Coins (Scrypt Algorithm)

| Coin | Role | Merged |
|------|------|--------|
| Litecoin (LTC) | Parent Chain | — |
| Dogecoin (DOGE) | Auxiliary | ✓ Auto |
| Bellscoin (BELLS) | Auxiliary | ✓ Auto |
| Luckycoin (LKY) | Auxiliary | ✓ Auto |
| Pepecoin (PEP) | Auxiliary | ✓ Auto |
| Junkcoin (JKC) | Auxiliary | ✓ Auto |
| Dingocoin (DINGO) | Auxiliary | ✓ Auto |
| Shibacoin (SHIC) | Auxiliary | ✓ Auto |
| TrumPOW (TRMP) | Auxiliary | ✓ Auto |
| CraftCoin (CRC) | Auxiliary | ✓ Auto |

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build & Deploy

```bash
npm run build
```

Auto-deploys to GitHub Pages on push to `main` via the included GitHub Actions workflow.

## Tech Stack

- React 18
- Vite 6
- Custom design system (semantic state tokens, GenUI-inspired)
- Zero external UI dependencies

## Design System

The dashboard uses semantic design tokens — components receive **state** not **color**:

```
state.mining  → active work (blue)
state.found   → block discovered (green)
state.warn    → solo/caution (orange)
state.aux     → auxiliary chain (purple)
state.idle    → inactive (gray)
```

Typography: Unbounded (display), IBM Plex Mono (data), DM Sans (body).

---

*LUXXPOOL — Aquatic Mining Operations — Christina Lake, BC, Canada*
