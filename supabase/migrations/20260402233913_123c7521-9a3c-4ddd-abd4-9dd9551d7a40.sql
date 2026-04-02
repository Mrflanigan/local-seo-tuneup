
-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  city TEXT,
  report_json JSONB NOT NULL,
  wants_gameplan BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to insert leads
CREATE POLICY "Service role can insert leads"
  ON public.leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow edge functions (service role) to read leads
CREATE POLICY "Service role can read leads"
  ON public.leads
  FOR SELECT
  TO service_role
  USING (true);
