# FoodBridge — Product Requirements Document (PRD)

**Version:** 1.0  
**Hackathon:** Tech for Tomorrow  
**SDGs:** Zero Hunger (SDG 2) · Responsible Consumption & Production (SDG 12)

---

## 1. Executive Summary

FoodBridge is an AI-powered food waste redistribution platform that connects food donors (restaurants, hostels, events) with nearby NGOs and shelters. The system uses computer vision to assess food quality, machine learning to predict surplus, and route optimisation to ensure timely, safe delivery — with every donation rated by a transparent AI Safety Score before redistribution is recommended.

---

## 2. Problem Statement

### The Gap

- India wastes approximately 67 million tonnes of food annually (UNEP, 2024).
- ~189 million people in India are undernourished.
- Restaurants and caterers regularly dispose of large quantities of edible food at the end of each day.
- NGOs and shelters lack real-time visibility into available surplus food nearby.
- Volunteers and logistics coordination are largely manual, fragmented, and slow.

### Core Pain Points

| Stakeholder | Pain Point |
|---|---|
| Donor (restaurant) | No easy channel to donate; fears liability and wasted effort |
| NGO | No predictable food pipeline; often learns too late for safe collection |
| Volunteer | No structured system; ad-hoc coordination via WhatsApp |
| Society | Massive food waste alongside persistent hunger |

---

## 3. Goals & Success Metrics

### Product Goals
- Reduce barriers to food donation to under 3 minutes of donor effort per donation.
- Ensure only food rated ≥ 70/100 by the AI Safety Score reaches beneficiaries.
- Automate 90% of the matching and routing process.

### Key Performance Indicators (KPIs)

| Metric | Target (3 months post-launch) |
|---|---|
| Kg of food redistributed | 10,000 kg |
| Active donor organisations | 50 |
| Registered NGOs | 20 |
| Avg. AI Safety Score of completed deliveries | ≥ 80 |
| Avg. donor time-to-post | < 3 minutes |
| Successful deliveries / total donations posted | ≥ 75% |
| User satisfaction (NPS) | ≥ 50 |

---

## 4. User Personas

### Persona 1 — Ramesh, Restaurant Manager
- Runs a 150-cover restaurant in Pune.
- Regularly has 8–15 kg of food left at 10 PM.
- Pain: Doesn't know who to call; worries about liability.
- Goal: Donate food quickly without lengthy paperwork.

### Persona 2 — Priya, NGO Coordinator
- Manages a shelter feeding 80 people daily.
- Pain: Unpredictable food supply; spoiled food deliveries waste resources.
- Goal: Reliable daily surplus with advance notice for preparation.

### Persona 3 — Arun, Delivery Volunteer
- College student with a bike, free 6–10 PM.
- Pain: Wants to contribute but doesn't know how to start.
- Goal: Simple task assignments with clear routes and impact visibility.

---

## 5. User Stories

### Donor
- As a donor, I want to upload food details and a photo in under 3 minutes so that I can donate without interrupting operations.
- As a donor, I want to see an AI quality score for my food so that I can decide whether it's suitable for donation.
- As a donor, I want to receive a pickup confirmation with volunteer ETA so that I can have food ready on time.
- As a donor, I want to see my cumulative impact (kg donated, meals provided) so that I feel motivated to donate regularly.

### NGO
- As an NGO coordinator, I want to receive advance notifications about available donations so that I can prepare storage and staff.
- As an NGO, I want to see the food type, quantity, and AI quality grade before accepting so that I can make informed decisions.
- As an NGO, I want to track volunteer ETA in real-time so that I can plan meal service.

### Volunteer
- As a volunteer, I want to receive pickup task notifications with a one-tap accept flow so that I can quickly commit to a delivery.
- As a volunteer, I want turn-by-turn navigation to the pickup point so that I don't waste time.
- As a volunteer, I want to log proof of pickup and delivery so that the system is trustworthy.

### Admin
- As an admin, I want a dashboard showing real-time donation flow so that I can identify bottlenecks.
- As an admin, I want to manually override AI scores in edge cases so that no genuinely good donation is blocked.

---

## 6. Feature List

### MVP Features (Hackathon Build)

| Priority | Feature | Description |
|---|---|---|
| P0 | Donor Registration & Onboarding | Email/Google sign-in; org profile setup |
| P0 | Donation Posting | Food form + image upload |
| P0 | Computer Vision Assessment | Gemini Vision API quality grade + shelf-life |
| P0 | AI Safety Score | Composite score engine (6 factors) |
| P0 | NGO Matching | Proximity + capacity matching algorithm |
| P0 | Route Generation | Google Maps Directions API |
| P0 | Real-Time Notifications | Push + in-app for all actors |
| P0 | Live Dashboard | Impact metrics, donation status |
| P1 | Volunteer Assignment Flow | Accept task, confirm pickup/delivery |
| P1 | NGO Accept/Reject Flow | One-tap accept with food preview |
| P1 | Delivery Tracking | Real-time volunteer location for NGO |
| P2 | Donor Impact Report | Monthly PDF of donations and impact |
| P2 | AI Surplus Prediction | Historical pattern-based pre-alert to NGOs |
| P2 | Weather & Traffic Integration | Dynamic score adjustment |

### Post-Hackathon / Roadmap

- Mobile apps (React Native / Flutter)
- Multi-city scaling with regional admin panels
- Food category-specific routing (e.g., dry goods vs. cooked meals)
- Government / municipal corporation integration
- API for third-party donor apps (Swiggy, Zomato for restaurant partners)

---

## 7. UX Requirements

- **Mobile-first** responsive web app.
- Donor posting flow: maximum 3 screens, maximum 3 minutes.
- Colour system: green/amber/red for score visualisation.
- Multi-language support (English + Hindi for MVP).
- Offline-tolerant: donations saved locally if network drops, synced on reconnect.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | API response < 500 ms (p95); AI scoring < 8 seconds |
| Availability | 99.5% uptime (Supabase SLA) |
| Security | All PII encrypted at rest; HTTPS only; RLS on all tables |
| Scalability | Architecture must support 10× load with no code changes |
| Compliance | Food Safety: blocked donations archived, not deleted (audit trail) |
| Accessibility | WCAG 2.1 AA for web dashboard |

---

## 9. Out of Scope (Hackathon)

- Payment processing or financial incentives.
- Cold-chain or refrigerated logistics management.
- Food preparation or cooking instructions.
- Government regulatory filings automation.
