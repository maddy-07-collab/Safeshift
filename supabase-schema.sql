-- ==============================================================================
-- FairShift 360: PostgreSQL / Supabase Schema & Row-Level Security (RLS) Policies
-- Aligned with UN SDG 8: Decent Work, Fair Pay, and Safer Workplaces
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE sector_type AS ENUM ('school', 'factory');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('worker', 'staff', 'supervisor', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('reported', 'investigating', 'in_remediation', 'resolved');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE shift_verification AS ENUM ('pending', 'verified', 'disputed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sector sector_type NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES TABLE (Linked with auth.users if Supabase Auth is enabled)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  sector sector_type NOT NULL,
  role user_role NOT NULL DEFAULT 'worker', -- Public registration restricted to worker/staff
  role_title TEXT NOT NULL,
  department TEXT NOT NULL,
  hourly_rate NUMERIC(10, 2) DEFAULT 200.00,
  phone TEXT,
  address TEXT, -- Sensitive personal data protected by strict RLS
  date_of_birth DATE,
  weekly_hours_cap INT DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SHIFTS & ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sector sector_type NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_minutes INT DEFAULT 0,
  regular_hours NUMERIC(5, 2) DEFAULT 0.00,
  overtime_hours NUMERIC(5, 2) DEFAULT 0.00,
  verification_status shift_verification DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAY RECORDS & DISPUTES
CREATE TABLE IF NOT EXISTS public.pay_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_regular_hours NUMERIC(6, 2) NOT NULL,
  total_overtime_hours NUMERIC(6, 2) NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  gross_earnings NUMERIC(12, 2) NOT NULL,
  epf_deduction NUMERIC(10, 2) DEFAULT 0.00,
  esi_deduction NUMERIC(10, 2) DEFAULT 0.00,
  net_payable NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pay_disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id),
  disputed_hours NUMERIC(5, 2) NOT NULL,
  disputed_amount NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'rejected')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAFE VOICE: INCIDENT & SAFETY REPORTS
CREATE TABLE IF NOT EXISTS public.safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_code TEXT UNIQUE NOT NULL,
  sector sector_type NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if anonymous
  is_anonymous BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  priority report_priority DEFAULT 'medium',
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  status report_status DEFAULT 'reported',
  assigned_supervisor_id UUID REFERENCES public.profiles(id),
  remediation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANONYMOUS WORKPLACE FEEDBACK BOX (Strictly masks sender identity)
CREATE TABLE IF NOT EXISTS public.anonymous_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sector sector_type NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Intentionally NO user_id column to guarantee absolute anonymity
);

-- 9. SKILL PASSPORT & CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FATIGUE LOGS & REST SAFEGUARDS
CREATE TABLE IF NOT EXISTS public.fatigue_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consecutive_shift_hours NUMERIC(4, 2) NOT NULL,
  weekly_accumulated_hours NUMERIC(5, 2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('safe', 'caution', 'danger')),
  alert_issued BOOLEAN DEFAULT FALSE,
  break_enforced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Sector & Role
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS TABLE (profile_id UUID, user_role user_role, user_sector sector_type) AS $$
BEGIN
  RETURN QUERY
  SELECT id, role, sector FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users see own profile; Admins see profiles within their sector
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view sector profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'supervisor') AND p.sector = profiles.sector
    )
  );

CREATE POLICY "Users update own contact details" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    -- Prevent users from escalating their own role or hourly rate
    role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()) AND
    hourly_rate = (SELECT hourly_rate FROM public.profiles WHERE user_id = auth.uid())
  );

-- Shifts: Workers view own; Supervisors & Admins manage sector shifts
CREATE POLICY "Workers view own shifts" ON public.shifts
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Supervisors and Admins view sector shifts" ON public.shifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('supervisor', 'admin') AND p.sector = shifts.sector
    )
  );

CREATE POLICY "Workers insert own shifts" ON public.shifts
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Supervisors and Admins update shifts" ON public.shifts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('supervisor', 'admin') AND p.sector = shifts.sector
    )
  );

-- Safety Reports: Workers can create; Workers see own; Supervisors/Admins see sector reports
CREATE POLICY "Anyone authenticated can file safety reports" ON public.safety_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Workers view own non-anonymous reports or search by ref code" ON public.safety_reports
  FOR SELECT USING (
    (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('supervisor', 'admin') AND p.sector = safety_reports.sector
    )
  );

-- Feedback: Write-only for workers; Supervisors/Admins read sector feedback (identities non-existent)
CREATE POLICY "Anyone can insert anonymous feedback" ON public.anonymous_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view sector feedback" ON public.anonymous_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('supervisor', 'admin') AND p.sector = anonymous_feedback.sector
    )
  );

-- Seed Initial Organizations
INSERT INTO public.organizations (name, sector, code) VALUES
  ('St. Jude Higher Academy', 'school', 'SCH-BLR-01'),
  ('Apex Precision Machining Plant #2', 'factory', 'FAC-HSR-02')
ON CONFLICT (code) DO NOTHING;
