CREATE TABLE public.crew_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crew_name TEXT NOT NULL,
  requester_name TEXT,
  email TEXT,
  department TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crew_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert crew requests" ON public.crew_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read crew requests" ON public.crew_requests FOR SELECT USING (true);