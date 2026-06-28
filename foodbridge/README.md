# 🌉 FoodBridge

> **AI-Powered Food Waste Redistribution Platform**  
> Tech for Tomorrow Hackathon · SDG 2 (Zero Hunger) · SDG 12 (Responsible Consumption)

FoodBridge connects food donors (restaurants, hostels, events) with nearby NGOs and shelters through an AI-driven pipeline that predicts surplus, assesses food quality with Gemini Vision, scores donations for safety, and auto-generates optimal pickup routes.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   Next.js 14 (App Router)  ·  Tailwind CSS  ·  shadcn/ui    │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTPS / REST / WebSocket
┌─────────────────────▼────────────────────────────────────────┐
│                        API LAYER                             │
│            Node.js + Express  (REST API)                     │
│   /api/v1/donations  /api/v1/ai  /api/v1/match               │
│   /api/v1/routes     /api/v1/deliveries                      │
└───┬─────────────────┬───────────────────┬────────────────────┘
    │                 │                   │
    ▼                 ▼                   ▼
┌──────────┐  ┌──────────────┐  ┌───────────────────┐
│ Supabase │  │  AI Services │  │  External APIs    │
│ Postgres │  │  Gemini 1.5  │  │  Google Maps      │
│ Auth     │  │  Pro/Flash   │  │  OpenWeatherMap   │
│ Storage  │  └──────────────┘  │  Firebase FCM     │
│ Realtime │                    └───────────────────┘
└──────────┘
    │
    ▼
┌───────────────────┐
│  n8n (Automation) │
│  Webhook triggers │
└───────────────────┘
```

---

## Monorepo Structure

```
foodbridge/
├── apps/
│   ├── web/          ← Next.js 14 (App Router), Tailwind, shadcn/ui
│   └── api/          ← Node.js + Express backend
├── packages/
│   └── shared/       ← Shared Zod schemas and TypeScript types
├── .env.example      ← All required environment variables
├── turbo.json        ← Turborepo pipeline
└── README.md
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 14 |
| Styling | Tailwind CSS | 3.4 |
| Components | shadcn/ui | Latest |
| State | TanStack React Query + Zustand | 5 + 4 |
| Maps | Leaflet / react-leaflet | 4 |
| Real-time | Socket.io-client | 4 |
| Backend | Node.js + Express | 20 LTS + 4 |
| ORM | Prisma | 5 |
| Validation | Zod | 3 |
| Database | Supabase (PostgreSQL 15) | — |
| AI | Google Gemini 1.5 Pro/Flash | — |
| Maps API | Google Maps Directions + Distance Matrix | — |
| Notifications | Firebase Cloud Messaging | — |
| Automation | n8n | — |
| Deployment | Vercel (web) + Railway (api) | — |

---

## Quick Start

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Supabase project (free tier works)
- Google Cloud project with Gemini API + Maps API enabled
- Firebase project for push notifications

### 1. Clone & Install

```bash
git clone https://github.com/your-org/foodbridge.git
cd foodbridge
npm install
```

### 2. Configure Environment Variables

```bash
# Copy examples
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Fill in all values — see Environment Variables section below
```

### 3. Database Setup

```bash
# Apply Prisma schema to Supabase
cd apps/api
npm run db:push

# Seed with demo data (5 donors, 3 NGOs, 2 volunteers)
npm run db:seed
```

### 4. Run Development Servers

```bash
# From root — starts both web (port 3000) and api (port 4000)
npm run dev
```

---

## Environment Variables

All variables are documented in `.env.example`. The full list from TRD Section 7:

| Variable | Used By | Purpose |
|---|---|---|
| `SUPABASE_URL` | API | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Service role key (server-only) |
| `SUPABASE_ANON_KEY` | API | Anon key |
| `GEMINI_API_KEY` | API | Google Gemini Vision + Flash |
| `GOOGLE_MAPS_API_KEY` | API | Directions + Distance Matrix |
| `OPENWEATHER_API_KEY` | API | Weather factor in safety score |
| `FIREBASE_PROJECT_ID` | API | FCM push notifications |
| `FIREBASE_PRIVATE_KEY` | API | FCM service account |
| `FIREBASE_CLIENT_EMAIL` | API | FCM service account |
| `N8N_WEBHOOK_BASE_URL` | API | n8n workflow triggers |
| `N8N_API_KEY` | API | n8n authentication |
| `NEXT_PUBLIC_SUPABASE_URL` | Web | Supabase URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Anon key (public) |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Web | Maps display (public) |

---

## AI Safety Score

Every donation is scored 0–100 before redistribution is recommended:

| Factor | Weight | Source |
|---|---|---|
| Freshness (shelf life) | 30% | Gemini Vision |
| Quality grade (A/B/C) | 25% | Gemini Vision |
| Estimated travel time | 15% | Google Maps |
| NGO storage capacity | 15% | NGO profile |
| Weather conditions | 10% | OpenWeatherMap |
| Traffic conditions | 5% | Google Maps |

- ✅ **≥ 70** — Recommended for redistribution  
- ⚠️ **50–69** — Flagged; NGO manual review  
- ❌ **< 50** — Blocked; donor advised on disposal

---

## API Reference

Base URL: `/api/v1` · Auth: `Authorization: Bearer <supabase_jwt>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/donations` | Create new donation |
| GET | `/donations/:id` | Get donation with AI assessment |
| PATCH | `/donations/:id/status` | Update status |
| GET | `/donations?donor_id=` | List donor's donations |
| POST | `/ai/assess-quality` | Trigger Gemini Vision assessment |
| POST | `/ai/compute-score` | Compute 6-factor safety score |
| GET | `/ai/assessments/:donation_id` | Assessment history |
| POST | `/match/find-ngos` | Find top 3 NGO matches |
| POST | `/match/notify` | Push notifications to NGOs |
| PATCH | `/match/:id/respond` | NGO accept/reject |
| POST | `/routes/generate` | Google Maps route |
| GET | `/routes/:delivery_id` | Active delivery route |
| POST | `/deliveries` | Assign volunteer |
| PATCH | `/deliveries/:id/pickup` | Confirm pickup |
| PATCH | `/deliveries/:id/deliver` | Confirm delivery |

---

## Build Phases

| Phase | Description | Status |
|---|---|---|
| 0 | Monorepo setup, tooling, env | ✅ Complete |
| 1 | Core backend (Prisma schema, auth, donation CRUD) | 🔜 Next |
| 2 | AI integration (Gemini Vision, safety score, surplus prediction) | — |
| 3 | Matching & routing (NGO match, Google Maps, volunteer) | — |
| 4 | Frontend (all dashboards — parallel with Phase 2/3) | — |
| 5 | Automation & real-time (n8n, Supabase Realtime, Socket.io) | — |
| 6 | Polish & demo prep | — |

---

## Contributing

This is a hackathon project. All decisions are frozen in the specification docs:
- `1_workflow.md` — end-to-end workflow
- `2_backend_schema.md` — full database schema
- `3_prd.md` — product requirements
- `4_trd.md` — technical requirements
- `5_implementation_plan.md` — build order

---

## License

MIT
