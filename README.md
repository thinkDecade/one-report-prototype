# One Report · prototype

Concept prototype of a national incident reporting portal for virtual asset and payment providers in Ghana, proposed by the Chamber of Digital Assets and Blockchain Innovations (CDABI) to the Cyber Security Authority.

A hacked mobile money issuer, exchange or agent files **one report**. It reaches the Cyber Security Authority (for action) and, by routing rule, the police CID, FIC, Bank of Ghana, SEC, the Attorney-General's Department and others, all at the same moment. Each authority sees only what its mandate allows.

> All names, numbers and wallets are invented. Data stays in the viewer's browser. This is not a live government service.

## What you can try

| Route | Who | What it shows |
| --- | --- | --- |
| `/` | Everyone | Landing page |
| `/report` | Reporting business | Five-step report, evidence fingerprinted in the browser (SHA-256), live routing preview |
| `/board` | Authority officers | Case board: acknowledge, record action, hand on, decline; escalation clocks; register approvals; urgent fraud alerts |
| `/check`, `/alerts`, `/receipts` | OTC vendors, agents | Check register (three answers, never "clean"), receipts, alerts with a look-back warning |
| `/steering` | Steering group | Acknowledgement times and register figures, calculated live |

The **Prototype** button in the corner switches between 14 roles, moves the drill clock forward, or restarts the drill (a ₵1.84m SIM swap theft of agent float, converted to USDT) from 04:31.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Deploys to Vercel with no configuration.

## Built with

Next.js 15, React 19, Tailwind CSS 4, Zustand, Lucide icons. Fonts: Outfit, Geist, IBM Plex Mono.

Source documents: CDABI-GH/VRP/001 (concept paper), VRP/002 (brief), VRP/003 (technical specification).
