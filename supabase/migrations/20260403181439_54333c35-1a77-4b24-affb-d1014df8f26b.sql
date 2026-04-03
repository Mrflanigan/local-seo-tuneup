CREATE TABLE public.scan_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  label text NOT NULL DEFAULT 'before',
  city text,
  overall_score integer NOT NULL,
  letter_grade text NOT NULL,
  report_json jsonb NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert snapshots"
ON public.scan_snapshots FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can read snapshots"
ON public.scan_snapshots FOR SELECT TO service_role
USING (true);

CREATE POLICY "Anyone can read snapshots"
ON public.scan_snapshots FOR SELECT TO anon, authenticated
USING (true);