# FoodBridge — Implementation Plan

**Version:** 1.0  
**Format:** Phased sprint plan (hackathon-optimised)  
**Total Build Time:** 48–72 hours (hackathon) + post-hackathon roadmap

---

## Hackathon Strategy

Build a **working vertical slice** of the core loop:

> Donor posts food → AI assesses quality → Safety score computed → NGO matched → Route shown → Dashboard updated

Every other feature is **nice-to-have** and can be mocked or deferred.

---

## Phase 0 — Setup (Hours 0–3)

### Repository & Environment

- [ ] Create GitHub monorepo: `foodbridge/`
  - `apps/web` — Next.js frontend
  - `apps/api` — Express backend
  - `packages/shared` — shared Zod schemas and types
- [ ] Configure `.env` files for both apps
- [ ] Initialise Supabase project; apply schema migrations
- [ ] Set up Supabase Auth (email + Google OAuth)
- [ ] Configure Supabase Storage buckets (`food-images`, `delivery-proofs`)
- [ ] Deploy skeleton to Vercel (web) + Railway (api) — confirm live URLs

### Tooling
- [ ] ESLint + Prettier config
- [ ] Husky pre-commit hooks
- [ ] GitHub Actions CI (lint + type-check on push)

---

## Phase 1 — Core Backend (Hours 3–14)

### Database
- [ ] Write and run Prisma migrations for all tables (schema doc → code)
- [ ] Seed database with 5 dummy donors, 3 NGOs, 2 volunteers

### Authentication API
- [ ] `POST /auth/register` — create user + role-specific record
- [ ] `POST /auth/login` — Supabase session exchange
- [ ] Auth middleware for all protected routes

### Donation API
- [ ] `POST /donations` — create donation, return image upload URLs
- [ ] `GET /donations/:id` — fetch with join on AI assessment
- [ ] `PATCH /donations/:id/status` — admin/system status update

### File Upload
- [ ] Multer middleware for food image upload
- [ ] Validate MIME type (jpeg/png/webp only)
- [ ] Upload to Supabase Storage; return public URL

**Checkpoint:** Postman collection tests all endpoints — donation can be created with image.

---

## Phase 2 — AI Integration (Hours 14–24)

### Computer Vision (Gemini)
- [ ] `POST /ai/assess-quality`
  - Fetch image from Supabase Storage
  - Build Gemini Vision prompt (from TRD spec)
  - Parse and validate JSON response
  - Save to `ai_assessments` table
  - Update donation `ai_quality_grade` + `ai_shelf_life_hrs`

### Safety Score Engine
- [ ] `POST /ai/compute-score`
  - Fetch weather from OpenWeatherMap API
  - Fetch traffic estimate via Distance Matrix API (donor → NGO)
  - Run scoring function (6 factors)
  - Save score + breakdown to donation
  - If score < 50, auto-reject and notify donor

### Surplus Prediction (P1 — can mock for hackathon)
- [ ] `POST /ai/predict-surplus`
  - Query donor's last 30 donations
  - Build Gemini Flash prompt with history + context
  - Return predicted surplus window

**Checkpoint:** Post a donation with image → console shows AI grade + safety score.

---

## Phase 3 — Matching & Routing (Hours 24–34)

### NGO Matching
- [ ] `POST /match/find-ngos`
  - Query NGOs within 10 km using Supabase geospatial query
  - Filter: capacity available, food type compatible, operating hours
  - Rank by: distance × capacity × acceptance_rate
  - Return top 3 matches

### Notification Dispatch
- [ ] Integrate Firebase Admin SDK
- [ ] `POST /match/notify` — send push to top 3 NGOs
- [ ] `PATCH /match/:id/respond` — NGO accept/reject handler
  - On accept: trigger route generation + volunteer assignment
  - On reject: promote next NGO in ranked list

### Route Generation
- [ ] `POST /routes/generate`
  - Call Google Maps Directions API (donor → NGO)
  - Store encoded polyline + distance + ETA
  - Return to client for map display

### Volunteer Assignment (simplified for hackathon)
- [ ] Query available volunteers within 5 km
- [ ] Create delivery record, assign top volunteer
- [ ] Send push notification to volunteer with task details

**Checkpoint:** Full loop test — post donation → score computed → NGO notified → route displayed in console.

---

## Phase 4 — Frontend (Hours 20–40, parallel with Phase 2/3)

> Frontend development runs in parallel with backend. Mock API responses initially, connect to real API as endpoints become available.

### Layout & Auth
- [ ] Sidebar navigation (Donor / NGO / Volunteer / Admin views)
- [ ] Sign-in / Sign-up pages (Supabase Auth UI)
- [ ] Role-based redirect after login

### Donor Dashboard
- [ ] Donation posting form (multi-step)
  - Step 1: Food details (name, quantity, veg/non-veg, allergens)
  - Step 2: Time window (available from / until)
  - Step 3: Image upload with preview
- [ ] AI score display card (animated 0→score counter, colour-coded)
- [ ] Donation history table with status badges
- [ ] Impact widget: total kg donated, meals provided, CO₂ saved

### NGO Dashboard
- [ ] Incoming donation cards (food preview, score, distance)
- [ ] Accept / Reject buttons with one-tap flow
- [ ] Active delivery tracker (volunteer ETA)
- [ ] Received donations history

### Volunteer View
- [ ] Available tasks list
- [ ] Task detail: food info, pickup & dropoff map
- [ ] Accept task button
- [ ] "Mark Picked Up" / "Mark Delivered" buttons with optional photo

### Live Dashboard (Public)
- [ ] Animated counters: kg saved today, meals provided, active donations
- [ ] Map view: active donation pins
- [ ] Recent donations feed

**Checkpoint:** Complete UI flow from donor form to dashboard update visible in browser.

---

## Phase 5 — Automation & Real-Time (Hours 34–44)

### n8n Workflows
- [ ] Set up n8n (use n8n.cloud free tier for hackathon)
- [ ] Workflow 1: Donation created → AI → Score → Match → Notify
- [ ] Workflow 2: NGO accepts → Volunteer assigned → Route generated
- [ ] Workflow 3: Expiry cron (every 30 min)

### Supabase Realtime
- [ ] Subscribe to `donations` table updates on donor dashboard
- [ ] Subscribe to `deliveries` for live volunteer ETA on NGO view
- [ ] Subscribe to `notifications` for in-app notification bell

### WebSocket (volunteer location broadcast)
- [ ] Volunteer app emits GPS location every 10 seconds
- [ ] Socket.io broadcasts to NGO room for live tracking

**Checkpoint:** Post donation → watch status change live on dashboard without page refresh.

---

## Phase 6 — Polish & Demo Prep (Hours 44–54)

### Quality
- [ ] Error states on all forms (invalid image, network failure, score too low)
- [ ] Loading skeletons on all data-fetching components
- [ ] Mobile responsiveness check (375px, 768px, 1440px)
- [ ] Dark/Light mode (Tailwind dark variant)

### Demo Preparation
- [ ] Seed database with realistic scenario:
  - 3 active donors (restaurant, hostel, event)
  - 2 NGOs at different distances
  - 1 volunteer available
- [ ] Prepare 3 demo food images (good, marginal, bad) for live CV demo
- [ ] Record a 2-minute demo video as backup
- [ ] Prepare slides: Problem → Solution → Demo → Tech stack → Impact → SDG mapping → Scalability

### Submission Checklist
- [ ] README with setup instructions
- [ ] Live demo URL (Vercel)
- [ ] GitHub repository (public)
- [ ] Environment variables documented (`.env.example`)
- [ ] Architecture diagram in README

---

## Post-Hackathon Roadmap

### Month 1 — Stabilise
- Write comprehensive test suite (Jest, Playwright)
- Set up monitoring (Sentry for errors, Grafana for metrics)
- Conduct user testing with 2–3 real restaurants and 1 NGO

### Month 2 — Expand
- React Native mobile app for volunteers
- SMS notifications via Twilio (for NGOs with low smartphone penetration)
- AI surplus prediction fully live (replace mock)
- Multi-stop route optimisation (OR-Tools / Google OR-Tools API)

### Month 3 — Scale
- City #2 onboarding (full NGO and donor directory)
- Corporate donor tier (hotels, airlines, event companies)
- Government / municipal partnership pilot
- Monthly impact report auto-generation (PDF)

---

## Team Allocation (Solo / Small Team)

| Role | Phase Focus |
|---|---|
| Full-stack dev (you) | All phases — prioritise Phase 1→2→3 first |
| If +1 teammate | One takes Frontend (Phase 4), one takes Backend (Phase 1–3) |
| If +2 teammates | Split: Backend · Frontend · AI+n8n |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini Vision API quota exceeded | Medium | High | Cache results; use mock for repeated demo runs |
| Google Maps API billing | Low | Medium | Set budget alert at $10; use static maps for non-critical views |
| Geospatial query performance | Low | High | Index on lat/lng; limit to 10 km radius |
| n8n workflow failures | Medium | Medium | Add retry logic; fallback to direct API calls |
| Image upload too slow | Low | Medium | Compress client-side before upload (browser-image-compression) |
| No real NGOs for demo | High (hackathon) | Medium | Seed realistic dummy data with compelling story |
