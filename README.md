# One Report · prototype

Concept prototype of a national incident reporting portal for virtual asset and payment providers in Ghana, proposed by the Chamber of Digital Assets and Blockchain Innovations (CDABI) to the Cyber Security Authority.

A hacked mobile money issuer, exchange or agent files **one report**. It reaches the Cyber Security Authority (for action) and, by routing rule, the police CID, FIC, Bank of Ghana, SEC, the Attorney-General's Department and others, all at the same moment. Each authority sees only what its mandate allows.

> All names, numbers and wallets are invented. Data stays in the viewer's browser. This is not a live government service.

## What you can try

Start at **`/journeys` ("See it as…")**. Pick one of six roles and the prototype walks you through that person's part of the drill, from what starts it (the hack, an SMS, an escalation email) to the outcome, with a guided bar at the top.

| Journey | Starts with | Screens |
| --- | --- | --- |
| Hacked business | Float reconciliation alarm | `/report` → `/my-case` (follow the case, sign the police report, add evidence) |
| CSA duty officer | SMS: Level 1 case | `/board` → `/register` → `/alerts/GH-FA-0031` |
| Partner officer | Email: handed a part | `/task` (only that authority's fields; the rest is locked) |
| Register approver | Provisional entries to review | `/register` → `/check` |
| OTC vendor or agent | A buyer's message | `/check` → `/receipts` → `/alerts/GH-FA-0031` |
| Head or steering | Escalated to you | `/escalations` → `/steering` |

All routes:

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
