-- ════════════════════════════════════════════════════════════════════════════════
-- HOSTLY PLATFORM - Row-Level Security (RLS) Policies
-- State-of-the-art database-level tenant isolation
-- ════════════════════════════════════════════════════════════════════════════════
--
-- Run this after initial migration:
-- psql $DIRECT_URL -f prisma/rls-policies.sql
--
-- ════════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════════════════════

-- Get organization ID from JWT claims
CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'org',
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'organization_id')
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get user ID from JWT claims
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    (auth.uid())::text
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get user role from JWT claims
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if request is from service role (bypasses RLS)
CREATE OR REPLACE FUNCTION auth.is_service_role()
RETURNS BOOLEAN AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════════════════════
-- ENABLE RLS ON ALL TABLES
-- ════════════════════════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════════════════════
-- ORGANIZATIONS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Users can only see their own organization
CREATE POLICY "organizations_select_own" ON organizations
  FOR SELECT USING (id = auth.org_id() OR auth.is_service_role());

-- Only owners can update their organization
CREATE POLICY "organizations_update_owner" ON organizations
  FOR UPDATE USING (
    id = auth.org_id() AND auth.user_role() = 'owner'
  ) WITH CHECK (id = auth.org_id());

-- Service role can insert/delete (for admin operations)
CREATE POLICY "organizations_service_all" ON organizations
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- USERS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Users can see other users in their organization
CREATE POLICY "users_select_org" ON users
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Admins can insert new users
CREATE POLICY "users_insert_org" ON users
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

-- Users can update themselves, admins can update anyone in org
CREATE POLICY "users_update_org" ON users
  FOR UPDATE USING (
    organization_id = auth.org_id()
    AND (auth.user_role() IN ('owner', 'admin') OR id = auth.user_id())
  );

-- Only owners can delete users
CREATE POLICY "users_delete_owner" ON users
  FOR DELETE USING (
    organization_id = auth.org_id() AND auth.user_role() = 'owner'
  );

-- Service role bypass
CREATE POLICY "users_service_all" ON users
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- API KEYS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "api_keys_select_org" ON api_keys
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "api_keys_insert_org" ON api_keys
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "api_keys_update_org" ON api_keys
  FOR UPDATE USING (organization_id = auth.org_id());

CREATE POLICY "api_keys_delete_org" ON api_keys
  FOR DELETE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "api_keys_service_all" ON api_keys
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- PROPERTIES POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Tenant users can see their properties
CREATE POLICY "properties_select_org" ON properties
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can see active properties (for booking websites)
CREATE POLICY "properties_select_public" ON properties
  FOR SELECT USING (
    status = 'active' AND auth.org_id() IS NULL
  );

-- Staff and above can create properties
CREATE POLICY "properties_insert_org" ON properties
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'staff')
  );

-- Staff and above can update properties
CREATE POLICY "properties_update_org" ON properties
  FOR UPDATE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin', 'staff')
  );

-- Only admins can delete properties
CREATE POLICY "properties_delete_org" ON properties
  FOR DELETE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "properties_service_all" ON properties
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- PROPERTY PHOTOS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "property_photos_select_org" ON property_photos
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can see photos for active properties
CREATE POLICY "property_photos_select_public" ON property_photos
  FOR SELECT USING (
    auth.org_id() IS NULL AND EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_photos.property_id
      AND properties.status = 'active'
    )
  );

CREATE POLICY "property_photos_insert_org" ON property_photos
  FOR INSERT WITH CHECK (organization_id = auth.org_id());

CREATE POLICY "property_photos_update_org" ON property_photos
  FOR UPDATE USING (organization_id = auth.org_id());

CREATE POLICY "property_photos_delete_org" ON property_photos
  FOR DELETE USING (organization_id = auth.org_id());

CREATE POLICY "property_photos_service_all" ON property_photos
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- AMENITIES POLICIES (Global table - read by all)
-- ════════════════════════════════════════════════════════════════════════════════

-- Everyone can read amenities
CREATE POLICY "amenities_select_all" ON amenities
  FOR SELECT USING (true);

-- Only service role can modify
CREATE POLICY "amenities_service_all" ON amenities
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- PROPERTY AMENITIES POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "property_amenities_select_org" ON property_amenities
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can see amenities for active properties
CREATE POLICY "property_amenities_select_public" ON property_amenities
  FOR SELECT USING (
    auth.org_id() IS NULL AND EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_amenities.property_id
      AND properties.status = 'active'
    )
  );

CREATE POLICY "property_amenities_insert_org" ON property_amenities
  FOR INSERT WITH CHECK (organization_id = auth.org_id());

CREATE POLICY "property_amenities_delete_org" ON property_amenities
  FOR DELETE USING (organization_id = auth.org_id());

CREATE POLICY "property_amenities_service_all" ON property_amenities
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- RESERVATIONS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "reservations_select_org" ON reservations
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Allow guest-facing booking creation (public API)
CREATE POLICY "reservations_insert_public" ON reservations
  FOR INSERT WITH CHECK (
    auth.is_service_role() OR (
      auth.org_id() IS NULL AND EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = reservations.property_id
        AND properties.status = 'active'
      )
    )
  );

CREATE POLICY "reservations_insert_org" ON reservations
  FOR INSERT WITH CHECK (organization_id = auth.org_id());

CREATE POLICY "reservations_update_org" ON reservations
  FOR UPDATE USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Only admins can delete reservations
CREATE POLICY "reservations_delete_org" ON reservations
  FOR DELETE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "reservations_service_all" ON reservations
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- CALENDAR POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "calendar_select_org" ON calendar
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can see calendar for active properties (availability checking)
CREATE POLICY "calendar_select_public" ON calendar
  FOR SELECT USING (
    auth.org_id() IS NULL AND EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = calendar.property_id
      AND properties.status = 'active'
    )
  );

CREATE POLICY "calendar_insert_org" ON calendar
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "calendar_update_org" ON calendar
  FOR UPDATE USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "calendar_delete_org" ON calendar
  FOR DELETE USING (organization_id = auth.org_id());

CREATE POLICY "calendar_service_all" ON calendar
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- QUOTES POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "quotes_select_org" ON quotes
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can create quotes (price checking)
CREATE POLICY "quotes_insert_public" ON quotes
  FOR INSERT WITH CHECK (
    auth.is_service_role() OR (
      auth.org_id() IS NULL AND EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = quotes.property_id
        AND properties.status = 'active'
      )
    )
  );

CREATE POLICY "quotes_insert_org" ON quotes
  FOR INSERT WITH CHECK (organization_id = auth.org_id());

CREATE POLICY "quotes_update_org" ON quotes
  FOR UPDATE USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "quotes_service_all" ON quotes
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- GUESTS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "guests_select_org" ON guests
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "guests_insert_org" ON guests
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "guests_update_org" ON guests
  FOR UPDATE USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Only admins can delete guests
CREATE POLICY "guests_delete_org" ON guests
  FOR DELETE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "guests_service_all" ON guests
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- PAYMENTS POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "payments_select_org" ON payments
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "payments_insert_org" ON payments
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

CREATE POLICY "payments_update_org" ON payments
  FOR UPDATE USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Payments should never be deleted
CREATE POLICY "payments_service_all" ON payments
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- WEBSITES POLICIES
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "websites_select_org" ON websites
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Public can read published websites (for domain resolution)
CREATE POLICY "websites_select_public" ON websites
  FOR SELECT USING (
    status = 'published' AND auth.org_id() IS NULL
  );

CREATE POLICY "websites_insert_org" ON websites
  FOR INSERT WITH CHECK (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "websites_update_org" ON websites
  FOR UPDATE USING (
    organization_id = auth.org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

CREATE POLICY "websites_service_all" ON websites
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- EVENTS POLICIES (Audit Trail)
-- ════════════════════════════════════════════════════════════════════════════════

-- Events are read-only for regular users
CREATE POLICY "events_select_org" ON events
  FOR SELECT USING (
    organization_id = auth.org_id() OR auth.is_service_role()
  );

-- Only service role can insert events (from application code)
CREATE POLICY "events_insert_service" ON events
  FOR INSERT WITH CHECK (auth.is_service_role());

-- Events are immutable - no update or delete
CREATE POLICY "events_service_all" ON events
  FOR ALL USING (auth.is_service_role());

-- ════════════════════════════════════════════════════════════════════════════════
-- JSONB GIN INDEXES (for fast JSON queries)
-- ════════════════════════════════════════════════════════════════════════════════

-- Property address search
CREATE INDEX IF NOT EXISTS idx_properties_address_gin
  ON properties USING GIN (address jsonb_path_ops);

-- Property coordinates for geo queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates_gin
  ON properties USING GIN (coordinates jsonb_path_ops);

-- Guest address search
CREATE INDEX IF NOT EXISTS idx_guests_address_gin
  ON guests USING GIN (address jsonb_path_ops);

-- Organization settings
CREATE INDEX IF NOT EXISTS idx_organizations_settings_gin
  ON organizations USING GIN (settings jsonb_path_ops);

-- Organization branding
CREATE INDEX IF NOT EXISTS idx_organizations_branding_gin
  ON organizations USING GIN (branding jsonb_path_ops);

-- Quote nightly rates
CREATE INDEX IF NOT EXISTS idx_quotes_nightly_rates_gin
  ON quotes USING GIN (nightly_rates jsonb_path_ops);

-- Website theme
CREATE INDEX IF NOT EXISTS idx_websites_theme_gin
  ON websites USING GIN (theme jsonb_path_ops);

-- Website SEO
CREATE INDEX IF NOT EXISTS idx_websites_seo_gin
  ON websites USING GIN (seo jsonb_path_ops);

-- Event data
CREATE INDEX IF NOT EXISTS idx_events_data_gin
  ON events USING GIN (data jsonb_path_ops);

-- ════════════════════════════════════════════════════════════════════════════════
-- PARTIAL INDEXES (for common filtered queries)
-- ════════════════════════════════════════════════════════════════════════════════

-- Active properties only
CREATE INDEX IF NOT EXISTS idx_properties_active
  ON properties(organization_id, name) WHERE status = 'active';

-- Available calendar days
CREATE INDEX IF NOT EXISTS idx_calendar_available
  ON calendar(property_id, date) WHERE status = 'available';

-- Blocked calendar days
CREATE INDEX IF NOT EXISTS idx_calendar_blocked
  ON calendar(property_id, date) WHERE status = 'blocked';

-- Pending reservations
CREATE INDEX IF NOT EXISTS idx_reservations_pending
  ON reservations(organization_id, created_at) WHERE status = 'pending';

-- Confirmed reservations
CREATE INDEX IF NOT EXISTS idx_reservations_confirmed
  ON reservations(organization_id, check_in) WHERE status = 'confirmed';

-- Active quotes
CREATE INDEX IF NOT EXISTS idx_quotes_active
  ON quotes(organization_id, expires_at) WHERE status = 'active';

-- Pending payments
CREATE INDEX IF NOT EXISTS idx_payments_pending
  ON payments(organization_id, created_at) WHERE status = 'pending';

-- Published websites
CREATE INDEX IF NOT EXISTS idx_websites_published
  ON websites(subdomain, custom_domain) WHERE status = 'published';

-- ════════════════════════════════════════════════════════════════════════════════
-- GRANT PERMISSIONS
-- ════════════════════════════════════════════════════════════════════════════════

-- Grant usage on auth schema functions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.org_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.is_service_role() TO anon, authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ════════════════════════════════════════════════════════════════════════════════

-- Run these to verify RLS is working:
--
-- Check RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--
-- List all policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
--
-- Test tenant isolation (should return empty for wrong org):
-- SET request.jwt.claims = '{"org": "wrong_org_id", "role": "admin"}';
-- SELECT * FROM properties LIMIT 5;
-- RESET request.jwt.claims;
