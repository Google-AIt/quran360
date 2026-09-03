-- ===== Q360 programs (per course) =====
CREATE TABLE public.q360_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL UNIQUE REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  intro text,
  enabled boolean NOT NULL DEFAULT true,
  followup_days integer NOT NULL DEFAULT 30,
  min_group_raters integer NOT NULL DEFAULT 3,
  invite_valid_days integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.q360_programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_programs TO authenticated;
GRANT ALL ON public.q360_programs TO service_role;
ALTER TABLE public.q360_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_programs public read" ON public.q360_programs FOR SELECT USING (true);
CREATE POLICY "q360_programs admin write" ON public.q360_programs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER q360_programs_updated BEFORE UPDATE ON public.q360_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== competencies =====
CREATE TABLE public.q360_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.q360_programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.q360_competencies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_competencies TO authenticated;
GRANT ALL ON public.q360_competencies TO service_role;
ALTER TABLE public.q360_competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_competencies public read" ON public.q360_competencies FOR SELECT USING (true);
CREATE POLICY "q360_competencies admin write" ON public.q360_competencies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== behavioural items =====
CREATE TABLE public.q360_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid NOT NULL REFERENCES public.q360_competencies(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.q360_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_items TO authenticated;
GRANT ALL ON public.q360_items TO service_role;
ALTER TABLE public.q360_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_items public read" ON public.q360_items FOR SELECT USING (true);
CREATE POLICY "q360_items admin write" ON public.q360_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== measurement runs (pre / post / followup) =====
CREATE TABLE public.q360_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.q360_programs(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase text NOT NULL CHECK (phase IN ('pre','post','followup')),
  status text NOT NULL DEFAULT 'open',
  self_score numeric,
  others_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (program_id, user_id, phase)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_runs TO authenticated;
GRANT ALL ON public.q360_runs TO service_role;
ALTER TABLE public.q360_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_runs owner" ON public.q360_runs FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ===== invitations =====
CREATE TABLE public.q360_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.q360_runs(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  relation text NOT NULL,
  rater_label text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_invitations TO authenticated;
GRANT ALL ON public.q360_invitations TO service_role;
ALTER TABLE public.q360_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_invitations owner" ON public.q360_invitations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.q360_runs r WHERE r.id = run_id AND (r.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.q360_runs r WHERE r.id = run_id AND (r.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- ===== submissions (self or external rater) — private, server only =====
CREATE TABLE public.q360_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.q360_runs(id) ON DELETE CASCADE,
  invitation_id uuid REFERENCES public.q360_invitations(id) ON DELETE SET NULL,
  rater_kind text NOT NULL CHECK (rater_kind IN ('self','other')),
  relation text NOT NULL,
  average_score numeric,
  qualitative jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.q360_submissions TO service_role;
ALTER TABLE public.q360_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_submissions service only" ON public.q360_submissions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE public.q360_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.q360_submissions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.q360_items(id) ON DELETE CASCADE,
  score integer CHECK (score IS NULL OR (score BETWEEN 1 AND 5)),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.q360_answers TO service_role;
ALTER TABLE public.q360_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360_answers service only" ON public.q360_answers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX q360_runs_user_course_idx ON public.q360_runs (user_id, course_id);
CREATE INDEX q360_submissions_run_idx ON public.q360_submissions (run_id);
CREATE INDEX q360_answers_submission_idx ON public.q360_answers (submission_id);

-- ===== seed: فاستبقوا الخيرات =====
INSERT INTO public.q360_programs (course_id, title, intro)
SELECT id, 'Q360 — قياس أثر دورة فاستبقوا الخيرات',
  'قياس أثر التدريب على المبادرة واستثمار الوقت والتغلب على التحديات واستثمار نقاط القوة والقدوة وصناعة التحول.'
FROM public.courses WHERE slug = 'course-fastabiqu-alkhayrat';

WITH p AS (SELECT pr.id AS id FROM public.q360_programs pr JOIN public.courses c ON c.id = pr.course_id WHERE c.slug='course-fastabiqu-alkhayrat')
INSERT INTO public.q360_competencies (program_id, title, sort_order)
SELECT p.id, v.title, v.ord FROM p, (VALUES
  ('المبادرة والدخول في السباق',1),
  ('استثمار الوقت',2),
  ('التغلب على التحديات',3),
  ('معرفة واستثمار نقاط القوة',4),
  ('القدوة وصناعة التحول',5)
) AS v(title, ord);

INSERT INTO public.q360_items (competency_id, text, sort_order)
SELECT c.id, v.text, v.ord
FROM public.q360_competencies c
JOIN public.q360_programs pr ON pr.id = c.program_id
JOIN public.courses co ON co.id = pr.course_id AND co.slug='course-fastabiqu-alkhayrat'
JOIN (VALUES
 ('المبادرة والدخول في السباق','يبادر إلى الأعمال المهمة دون انتظار أن يطلب منه الآخرون ذلك.',1),
 ('المبادرة والدخول في السباق','يستغل الفرص المتاحة أمامه بدلاً من تأجيلها.',2),
 ('المبادرة والدخول في السباق','يتحمل مسؤولية البدء عندما يكون لديه القدرة على إحداث فرق.',3),
 ('استثمار الوقت','يحرص على استثمار وقته فيما يعود عليه وعلى الآخرين بالنفع.',1),
 ('استثمار الوقت','يقلل من التأجيل والتسويف في المهام المهمة.',2),
 ('استثمار الوقت','ينظم أولوياته بحيث ينجز الأعمال المهمة في وقتها.',3),
 ('التغلب على التحديات','لا يتوقف بسهولة عندما يواجه صعوبة أو عائقاً.',1),
 ('التغلب على التحديات','يبحث عن حلول عملية عندما تواجهه مشكلة.',2),
 ('التغلب على التحديات','يواصل العمل نحو هدفه رغم التحديات.',3),
 ('معرفة واستثمار نقاط القوة','يعرف نقاط القوة التي يتميز بها ويستخدمها في تحقيق أهدافه.',1),
 ('معرفة واستثمار نقاط القوة','يختار الأدوار أو الأعمال التي يستطيع أن يقدم فيها أفضل ما لديه.',2),
 ('معرفة واستثمار نقاط القوة','يعمل على تطوير نقاط ضعفه والاستفادة من إمكاناته.',3),
 ('القدوة وصناعة التحول','يؤثر في الآخرين من خلال سلوكه وليس فقط من خلال كلامه.',1),
 ('القدوة وصناعة التحول','يشجع من حوله على المبادرة والعمل الإيجابي.',2),
 ('القدوة وصناعة التحول','يساهم في إحداث تغيير إيجابي في محيطه.',3)
) AS v(comp, text, ord) ON v.comp = c.title;