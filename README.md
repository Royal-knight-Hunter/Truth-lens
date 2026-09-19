# Truth Lens 🔍

> AI-assisted claim verification and misinformation triage platform built for rapid hackathon deployment.

**Hackathon ID:** AZIS-T22ZVX

---

## 🌐 Public Live Demo URL

> _Placeholder — deploy via `vercel --prod` and paste URL here._  
> `https://truth-lens.vercel.app`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | In-memory store (better-sqlite3 ready) |
| Deployment | Vercel CLI |
| Utilities | `date-fns`, `clsx`, `tailwind-merge` |

---

## ✅ Features Implemented

1. **Submit Claim Form** — Submit claims with platform, category, and an optional source URL.
2. **Risk Flag Engine** — Automatically evaluates submitted text for `Sensational`, `Shouting`, `Unsourced`, and composite `High Risk` flags.
3. **Public Feed** — Filterable claims feed sorted by High-Risk first, then recency. Supports filtering by Category and Status.
4. **Detail View Modal** — Full claim detail including triggered flags, platform badge, ISO timestamp, and reviewer notes.
5. **Review Workflow** — Open admin panel (no auth required) to set claim status (`Verified True` / `Verified False` / `Misleading`) with a reviewer note.
6. **Status Badges** — Color-coded badges for `Unverified`, `Verified True`, `Verified False`, and `Misleading`.

---

## 🚀 Local Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd truth-lens

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel --prod
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── claims/
│   │       ├── route.ts          # GET /api/claims, POST /api/claims
│   │       └── [id]/route.ts     # PATCH /api/claims/:id
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main dashboard UI
└── lib/
    ├── db.ts                     # In-memory data store + seed data
    └── riskEngine.ts             # Risk flag evaluation logic
```

---

## 📄 Decision Log

See [`DECISIONS.md`](./DECISIONS.md) for architectural decisions made during the hackathon.

---

## ⚠️ Notes

- The in-memory store resets on server restart. For persistence, swap `lib/db.ts` for a `better-sqlite3` or Prisma implementation.
- No authentication is required — this is intentional for hackathon speed; see `DECISIONS.md` DP2/DP3.
