
CREATE TABLE public.scan_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  scan_date date NOT NULL DEFAULT CURRENT_DATE,
  scan_count integer NOT NULL DEFAULT 1,
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (ip_address, scan_date)
);

ALTER TABLE public.scan_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits"
  ON public.scan_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
