# FoodBridge — Workflow Document

**Project:** FoodBridge — AI-Powered Food Waste Redistribution Platform  
**SDGs:** Zero Hunger (SDG 2) · Responsible Consumption & Production (SDG 12)  
**Version:** 1.0

---

## Overview

FoodBridge connects food donors (restaurants, hostels, events) with NGOs and shelters through an AI-driven pipeline that predicts surplus, assesses food quality, scores donations for safety, and auto-generates optimal pickup routes.

---

## End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DONOR SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Donor Registration & Profile Setup                          │
│     └─ Name, type (restaurant/hostel/event), location,          │
│        avg. daily cover count, cuisine type                     │
│                                                                 │
│  2. Daily Data Upload (via Dashboard or API)                    │
│     └─ Menu items prepared today                                │
│     └─ Portion count, prep time                                 │
│     └─ Food images (optional but recommended)                   │
│                                                                 │
│  3. AI Surplus Prediction                                       │
│     └─ Model analyses historical donation patterns              │
│     └─ Cross-references weather, day-of-week, local events      │
│     └─ Outputs: Predicted surplus quantity + confidence score   │
│                                                                 │
│  4. Food Image Quality Assessment (Computer Vision)             │
│     └─ Donor uploads food photo                                 │
│     └─ Gemini Vision API analyses:                              │
│         - Colour, texture, visible spoilage                     │
│         - Estimated shelf-life window                           │
│     └─ Output: Quality Grade (A/B/C) + estimated safe hours     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AI SCORING ENGINE                           │
├─────────────────────────────────────────────────────────────────┤
│  Donation Safety Score (0–100) computed from:                   │
│                                                                 │
│   Factor                       Weight                           │
│   ─────────────────────────── ──────                           │
│   Predicted freshness window    30%                             │
│   Food quality grade (CV)       25%                             │
│   Estimated travel time         15%                             │
│   NGO storage capacity          15%                             │
│   Current weather conditions     10%                            │
│   Live traffic conditions         5%                            │
│                                                                 │
│  ✅ Score ≥ 70  → Recommended for redistribution                │
│  ⚠️  Score 50–69 → Flagged; manual review by NGO               │
│  ❌ Score < 50  → Blocked; donor advised on disposal            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MATCHING ENGINE                              │
├─────────────────────────────────────────────────────────────────┤
│  5. NGO Matching                                                │
│     └─ Filter NGOs within configurable radius (default 10 km)  │
│     └─ Check NGO storage capacity & food type preferences       │
│     └─ Rank by proximity × capacity × past acceptance rate      │
│     └─ Top 3 NGOs notified simultaneously (first-accept wins)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LOGISTICS & PICKUP                            │
├─────────────────────────────────────────────────────────────────┤
│  6. Route Optimisation (Google Maps API + OR-Tools)             │
│     └─ Generates optimal route for volunteer/driver             │
│     └─ Accounts for real-time traffic & food time window        │
│     └─ Multi-stop optimisation if multiple donors in one run    │
│                                                                 │
│  7. Volunteer Assignment                                        │
│     └─ Push notification to available volunteers in area        │
│     └─ Volunteer accepts → receives route on mobile             │
│     └─ ETA shown to both donor and NGO                          │
│                                                                 │
│  8. Pickup Confirmation                                         │
│     └─ Volunteer taps "Picked Up" in app                        │
│     └─ Donor receives confirmation notification                 │
│     └─ NGO receives estimated arrival time                      │
│                                                                 │
│  9. Delivery Confirmation                                       │
│     └─ Volunteer taps "Delivered" → photo proof optional        │
│     └─ NGO confirms receipt                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DASHBOARD & IMPACT TRACKING                     │
├─────────────────────────────────────────────────────────────────┤
│  10. Real-Time Dashboard Update                                 │
│      └─ Kg of food saved (cumulative)                           │
│      └─ Meals estimated (food kg ÷ 0.4)                         │
│      └─ CO₂ emissions avoided                                   │
│      └─ Donor leaderboard & badges                              │
│      └─ NGO satisfaction ratings                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Actor Roles

| Actor | Responsibilities |
|---|---|
| **Donor** | Upload daily food data, food images; confirm pickup window |
| **NGO / Shelter** | Maintain capacity data; accept/reject donation offers |
| **Volunteer / Driver** | Accept pickup tasks; confirm pickup & delivery |
| **Admin** | Monitor platform; handle disputes; manage user access |
| **AI System** | Predict surplus; score donations; match NGOs; generate routes |

---

## Notification Flow

```
Donation created
    │
    ├──► Donor         → "Your donation is posted (Score: 87/100)"
    ├──► Top 3 NGOs    → "New donation available near you — Accept?"
    │
NGO accepts
    │
    ├──► Donor         → "NGO XYZ has accepted your donation"
    ├──► Volunteers    → Push notification with route preview
    │
Volunteer accepts
    │
    ├──► Donor         → "Volunteer on the way, ETA 12 min"
    └──► NGO           → "Pickup in progress, ETA 25 min"
```

---

## Edge Cases Handled

- **No NGO accepts within 15 min** → System widens search radius to 20 km and re-notifies
- **Volunteer cancels mid-route** → Task re-assigned to next available volunteer
- **Food score drops below threshold during transit** → Alert sent to NGO for decision
- **Donor doesn't upload image** → System still processes with text-based quality estimate (lower confidence)
- **Network failure** → n8n retries webhook triggers up to 3 times with exponential backoff
