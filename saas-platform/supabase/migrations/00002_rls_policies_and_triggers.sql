-- OmniCore ERP — Migration 00002
-- Fix RLS infinite recursion, add missing INSERT/UPDATE/DELETE policies,
-- and add auto-create user profile trigger.
--
-- HOW TO APPLY: Open Supabase Dashboard → SQL Editor → paste and run this file
-- AFTER running 00001_initial_schema.sql.

-- ============================================================
-- 0. SECURITY DEFINER HELPER FUNCTIONS
--    These bypass RLS to avoid infinite recursion.
-- ============================================================

-- Get organization IDs the current user belongs to (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TABLE(org_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
$$;

-- Check if user is a SUPER_ADMIN (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$;

-- Check if user is an owner of a specific org (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND is_owner = true
  );
$$;

-- Check if user is a member of a specific org (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- 1. FIX INFINITE RECURSION IN organization_members RLS
-- ============================================================

DROP POLICY IF EXISTS "Members can view org members" ON organization_members;

CREATE POLICY "Members can view org members"
  ON organization_members
  FOR SELECT
  USING (
    organization_id IN (SELECT public.get_user_org_ids())
  );

-- ============================================================
-- 2. FIX organizations SELECT POLICY (same recursion risk)
-- ============================================================

DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;

CREATE POLICY "Members can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    public.is_org_member(id)
  );

-- ============================================================
-- 3. USERS TABLE — INSERT / UPDATE / DELETE policies
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admin can update any user" ON users;
CREATE POLICY "Super admin can update any user"
  ON users FOR UPDATE
  USING (public.is_super_admin());

-- ============================================================
-- 4. ORGANIZATION MEMBERS — INSERT / UPDATE / DELETE
-- ============================================================

DROP POLICY IF EXISTS "Owners can insert org members" ON organization_members;
CREATE POLICY "Owners can insert org members"
  ON organization_members FOR INSERT
  WITH CHECK (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Owners can update org members" ON organization_members;
CREATE POLICY "Owners can update org members"
  ON organization_members FOR UPDATE
  USING (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Owners can delete org members" ON organization_members;
CREATE POLICY "Owners can delete org members"
  ON organization_members FOR DELETE
  USING (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Users can delete own membership" ON organization_members;
CREATE POLICY "Users can delete own membership"
  ON organization_members FOR DELETE
  USING (user_id = auth.uid() AND is_owner = false);

-- ============================================================
-- 5. ORGANIZATIONS — INSERT / UPDATE
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Owners can update organizations" ON organizations;
CREATE POLICY "Owners can update organizations"
  ON organizations FOR UPDATE
  USING (
    public.is_org_owner(id) OR public.is_super_admin()
  );

-- ============================================================
-- 6. WORKSPACES — INSERT / UPDATE / DELETE
-- ============================================================

DROP POLICY IF EXISTS "Owners can create workspaces" ON workspaces;
CREATE POLICY "Owners can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Members can update workspaces" ON workspaces;
CREATE POLICY "Members can update workspaces"
  ON workspaces FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

-- ============================================================
-- 7. NOTIFICATIONS — INSERT / UPDATE / DELETE
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 8. LOGIN HISTORY — INSERT
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own login history" ON login_history;
CREATE POLICY "Users can insert own login history"
  ON login_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 9. DEVICES — INSERT / UPDATE / DELETE
-- ============================================================

DROP POLICY IF EXISTS "Users can manage own devices" ON devices;
CREATE POLICY "Users can manage own devices"
  ON devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own devices" ON devices;
CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own devices" ON devices;
CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 10. API KEYS — INSERT / UPDATE / DELETE
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
CREATE POLICY "Users can insert own api keys"
  ON api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
CREATE POLICY "Users can update own api keys"
  ON api_keys FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;
CREATE POLICY "Users can delete own api keys"
  ON api_keys FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 11. BILLING — INSERT / UPDATE
-- ============================================================

DROP POLICY IF EXISTS "Owners can manage billing" ON billing;
CREATE POLICY "Owners can manage billing"
  ON billing FOR INSERT
  WITH CHECK (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Owners can update billing" ON billing;
CREATE POLICY "Owners can update billing"
  ON billing FOR UPDATE
  USING (
    public.is_org_owner(organization_id) OR public.is_super_admin()
  );

-- ============================================================
-- 12. MODULE TABLES — Organization-scoped INSERT/UPDATE/DELETE
--     Uses the SECURITY DEFINER is_org_member() helper
-- ============================================================

-- contacts
DROP POLICY IF EXISTS "Members can insert contacts" ON contacts;
CREATE POLICY "Members can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update contacts" ON contacts;
CREATE POLICY "Members can update contacts"
  ON contacts FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete contacts" ON contacts;
CREATE POLICY "Members can delete contacts"
  ON contacts FOR DELETE
  USING (public.is_org_member(organization_id));

-- leads
DROP POLICY IF EXISTS "Members can insert leads" ON leads;
CREATE POLICY "Members can insert leads"
  ON leads FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update leads" ON leads;
CREATE POLICY "Members can update leads"
  ON leads FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete leads" ON leads;
CREATE POLICY "Members can delete leads"
  ON leads FOR DELETE
  USING (public.is_org_member(organization_id));

-- deals
DROP POLICY IF EXISTS "Members can insert deals" ON deals;
CREATE POLICY "Members can insert deals"
  ON deals FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update deals" ON deals;
CREATE POLICY "Members can update deals"
  ON deals FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete deals" ON deals;
CREATE POLICY "Members can delete deals"
  ON deals FOR DELETE
  USING (public.is_org_member(organization_id));

-- employees
DROP POLICY IF EXISTS "Members can insert employees" ON employees;
CREATE POLICY "Members can insert employees"
  ON employees FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update employees" ON employees;
CREATE POLICY "Members can update employees"
  ON employees FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete employees" ON employees;
CREATE POLICY "Members can delete employees"
  ON employees FOR DELETE
  USING (public.is_org_member(organization_id));

-- products
DROP POLICY IF EXISTS "Members can insert products" ON products;
CREATE POLICY "Members can insert products"
  ON products FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update products" ON products;
CREATE POLICY "Members can update products"
  ON products FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete products" ON products;
CREATE POLICY "Members can delete products"
  ON products FOR DELETE
  USING (public.is_org_member(organization_id));

-- orders
DROP POLICY IF EXISTS "Members can insert orders" ON orders;
CREATE POLICY "Members can insert orders"
  ON orders FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update orders" ON orders;
CREATE POLICY "Members can update orders"
  ON orders FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete orders" ON orders;
CREATE POLICY "Members can delete orders"
  ON orders FOR DELETE
  USING (public.is_org_member(organization_id));

-- medicines
DROP POLICY IF EXISTS "Members can insert medicines" ON medicines;
CREATE POLICY "Members can insert medicines"
  ON medicines FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update medicines" ON medicines;
CREATE POLICY "Members can update medicines"
  ON medicines FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete medicines" ON medicines;
CREATE POLICY "Members can delete medicines"
  ON medicines FOR DELETE
  USING (public.is_org_member(organization_id));

-- patients
DROP POLICY IF EXISTS "Members can insert patients" ON patients;
CREATE POLICY "Members can insert patients"
  ON patients FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update patients" ON patients;
CREATE POLICY "Members can update patients"
  ON patients FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete patients" ON patients;
CREATE POLICY "Members can delete patients"
  ON patients FOR DELETE
  USING (public.is_org_member(organization_id));

-- appointments
DROP POLICY IF EXISTS "Members can insert appointments" ON appointments;
CREATE POLICY "Members can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update appointments" ON appointments;
CREATE POLICY "Members can update appointments"
  ON appointments FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete appointments" ON appointments;
CREATE POLICY "Members can delete appointments"
  ON appointments FOR DELETE
  USING (public.is_org_member(organization_id));

-- staff_members
DROP POLICY IF EXISTS "Members can insert staff" ON staff_members;
CREATE POLICY "Members can insert staff"
  ON staff_members FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update staff" ON staff_members;
CREATE POLICY "Members can update staff"
  ON staff_members FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete staff" ON staff_members;
CREATE POLICY "Members can delete staff"
  ON staff_members FOR DELETE
  USING (public.is_org_member(organization_id));

-- classes
DROP POLICY IF EXISTS "Members can insert classes" ON classes;
CREATE POLICY "Members can insert classes"
  ON classes FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update classes" ON classes;
CREATE POLICY "Members can update classes"
  ON classes FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete classes" ON classes;
CREATE POLICY "Members can delete classes"
  ON classes FOR DELETE
  USING (public.is_org_member(organization_id));

-- courses
DROP POLICY IF EXISTS "Members can insert courses" ON courses;
CREATE POLICY "Members can insert courses"
  ON courses FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update courses" ON courses;
CREATE POLICY "Members can update courses"
  ON courses FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete courses" ON courses;
CREATE POLICY "Members can delete courses"
  ON courses FOR DELETE
  USING (public.is_org_member(organization_id));

-- students
DROP POLICY IF EXISTS "Members can insert students" ON students;
CREATE POLICY "Members can insert students"
  ON students FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update students" ON students;
CREATE POLICY "Members can update students"
  ON students FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete students" ON students;
CREATE POLICY "Members can delete students"
  ON students FOR DELETE
  USING (public.is_org_member(organization_id));

-- teachers
DROP POLICY IF EXISTS "Members can insert teachers" ON teachers;
CREATE POLICY "Members can insert teachers"
  ON teachers FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update teachers" ON teachers;
CREATE POLICY "Members can update teachers"
  ON teachers FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete teachers" ON teachers;
CREATE POLICY "Members can delete teachers"
  ON teachers FOR DELETE
  USING (public.is_org_member(organization_id));

-- webhooks
DROP POLICY IF EXISTS "Members can insert webhooks" ON webhooks;
CREATE POLICY "Members can insert webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can update webhooks" ON webhooks;
CREATE POLICY "Members can update webhooks"
  ON webhooks FOR UPDATE
  USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Members can delete webhooks" ON webhooks;
CREATE POLICY "Members can delete webhooks"
  ON webhooks FOR DELETE
  USING (public.is_org_member(organization_id));

-- ============================================================
-- 13. AUDIT LOGS — INSERT policy
-- ============================================================

DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 14. AUTO-CREATE USER PROFILE ON AUTH SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    language,
    timezone,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'EMPLOYEE',
    COALESCE(NEW.raw_user_meta_data ->> 'language', 'fr'),
    COALESCE(NEW.raw_user_meta_data ->> 'timezone', 'Europe/Paris')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 15. AUTO-UPDATE USER updated_at ON CHANGE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with an updated_at column (excluding log/audit tables)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT IN ('audit_logs', 'login_history', 'notifications', 'webhook_deliveries', 'stock_movements', 'order_items')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I; CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t, t, t, t
    );
  END LOOP;
END;
$$;
