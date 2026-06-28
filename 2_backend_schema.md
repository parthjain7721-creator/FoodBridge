# FoodBridge — Backend Schema

**Version:** 1.0  
**Database:** PostgreSQL (via Supabase)  
**ORM:** Prisma

---

## Entity Relationship Overview

```
users ──────────┬──── donors
                ├──── ngos
                └──── volunteers

donors ──────── donations ──────────┬──── donation_images
                                    ├──── ai_assessments
                                    └──── donation_matches ──── volunteers
                                              │
                                         deliveries
```

---

## Table Definitions

### `users`
Core authentication table. Extended by role-specific tables.

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer', 'admin')),
  avatar_url    TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `donors`
Restaurants, hostels, catering services, event organisers.

```sql
CREATE TABLE donors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  org_name        TEXT NOT NULL,
  org_type        TEXT CHECK (org_type IN ('restaurant', 'hostel', 'event', 'catering', 'other')),
  address         TEXT NOT NULL,
  latitude        DECIMAL(9,6) NOT NULL,
  longitude       DECIMAL(9,6) NOT NULL,
  avg_daily_covers INT,
  cuisine_tags    TEXT[],
  fssai_number    TEXT,
  impact_score    INT DEFAULT 0,
  total_kg_donated DECIMAL(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `ngos`
Recipient organisations — shelters, food banks, orphanages.

```sql
CREATE TABLE ngos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  org_name          TEXT NOT NULL,
  registration_no   TEXT UNIQUE,
  address           TEXT NOT NULL,
  latitude          DECIMAL(9,6) NOT NULL,
  longitude         DECIMAL(9,6) NOT NULL,
  storage_capacity_kg DECIMAL(8,2) DEFAULT 0,
  current_load_kg   DECIMAL(8,2) DEFAULT 0,
  accepted_food_types TEXT[],
  beneficiary_count INT,
  operating_hours   JSONB,
  -- e.g. { "mon": ["08:00","20:00"], "tue": ["08:00","20:00"], ... }
  acceptance_rate   DECIMAL(4,2) DEFAULT 1.0,
  avg_response_time_mins INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `volunteers`
Delivery agents — individuals or tied to logistics partners.

```sql
CREATE TABLE volunteers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type    TEXT CHECK (vehicle_type IN ('bike', 'car', 'van', 'cycle', 'walk')),
  max_load_kg     DECIMAL(6,2),
  latitude        DECIMAL(9,6),
  longitude       DECIMAL(9,6),
  is_available    BOOLEAN DEFAULT FALSE,
  total_deliveries INT DEFAULT 0,
  rating          DECIMAL(3,2) DEFAULT 5.0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `donations`
Core entity representing a single food donation event.

```sql
CREATE TABLE donations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id          UUID REFERENCES donors(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  food_items        JSONB NOT NULL,
  -- e.g. [{ "name": "Biryani", "qty_kg": 5.0, "veg": true }]
  total_quantity_kg DECIMAL(8,2) NOT NULL,
  prepared_at       TIMESTAMPTZ NOT NULL,
  available_from    TIMESTAMPTZ NOT NULL,
  available_until   TIMESTAMPTZ NOT NULL,
  pickup_address    TEXT,
  pickup_lat        DECIMAL(9,6),
  pickup_lng        DECIMAL(9,6),
  is_veg            BOOLEAN DEFAULT TRUE,
  contains_allergens TEXT[],
  status            TEXT DEFAULT 'pending' CHECK (
                      status IN ('pending','ai_processing','matched',
                                 'pickup_assigned','in_transit',
                                 'delivered','cancelled','expired','rejected')
                    ),
  safety_score      INT,
  -- Computed by AI (0-100); NULL until AI processed
  score_breakdown   JSONB,
  ai_shelf_life_hrs INT,
  ai_quality_grade  TEXT CHECK (ai_quality_grade IN ('A','B','C','unrated')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `donation_images`
Food images uploaded for computer vision assessment.

```sql
CREATE TABLE donation_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id  UUID REFERENCES donations(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  -- Supabase Storage bucket path
  public_url   TEXT,
  is_primary   BOOLEAN DEFAULT FALSE,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `ai_assessments`
Full record of every AI call result for audit and ML retraining.

```sql
CREATE TABLE ai_assessments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id      UUID REFERENCES donations(id) ON DELETE CASCADE,
  model_used       TEXT NOT NULL,
  -- e.g. "gemini-1.5-pro", "gpt-4o"
  assessment_type  TEXT CHECK (assessment_type IN ('quality_vision','surplus_prediction','scoring')),
  input_payload    JSONB,
  raw_response     JSONB,
  parsed_result    JSONB,
  confidence       DECIMAL(4,3),
  latency_ms       INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `donation_matches`
Records which NGO was matched to which donation, and the acceptance outcome.

```sql
CREATE TABLE donation_matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id    UUID REFERENCES donations(id) ON DELETE CASCADE,
  ngo_id         UUID REFERENCES ngos(id),
  match_rank     INT NOT NULL,
  -- 1 = best match, 2 = 2nd, 3 = 3rd
  match_score    DECIMAL(5,2),
  notified_at    TIMESTAMPTZ DEFAULT NOW(),
  responded_at   TIMESTAMPTZ,
  status         TEXT DEFAULT 'pending' CHECK (
                   status IN ('pending','accepted','rejected','expired')
                 ),
  rejection_reason TEXT
);
```

---

### `deliveries`
Tracks the physical pickup and drop-off by a volunteer.

```sql
CREATE TABLE deliveries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id      UUID UNIQUE REFERENCES donations(id),
  match_id         UUID REFERENCES donation_matches(id),
  volunteer_id     UUID REFERENCES volunteers(id),
  route_polyline   TEXT,
  -- Encoded Google Maps polyline
  distance_km      DECIMAL(6,2),
  est_duration_mins INT,
  assigned_at      TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at     TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  pickup_photo_url TEXT,
  delivery_photo_url TEXT,
  ngo_confirmation BOOLEAN DEFAULT FALSE,
  rating_by_ngo    INT CHECK (rating_by_ngo BETWEEN 1 AND 5),
  status           TEXT DEFAULT 'assigned' CHECK (
                     status IN ('assigned','en_route_pickup',
                                'picked_up','en_route_delivery',
                                'delivered','failed')
                   )
);
```

---

### `notifications`
Unified notification log across all actors.

```sql
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  -- e.g. 'donation_matched', 'volunteer_assigned', 'delivery_complete'
  title        TEXT NOT NULL,
  body         TEXT,
  data         JSONB,
  is_read      BOOLEAN DEFAULT FALSE,
  sent_via     TEXT[],
  -- ['push', 'email', 'sms']
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `impact_metrics`
Daily aggregated statistics for the public dashboard.

```sql
CREATE TABLE impact_metrics (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE UNIQUE NOT NULL,
  donations_count INT DEFAULT 0,
  kg_saved       DECIMAL(10,2) DEFAULT 0,
  meals_provided INT DEFAULT 0,
  -- FLOOR(kg_saved / 0.4)
  co2_avoided_kg DECIMAL(10,2) DEFAULT 0,
  -- kg_saved * 2.5 (IPCC food waste factor)
  ngos_served    INT DEFAULT 0,
  volunteers_active INT DEFAULT 0,
  avg_safety_score DECIMAL(4,2)
);
```

---

## Indexes

```sql
-- Geospatial queries
CREATE INDEX idx_donors_location     ON donors     USING GIST(point(longitude, latitude));
CREATE INDEX idx_ngos_location       ON ngos       USING GIST(point(longitude, latitude));
CREATE INDEX idx_volunteers_location ON volunteers USING GIST(point(longitude, latitude));

-- Frequent lookups
CREATE INDEX idx_donations_status    ON donations(status);
CREATE INDEX idx_donations_donor     ON donations(donor_id);
CREATE INDEX idx_deliveries_vol      ON deliveries(volunteer_id);
CREATE INDEX idx_notif_user_unread   ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_matches_donation    ON donation_matches(donation_id);
```

---

## Supabase Row-Level Security (RLS) Policies

```sql
-- Donors can only see their own donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donors_own" ON donations
  FOR ALL USING (donor_id = (
    SELECT id FROM donors WHERE user_id = auth.uid()
  ));

-- Volunteers see only assigned deliveries
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteer_own" ON deliveries
  FOR SELECT USING (volunteer_id = (
    SELECT id FROM volunteers WHERE user_id = auth.uid()
  ));

-- NGOs see matches directed to them
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ngo_own_matches" ON donation_matches
  FOR SELECT USING (ngo_id = (
    SELECT id FROM ngos WHERE user_id = auth.uid()
  ));
```

---

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `food-images` | Private | Donor-uploaded food photos |
| `delivery-proofs` | Private | Pickup/delivery photo evidence |
| `org-documents` | Private | NGO registration docs |
| `avatars` | Public | User profile pictures |

---

## Real-Time Subscriptions (Supabase Realtime)

| Table | Event | Subscribers |
|---|---|---|
| `donations` | UPDATE (status) | Donor dashboard |
| `deliveries` | UPDATE | Donor + NGO live tracking |
| `donation_matches` | INSERT | NGO notification panel |
| `notifications` | INSERT | All users |
