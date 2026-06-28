@# FoodBridge — Technical Requirements Document (TRD)

**Version:** 1.0  
**Stack:** Next.js · Node.js/Express · Supabase (PostgreSQL) · Gemini API · Google Maps API · n8n

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   Next.js 14 (App Router)  ·  Tailwind CSS  ·  shadcn/ui    │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTPS / REST / WebSocket
┌─────────────────────▼────────────────────────────────────────┐
│                        API LAYER                             │
│            Node.js + Express  (REST API)                     │
│   /api/donations  /api/match  /api/routes  /api/ai           │
└───┬─────────────────┬───────────────────┬────────────────────┘
    │                 │                   │
    ▼                 ▼                   ▼
┌───────────┐  ┌──────────────┐  ┌───────────────────┐
│ Supabase  │  │  AI Services │  │  External APIs    │
│ Postgres  │  │  Gemini API  │  │  Google Maps API  │
│ Auth      │  │  (Vision +   │  │  Weather API      │
│ Storage   │  │   Scoring)   │  │  Firebase FCM     │
│ Realtime  │  └──────────────┘  └───────────────────┘
└───────────┘
    │
    ▼
┌───────────────────┐
│  n8n (Automation) │
│  Webhook triggers │
│  Notification     │
│  workflows        │
└───────────────────┘
```

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Full-stack React framework |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn/ui | Latest | Accessible component library |
| React Query (TanStack) | 5 | Server state & caching |
| Zustand | 4 | Client-side state (volunteer location, UI) |
| Leaflet / react-leaflet | 4 | Map display (open-source, no cost) |
| Socket.io-client | 4 | Real-time delivery tracking |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Express | 4 | API routing |
| Prisma | 5 | ORM + migrations |
| Zod | 3 | Request validation schemas |
| Multer | 1.4 | Multipart file upload handling |
| node-cron | 3 | Scheduled jobs (expiry checks, metrics) |
| Socket.io | 4 | Volunteer location broadcast |

### Database & Infrastructure

| Service | Purpose |
|---|---|
| Supabase (PostgreSQL 15) | Primary database |
| Supabase Auth | JWT-based authentication |
| Supabase Storage | Food image storage |
| Supabase Realtime | Live donation/delivery status updates |
| Vercel | Next.js deployment |
| Railway / Render | Express backend deployment |

### AI & External APIs

| API | Usage |
|---|---|
| Google Gemini 1.5 Pro (Vision) | Food image quality assessment |
| Google Gemini 1.5 Flash | Surplus prediction text reasoning |
| Google Maps Directions API | Route generation |
| Google Maps Distance Matrix | Multi-NGO proximity calculation |
| OpenWeatherMap API | Weather factor in safety score |
| Firebase Cloud Messaging | Push notifications (volunteers) |

### Automation

| Tool | Purpose |
|---|---|
| n8n (self-hosted or cloud) | Orchestrates notification workflows, retry logic, scheduled NGO alerts |

---

## 3. API Design

### Base URL
```
https://api.foodbridge.app/v1
```

### Authentication
All endpoints require Bearer token from Supabase Auth except `/auth/*`.

```
Authorization: Bearer <supabase_jwt>
```

---

### Donations

```
POST   /donations              Create new donation
GET    /donations/:id          Get donation details
PATCH  /donations/:id/status   Update donation status
GET    /donations?donor_id=    List donor's donations
```

**POST /donations — Request Body**
```json
{
  "title": "Chicken Biryani + Dal",
  "food_items": [
    { "name": "Chicken Biryani", "qty_kg": 8.0, "veg": false },
    { "name": "Dal Makhani", "qty_kg": 3.5, "veg": true }
  ],
  "total_quantity_kg": 11.5,
  "prepared_at": "2024-12-01T19:00:00Z",
  "available_from": "2024-12-01T21:00:00Z",
  "available_until": "2024-12-01T23:30:00Z",
  "pickup_lat": 18.5204,
  "pickup_lng": 73.8567,
  "is_veg": false,
  "contains_allergens": ["nuts", "dairy"]
}
```

**Response**
```json
{
  "id": "uuid",
  "status": "ai_processing",
  "image_upload_urls": ["https://...presigned..."],
  "message": "Upload food images to trigger AI assessment"
}
```

---

### AI Assessment

```
POST   /ai/assess-quality        Trigger CV quality assessment
POST   /ai/compute-score         Compute donation safety score
GET    /ai/assessments/:donation_id   Retrieve assessment history
```

**POST /ai/assess-quality — Request Body**
```json
{
  "donation_id": "uuid",
  "image_paths": ["food-images/uuid/img1.jpg"]
}
```

**Response**
```json
{
  "quality_grade": "A",
  "shelf_life_hours": 6,
  "confidence": 0.87,
  "observations": "Food appears fresh; good colour and texture. No visible spoilage.",
  "model": "gemini-1.5-pro"
}
```

---

### Matching

```
POST   /match/find-ngos         Find top NGO matches for a donation
POST   /match/notify            Send notifications to matched NGOs
PATCH  /match/:id/respond       NGO accepts or rejects
```

---

### Routing

```
POST   /routes/generate         Generate optimal pickup route
GET    /routes/:delivery_id     Get route for active delivery
```

---

### Deliveries

```
POST   /deliveries              Assign volunteer to delivery
PATCH  /deliveries/:id/pickup   Volunteer confirms pickup
PATCH  /deliveries/:id/deliver  Volunteer confirms delivery
```

---

## 4. AI Module Specifications

### 4.1 Food Quality Assessment (Computer Vision)

**Prompt Template sent to Gemini Vision API:**
```
You are a certified food safety inspector AI. Analyse the provided food image and respond ONLY with valid JSON:

{
  "quality_grade": "A" | "B" | "C" | "UNSAFE",
  "shelf_life_hours": <integer, estimated safe consumption window from now>,
  "confidence": <float 0.0–1.0>,
  "observations": "<brief professional description of food appearance>",
  "red_flags": ["<list any visible spoilage indicators>"]
}

Grade definitions:
- A: Excellent — fresh appearance, suitable for immediate redistribution
- B: Good — slight age but safe within shelf life window
- C: Marginal — acceptable only if consumed very soon; NGO must confirm
- UNSAFE: Do not redistribute — visible spoilage, mould, or contamination
```

**Fallback:** If image quality is too low (blurry, dark), return `confidence < 0.4` and flag for manual review.

---

### 4.2 Donation Safety Score Engine

Computed server-side after AI assessment:

```javascript
function computeSafetyScore(donation, assessment, ngo, weather, traffic) {
  const scores = {
    freshness:   mapToScore(assessment.shelf_life_hours, [0,2,4,8,12], [0,20,25,30,30]),
    quality:     { A: 25, B: 18, C: 10, UNSAFE: 0 }[assessment.quality_grade],
    travelTime:  mapToScore(traffic.estimated_mins, [0,15,30,60], [15,15,10,5]),
    ngoCapacity: mapToScore(ngo.available_capacity_pct, [0,20,50,80], [0,8,12,15]),
    weather:     weather.is_extreme ? 5 : 10,
    traffic:     traffic.congestion === 'high' ? 3 : 5
  };

  return Object.values(scores).reduce((a, b) => a + b, 0); // max 100
}
```

**Thresholds:**
- ≥ 70 → Recommended ✅
- 50–69 → NGO manual review ⚠️
- < 50 → Blocked ❌

---

### 4.3 Surplus Prediction

Uses Gemini Flash with structured prompt including:
- Donor's historical donation data (last 30 days)
- Today's day of week, local public holiday flag
- Weather forecast
- Special event flag (from donor profile)

Output: `{ predicted_surplus_kg: float, confidence: float, window: "HH:MM–HH:MM" }`

---

## 5. n8n Automation Workflows

### Workflow 1: New Donation Posted
```
Webhook (donation.created)
  → HTTP: POST /ai/assess-quality
  → Wait: AI response (poll every 5s, timeout 30s)
  → HTTP: POST /ai/compute-score
  → Branch: score >= 70?
      YES → HTTP: POST /match/find-ngos
            → HTTP: POST /match/notify (send to top 3 NGOs)
      NO  → HTTP: PATCH /donations/:id/status {status: "rejected"}
            → Send email to donor with reason
```

### Workflow 2: NGO Accepts → Volunteer Assignment
```
Webhook (match.accepted)
  → HTTP: GET /volunteers/available?lat=&lng=&radius=5km
  → HTTP: POST /routes/generate
  → HTTP: POST /deliveries
  → Send push via Firebase FCM to top 5 nearby volunteers
  → Wait 10 min for acceptance
  → IF no accept → widen radius to 10 km and retry
```

### Workflow 3: Daily Expiry Check (Cron: every 30 min)
```
Query: SELECT * FROM donations WHERE status='matched' AND available_until < NOW()
  → For each: PATCH /donations/:id/status {status: "expired"}
  → Notify donor: "Pickup window passed — please try again tomorrow"
```

---

## 6. Security Requirements

| Area | Implementation |
|---|---|
| Authentication | Supabase Auth (JWT, refresh token rotation) |
| Authorisation | Row-Level Security on all Supabase tables |
| File Upload | Supabase Storage signed URLs; server validates MIME type before saving |
| API Rate Limiting | express-rate-limit: 100 req/min per IP; 20 req/min on AI endpoints |
| Input Validation | Zod schemas on all POST/PATCH bodies |
| HTTPS | Enforced on Vercel + Railway; HSTS enabled |
| API Keys | Stored in environment variables; never in client bundle |
| AI Prompt Injection | Food image path is server-resolved; user text never interpolated into AI prompts |
| Audit Trail | `ai_assessments` table stores every AI call; blocked donations archived, never deleted |

---

## 7. Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# AI
GEMINI_API_KEY=

# Maps
GOOGLE_MAPS_API_KEY=

# Weather
OPENWEATHER_API_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# n8n
N8N_WEBHOOK_BASE_URL=
N8N_API_KEY=

# App
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

---

## 8. Performance Targets

| Endpoint | Target (p95) |
|---|---|
| POST /donations | < 300 ms |
| POST /ai/assess-quality | < 8 s (Gemini Vision) |
| POST /match/find-ngos | < 500 ms |
| POST /routes/generate | < 1 s |
| Real-time updates (WebSocket) | < 200 ms propagation |

---

## 9. Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit (backend) | Jest | 70% |
| API Integration | Supertest | All P0 endpoints |
| Frontend components | React Testing Library | Critical flows |
| E2E | Playwright | Donor → Delivered happy path |
| AI Mocking | MSW (Mock Service Worker) | All AI endpoints stubbed for CI |
