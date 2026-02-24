-- 1. Spots (Local spots database for recommendations)
CREATE TABLE public.spots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  prefecture text DEFAULT 'Kagoshima',
  area text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  place_id text,
  stay_minutes_default int DEFAULT 60,
  tags text[] DEFAULT '{}'::text[],
  recommendation_score int DEFAULT 0,
  note_local text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Trip Plans
CREATE TABLE public.trip_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL, -- To track anonymous users
  start_date date NOT NULL,
  days int NOT NULL,
  start_point_label text NOT NULL,
  start_point_lat double precision,
  start_point_lng double precision,
  mobility_preference text DEFAULT 'car',
  party_type text,
  budget_range text,
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Trip Plan Items
CREATE TABLE public.trip_plan_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_plan_id uuid REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  day_index int NOT NULL,
  sort_order int NOT NULL,
  spot_source text NOT NULL, -- 'places' | 'custom' | 'local_db'
  spot_ref_id text,
  spot_name text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  stay_minutes int DEFAULT 60,
  travel_mode text DEFAULT 'car',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Trip Plan Segments
CREATE TABLE public.trip_plan_segments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_plan_id uuid REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  from_item_id uuid REFERENCES public.trip_plan_items(id) ON DELETE CASCADE,
  to_item_id uuid REFERENCES public.trip_plan_items(id) ON DELETE CASCADE,
  route_mode text NOT NULL,
  distance_meters int NOT NULL,
  duration_seconds int NOT NULL,
  estimated_cost_min int,
  estimated_cost_max int,
  warning_flags text[] DEFAULT '{}'::text[],
  raw_route_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Consultation Leads
CREATE TABLE public.consultation_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_plan_id uuid REFERENCES public.trip_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  preferred_contact_method text,
  concerns_text text,
  consultation_score int DEFAULT 0,
  status text DEFAULT 'new', -- new/in_progress/done
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Route Cache (Optional for keeping GMP costs down)
CREATE TABLE public.route_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text UNIQUE NOT NULL,
  mode text NOT NULL,
  origin_lat double precision NOT NULL,
  origin_lng double precision NOT NULL,
  dest_lat double precision NOT NULL,
  dest_lng double precision NOT NULL,
  response_json jsonb NOT NULL,
  distance_meters int NOT NULL,
  duration_seconds int NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Basic RLS setup for MVP
-- Given MVP is mostly server-action driven for anons, we disable RLS for simplicity on server side,
-- OR enable it and just allow service_role to do everything via Server Actions.
-- Best practice for MVP: Enable RLS, let Server Actions (using Service Role Key) handle the logic.

ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plan_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to active spots for everybody (Anon)
CREATE POLICY "Allow public read active spots" ON public.spots FOR SELECT USING (is_active = true);

-- Optionally add an authenticated admin policy later.
-- For now, Server Actions using Service Role will bypass RLS.
