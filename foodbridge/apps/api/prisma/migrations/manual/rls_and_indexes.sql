-- ============================================================================
-- FoodBridge — Manual SQL: GIST Spatial Indexes + Partial Indexes + RLS
-- Run this AFTER `prisma migrate dev` or `prisma db push` to apply the
-- spatial indexes and row-level security policies that Prisma cannot express.
-- Command: psql $DATABASE_URL -f prisma/migrations/manual/rls_and_indexes.sql
-- ============================================================================

-- Enable PostGIS-compatible point type (built into Postgres, no extension needed)
-- The GIST indexes below use the built-in `point` type for fast radius queries.

-- ─── GIST Spatial Indexes ────────────────────────────────────────────────────
-- Replaces the default B-tree index Prisma creates for latitude/longitude.
-- Used by: NGO matching queries (radius search within N km of donation).

CREATE INDEX IF NOT EXISTS idx_donors_location
  ON donors USING GIST (point(longitude::float8, latitude::float8));

CREATE INDEX IF NOT EXISTS idx_ngos_location
  ON ngos USING GIST (point(longitude::float8, latitude::float8));

CREATE INDEX IF NOT EXISTS idx_volunteers_location
  ON volunteers USING GIST (point(longitude::float8, latitude::float8));

-- ─── Partial Index: Unread Notifications ─────────────────────────────────────
-- Prisma created idx_notif_user_unread as a full index. Replace with partial.
DROP INDEX IF EXISTS idx_notif_user_unread;
CREATE INDEX idx_notif_user_unread
  ON notifications (user_id)
  WHERE is_read = FALSE;

-- ─── CHECK Constraints ───────────────────────────────────────────────────────
-- Prisma maps these as String — enforce valid values at the DB layer too.

ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
ALTER TABLE users ADD CONSTRAINT chk_users_role
  CHECK (role IN ('donor', 'ngo', 'volunteer', 'admin'));

ALTER TABLE donors DROP CONSTRAINT IF EXISTS chk_donors_org_type;
ALTER TABLE donors ADD CONSTRAINT chk_donors_org_type
  CHECK (org_type IN ('restaurant', 'hostel', 'event', 'catering', 'other'));

ALTER TABLE volunteers DROP CONSTRAINT IF EXISTS chk_volunteers_vehicle_type;
ALTER TABLE volunteers ADD CONSTRAINT chk_volunteers_vehicle_type
  CHECK (vehicle_type IN ('bike', 'car', 'van', 'cycle', 'walk'));

ALTER TABLE donations DROP CONSTRAINT IF EXISTS chk_donations_status;
ALTER TABLE donations ADD CONSTRAINT chk_donations_status
  CHECK (status IN ('pending', 'ai_processing', 'matched', 'pickup_assigned',
                    'in_transit', 'delivered', 'cancelled', 'expired', 'rejected'));

ALTER TABLE donations DROP CONSTRAINT IF EXISTS chk_donations_quality_grade;
ALTER TABLE donations ADD CONSTRAINT chk_donations_quality_grade
  CHECK (ai_quality_grade IN ('A', 'B', 'C', 'unrated'));

ALTER TABLE donation_matches DROP CONSTRAINT IF EXISTS chk_matches_status;
ALTER TABLE donation_matches ADD CONSTRAINT chk_matches_status
  CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));

ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS chk_deliveries_status;
ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_status
  CHECK (status IN ('assigned', 'en_route_pickup', 'picked_up',
                    'en_route_delivery', 'delivered', 'failed'));

ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS chk_deliveries_rating;
ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_rating
  CHECK (rating_by_ngo BETWEEN 1 AND 5);

ALTER TABLE ai_assessments DROP CONSTRAINT IF EXISTS chk_assessments_type;
ALTER TABLE ai_assessments ADD CONSTRAINT chk_assessments_type
  CHECK (assessment_type IN ('quality_vision', 'surplus_prediction', 'scoring'));

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
-- Supabase uses PostgreSQL RLS. The Express API connects with the service-role
-- key (bypasses RLS), but the frontend anon client is restricted by these rules.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;

-- users: users can only read/update their own row
CREATE POLICY users_self_read ON users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY users_self_update ON users FOR UPDATE
  USING (auth.uid() = id);

-- donors: anyone authenticated can read; only owner can mutate
CREATE POLICY donors_read ON donors FOR SELECT TO authenticated
  USING (true);
CREATE POLICY donors_mutate ON donors FOR ALL
  USING (auth.uid() = user_id);

-- ngos: anyone authenticated can read; only owner can mutate
CREATE POLICY ngos_read ON ngos FOR SELECT TO authenticated
  USING (true);
CREATE POLICY ngos_mutate ON ngos FOR ALL
  USING (auth.uid() = user_id);

-- volunteers: anyone authenticated can read; only owner can mutate
CREATE POLICY volunteers_read ON volunteers FOR SELECT TO authenticated
  USING (true);
CREATE POLICY volunteers_mutate ON volunteers FOR ALL
  USING (auth.uid() = user_id);

-- donations: authenticated users can read all; donors can create/update their own
CREATE POLICY donations_read ON donations FOR SELECT TO authenticated
  USING (true);
CREATE POLICY donations_insert ON donations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM donors WHERE donors.user_id = auth.uid()
                      AND donors.id = donor_id));
CREATE POLICY donations_update ON donations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM donors WHERE donors.user_id = auth.uid()
                 AND donors.id = donor_id));

-- notifications: users can only see their own
CREATE POLICY notifications_self ON notifications FOR ALL
  USING (auth.uid() = user_id);

-- impact_metrics: public read, no writes from client
CREATE POLICY impact_metrics_read ON impact_metrics FOR SELECT
  USING (true);
