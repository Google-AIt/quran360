CREATE TABLE public.facilitator_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text NOT NULL,
  city text,
  phone text,
  experience text,
  motivation text,
  stage int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.facilitator_applications TO authenticated;
GRANT ALL ON public.facilitator_applications TO service_role;
ALTER TABLE public.facilitator_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own facilitator application" ON public.facilitator_applications FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER facilitator_applications_updated BEFORE UPDATE ON public.facilitator_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "certificates verify read" ON public.certificates;
REVOKE SELECT ON public.certificates FROM anon;
CREATE POLICY "own certificates read" ON public.certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));