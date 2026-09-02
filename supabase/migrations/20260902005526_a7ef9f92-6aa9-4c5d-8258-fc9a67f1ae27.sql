-- ===== helpers =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.app_role AS ENUM ('admin','facilitator','school','trainee');

-- ===== profiles =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'trainee') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== settings (prices & content config) =====
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  label text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.settings TO authenticated;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== quran bags =====
CREATE TABLE public.quran_bags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  verse text,
  verse_reference text,
  concept text,
  mental_image text,
  principle text,
  outcome text,
  summary text,
  cover_url text,
  evidences jsonb NOT NULL DEFAULT '[]'::jsonb,
  activities jsonb NOT NULL DEFAULT '[]'::jsonb,
  applications jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessment jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quran_bags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quran_bags TO authenticated;
GRANT ALL ON public.quran_bags TO service_role;
ALTER TABLE public.quran_bags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bags public read" ON public.quran_bags FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bags admin write" ON public.quran_bags FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.bag_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid NOT NULL REFERENCES public.quran_bags(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bag_steps TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bag_steps TO authenticated;
GRANT ALL ON public.bag_steps TO service_role;
ALTER TABLE public.bag_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "steps public read" ON public.bag_steps FOR SELECT USING (true);
CREATE POLICY "steps admin write" ON public.bag_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== academy =====
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid REFERENCES public.quran_bags(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  verse text,
  description text,
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_url text,
  price numeric NOT NULL DEFAULT 300,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses public read" ON public.courses FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "courses admin write" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_number int NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  duration_minutes int,
  activity text,
  challenge text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_lessons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons public read" ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "lessons admin write" ON public.course_lessons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollments" ON public.enrollments FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson progress" ON public.lesson_progress FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  kind text NOT NULL DEFAULT 'course',
  program_title text NOT NULL,
  recipient_name text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates verify read" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "certificates admin write" ON public.certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== Q360 =====
CREATE TABLE public.q360_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bag_id uuid REFERENCES public.quran_bags(id) ON DELETE CASCADE,
  question_number int NOT NULL DEFAULT 1,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.q360_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.q360_questions TO authenticated;
GRANT ALL ON public.q360_questions TO service_role;
ALTER TABLE public.q360_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "q360 questions read" ON public.q360_questions FOR SELECT USING (true);
CREATE POLICY "q360 questions admin write" ON public.q360_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.q360_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bag_id uuid REFERENCES public.quran_bags(id) ON DELETE SET NULL,
  phase text NOT NULL DEFAULT 'pre',
  status text NOT NULL DEFAULT 'open',
  average_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_assessments TO authenticated;
GRANT ALL ON public.q360_assessments TO service_role;
ALTER TABLE public.q360_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own q360 assessments" ON public.q360_assessments FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.q360_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.q360_assessments(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.q360_questions(id) ON DELETE CASCADE,
  rater_type text NOT NULL DEFAULT 'self',
  score int NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.q360_responses TO authenticated;
GRANT ALL ON public.q360_responses TO service_role;
ALTER TABLE public.q360_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own q360 responses" ON public.q360_responses FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.q360_assessments a WHERE a.id = assessment_id AND (a.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
WITH CHECK (EXISTS (SELECT 1 FROM public.q360_assessments a WHERE a.id = assessment_id AND a.user_id = auth.uid()));

-- ===== schools =====
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  city text,
  contact_email text,
  contact_phone text,
  teachers_count int NOT NULL DEFAULT 20,
  students_count int NOT NULL DEFAULT 0,
  active_bags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own school" ON public.schools FOR ALL TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.school_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  member_type text NOT NULL DEFAULT 'student',
  grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_members TO authenticated;
GRANT ALL ON public.school_members TO service_role;
ALTER TABLE public.school_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "school members access" ON public.school_members FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.schools s WHERE s.id = school_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
WITH CHECK (EXISTS (SELECT 1 FROM public.schools s WHERE s.id = school_id AND (s.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- ===== store =====
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'course',
  price numeric NOT NULL DEFAULT 0,
  billing_period text NOT NULL DEFAULT 'one_time',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  provider text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'pending',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments" ON public.payments FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

-- ===== content =====
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  category text NOT NULL DEFAULT 'تطبيقات قرآنية',
  author text,
  cover_url text,
  seo_title text,
  seo_description text,
  keywords text[],
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.blog_posts FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "posts admin write" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.impact_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  person_name text,
  person_role text,
  story text NOT NULL,
  bag_title text,
  change_percent int,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.impact_stories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.impact_stories TO authenticated;
GRANT ALL ON public.impact_stories TO service_role;
ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories public read" ON public.impact_stories FOR SELECT USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "stories admin write" ON public.impact_stories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== seed: settings/prices =====
INSERT INTO public.settings (key, value, label) VALUES
('price_course', '300'::jsonb, 'سعر الدورة الإلكترونية'),
('price_trainee_membership', '500'::jsonb, 'عضوية المتدرب السنوية'),
('price_facilitator_membership', '2400'::jsonb, 'عضوية الميسّر السنوية'),
('price_q360', '50'::jsonb, 'خدمة Q360'),
('price_school_student', '240'::jsonb, 'اشتراك الطالب السنوي'),
('price_school_teacher', '2400'::jsonb, 'اشتراك المعلم السنوي'),
('school_min_teachers', '20'::jsonb, 'الحد الأدنى لعدد المعلمين'),
('school_bags_count', '5'::jsonb, 'عدد الحقائب في برنامج المدارس'),
('methodology_video_url', '"https://www.youtube.com/embed/ScMzIvxBSi4"'::jsonb, 'رابط فيديو المنهجية');

-- ===== seed: bags =====
INSERT INTO public.quran_bags (slug, title, verse, verse_reference, concept, mental_image, principle, outcome, summary, sort_order, evidences, activities, applications, challenges, assessment) VALUES
('fastabiqu-alkhayrat','فاستبقوا الخيرات','﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾','البقرة: 148','الاستباقية','الاستباقية','الإنسان مخير وقادر على إحداث النتيجة؛ فإذا شاء تقدم وإذا شاء تأخر.','شخص استباقي للخيرات','حقيبة تدريبية تحوّل مفهوم الاستباقية القرآني إلى خمس خطوات عملية قابلة للتدريب والقياس.',1,
 '["﴿وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ﴾ (آل عمران: 133)","﴿أُولَٰئِكَ يُسَارِعُونَ فِي الْخَيْرَاتِ وَهُمْ لَهَا سَابِقُونَ﴾ (المؤمنون: 61)","قال ﷺ: «بادروا بالأعمال»"]'::jsonb,
 '["نشاط: سجل ثلاث فرص خير مرّت عليك ولم تبادر إليها","نشاط جماعي: لوحة دائرة التأثير ودائرة الاهتمام","نشاط: خريطة مسؤولياتي اليومية"]'::jsonb,
 '["تطبيق أسبوعي: مبادرة خير واحدة يوميًا دون أن يُطلب منك","تطبيق أسري: مبادرة أسبوعية داخل البيت","تطبيق مهني: حل مشكلة في العمل قبل تصاعدها"]'::jsonb,
 '["تحدي 7 أيام: لا تنتظر أن يُطلب منك","تحدي: حوّل شكوى إلى مبادرة","تحدي: ابدأ مشروع خير صغير خلال 30 يومًا"]'::jsonb,
 '["هل بادرت اليوم دون طلب؟","هل ركزت على ما تستطيع تغييره؟","هل تحملت مسؤولية نتيجة سلبية بدل تبريرها؟"]'::jsonb),
('wajadilhum-billati-hiya-ahsan','وجادلهم بالتي هي أحسن','﴿وَجَادِلْهُم بِالَّتِي هِيَ أَحْسَنُ﴾','النحل: 125','الحوار الراقي',NULL,NULL,NULL,'حقيبة تدريبية لبناء مهارات الحوار والإقناع بالأسلوب الأحسن.',2,'[]','[]','[]','[]','[]'),
('qad-aflaha-man-tazakka','قد أفلح من تزكى','﴿قَدْ أَفْلَحَ مَن تَزَكَّىٰ﴾','الأعلى: 14','التزكية والنمو الذاتي',NULL,NULL,NULL,'حقيبة تدريبية لتزكية النفس وبناء برنامج نمو ذاتي مستمر.',3,'[]','[]','[]','[]','[]'),
('wakana-bayna-thalika-qawama','وكان بين ذلك قوامًا','﴿وَكَانَ بَيْنَ ذَٰلِكَ قَوَامًا﴾','الفرقان: 67','الاتزان والاعتدال',NULL,NULL,NULL,'حقيبة تدريبية للاتزان في الإنفاق والوقت والعلاقات.',4,'[]','[]','[]','[]','[]'),
('ruhamaa-baynahum','رحماء بينهم','﴿رُحَمَاءُ بَيْنَهُمْ﴾','الفتح: 29','الرحمة في العلاقات',NULL,NULL,NULL,'حقيبة تدريبية لبناء الرحمة والتراحم في البيت والعمل.',5,'[]','[]','[]','[]','[]'),
('wal-asr','والعصر إن الإنسان لفي خسر','﴿وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ﴾','العصر: 1-2','إدارة الوقت',NULL,NULL,NULL,'حقيبة تدريبية لإدارة الوقت وحماية العمر من الخسارة.',6,'[]','[]','[]','[]','[]'),
('hatta-yughayyiru-ma-bianfusihim','حتى يغيروا ما بأنفسهم','﴿حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾','الرعد: 11','قيادة التغيير',NULL,NULL,NULL,'حقيبة تدريبية لإحداث التغيير الذاتي والمؤسسي.',7,'[]','[]','[]','[]','[]'),
('walkazimeen-alghayz','والكاظمين الغيظ','﴿وَالْكَاظِمِينَ الْغَيْظَ﴾','آل عمران: 134','ضبط الانفعال',NULL,NULL,NULL,'حقيبة تدريبية لإدارة الغضب وضبط الانفعالات.',8,'[]','[]','[]','[]','[]'),
('faidha-faraghta-fansab','فإذا فرغت فانصب','﴿فَإِذَا فَرَغْتَ فَانصَبْ﴾','الشرح: 7','الاستمرارية والإنتاجية',NULL,NULL,NULL,'حقيبة تدريبية للاستمرارية وعدم التوقف بعد الإنجاز.',9,'[]','[]','[]','[]','[]');

INSERT INTO public.bag_steps (bag_id, step_number, title, description)
SELECT id, s.n, s.t, s.d FROM public.quran_bags, (VALUES
 (1,'قبول وتحمل المسؤولية','الاعتراف بأنني مسؤول عن اختياراتي ونتائجها دون تبرير أو إلقاء اللوم.'),
 (2,'ادخل السباق','الانتقال من المشاهدة إلى المشاركة الفعلية في ميادين الخير.'),
 (3,'الاستجابة وفق القيم للتحديات','أن تكون استجابتي نابعة من قيمي لا من ردود أفعال الآخرين.'),
 (4,'التركيز على دائرة التأثير لا دائرة الاهتمام','توجيه الجهد إلى ما أستطيع تغييره فعليًا.'),
 (5,'كن صانعًا للتحولات','الانتقال من التأثر بالواقع إلى صناعة واقع جديد.')
) AS s(n,t,d) WHERE slug = 'fastabiqu-alkhayrat';

INSERT INTO public.courses (bag_id, slug, title, verse, description, objectives, price, sort_order)
SELECT id,'course-fastabiqu-alkhayrat','دورة فاستبقوا الخيرات','﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾','دورة إلكترونية من خمسة دروس تدرّبك على تحويل مفهوم الاستباقية إلى سلوك يومي قابل للقياس.',
 '["ترسيخ التصور الذهني الصحيح للاستباقية","إتقان الخطوات العملية الخمس","تحويل الخطوات إلى ممارسات يومية","قياس أثر التغير السلوكي عبر Q360"]'::jsonb, 300, 1
FROM public.quran_bags WHERE slug='fastabiqu-alkhayrat';

INSERT INTO public.course_lessons (course_id, lesson_number, title, description, duration_minutes, activity, challenge)
SELECT id, v.n, v.t, v.d, v.m, v.a, v.c FROM public.courses, (VALUES
 (1,'التصور الذهني للاستباقية','المفهوم القرآني للاستباقية والمبدأ الذي تقوم عليه.',18,'اكتب تعريفك الخاص للاستباقية','لاحظ ثلاث فرص خير خلال يومك'),
 (2,'قبول وتحمل المسؤولية','كيف تنتقل من التبرير إلى المسؤولية.',22,'قائمة مسؤولياتي','يوم بلا أعذار'),
 (3,'ادخل السباق واستجب وفق قيمك','من المشاهدة إلى المشاركة، والاستجابة القيمية.',25,'خريطة ميادين الخير','بادر بعمل خير دون طلب'),
 (4,'دائرة التأثير لا دائرة الاهتمام','توجيه الطاقة نحو ما يمكن تغييره.',20,'ارسم دائرتيك','حوّل شكوى إلى مبادرة'),
 (5,'كن صانعًا للتحولات','بناء المبادرات وقياس الأثر.',24,'خطة مبادرة 30 يومًا','أطلق مبادرتك وقس أثرها')
) AS v(n,t,d,m,a,c) WHERE slug='course-fastabiqu-alkhayrat';

INSERT INTO public.q360_questions (bag_id, question_number, text)
SELECT id, q.n, q.t FROM public.quran_bags, (VALUES
 (1,'يبادر إلى إنجاز الأعمال النافعة دون انتظار أن يُطلب منه ذلك.'),
 (2,'يتحمل مسؤولية نتائج أعماله دون إلقاء اللوم على الآخرين.'),
 (3,'يستجيب للمواقف الصعبة وفق قيمه لا وفق انفعاله.'),
 (4,'يركز جهده على ما يستطيع تغييره فعليًا.'),
 (5,'يطلق مبادرات عملية تُحدث تحسينًا ملموسًا من حوله.')
) AS q(n,t) WHERE slug='fastabiqu-alkhayrat';

INSERT INTO public.products (slug, title, description, category, price, billing_period, sort_order) VALUES
('course-single','دورة إلكترونية','دورة واحدة من دورات الأكاديمية مرتبطة بحقيبة قرآنية.','course',300,'one_time',1),
('trainee-membership','عضوية المتدرب','وصول كامل لجميع دورات الأكاديمية لمدة سنة.','membership',500,'yearly',2),
('facilitator-membership','عضوية الميسّر','المنصة والمواد وأدلة الميسّر والأدوات التدريبية والتحديثات.','membership',2400,'yearly',3),
('facilitator-qualification','تأهيل الميسّرين','برنامج تأهيل واعتماد ميسّر الحقائب القرآنية.','facilitator',2400,'one_time',4),
('facilitator-bag','حقيبة الميسّر','حقيبة المدرب/المعلم مع الأدلة والأنشطة.','facilitator',2400,'one_time',5),
('q360','Q360 — قياس الأثر القرآني','نظام تقييم شامل لقياس أثر التدريب على السلوك.','service',50,'one_time',6),
('school-student','اشتراك الطالب — برنامج المدارس','اشتراك سنوي للطالب ضمن برنامج المدارس.','school',240,'yearly',7),
('school-teacher','اشتراك المعلم — برنامج المدارس','اشتراك سنوي للمعلم ضمن برنامج المدارس.','school',2400,'yearly',8);

INSERT INTO public.blog_posts (slug, title, excerpt, content, category, author, seo_title, seo_description, keywords) VALUES
('min-marifat-alquran-ila-tatbiqih','من معرفة القرآن إلى تطبيق القرآن','الفجوة الحقيقية ليست في المعرفة، بل في الانتقال من الفهم إلى السلوك.','كثير من البرامج القرآنية تتوقف عند الفهم، بينما المطلوب أن يتحول المفهوم إلى تصور ذهني صحيح، ثم إلى خطوات عملية، ثم إلى تدريب وتطبيق، ثم إلى سلوك يُقاس أثره.','تطبيقات قرآنية','فريق القرآن خطوة بخطوة','من معرفة القرآن إلى تطبيق القرآن','كيف ننتقل بالقرآن من المعرفة إلى السلوك عبر منهجية تطبيقية واضحة.','{"تطبيق القرآن","التربية القرآنية","السلوك القرآني"}'),
('altasawwur-aldhihni-alsahih','التصور الذهني الصحيح: نقطة البداية','التصور الذهني هو المبدأ الذي يقوم عليه السلوك.','استخراج الصورة الذهنية الصحيحة من الآية هو أساس المنهجية، لأن السلوك ابن التصور.','التصورات الذهنية','فريق القرآن خطوة بخطوة','التصور الذهني الصحيح في التربية القرآنية','لماذا يبدأ التغيير السلوكي من التصور الذهني المستخرج من الآية.','{"التصورات الذهنية","التربية القرآنية"}'),
('q360-qiyas-alathar','Q360: كيف نقيس أثر القرآن في السلوك؟','قياس ما تغير في الإنسان، لا ما تعلّمه فقط.','Q360 أداة لقياس التغير السلوكي عبر التقييم الذاتي وتقييم المحيطين قبل التدريب وبعده وبعد شهر من التطبيق.','دراسات','فريق القرآن خطوة بخطوة','Q360 لقياس الأثر القرآني','نظام Q360 لقياس أثر التدريب القرآني على السلوك.','{"Q360","قياس الأثر القرآني"}');

INSERT INTO public.impact_stories (slug, title, person_name, person_role, story, bag_title, change_percent) VALUES
('mubadara-fi-hayy','من متفرج إلى صانع مبادرة','عبدالله السالم','متدرب','بعد تدريب حقيبة فاستبقوا الخيرات بدأت مبادرة أسبوعية لتنظيف الحي، وتغيّرت نظرتي من الشكوى إلى المبادرة.','فاستبقوا الخيرات',62),
('madrasa-alnoor','مدرسة النور: ثقافة قرآنية داخل الفصول','أ. سارة العتيبي','قائدة مدرسة','طبقنا خمس حقائب مع 24 معلمًا و860 طالبًا، وارتفع مؤشر السلوك التعاوني بشكل ملحوظ خلال فصل دراسي واحد.','برنامج المدارس',48),
('muyassir-tahawwul','ميسّر يقود التحول','أ. خالد الحربي','ميسّر معتمد','التأهيل نقلني من ناقل معلومة إلى قائد تطبيق يتابع أثر المتدربين أسبوعًا بأسبوع.','حقيبة الميسّر',55);