
create or replace function public.has_course_access(_user uuid, _course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    public.has_role(_user, 'admin')
    or exists (
      select 1
      from public.orders o
      cross join lateral jsonb_array_elements(o.items) it
      join public.products p on p.id = nullif(it->>'product_id','')::uuid
      where o.user_id = _user
        and o.status in ('paid','completed')
        and p.category in ('course','membership','facilitator','school')
    )
    or exists (select 1 from public.courses c where c.id = _course and c.price = 0)
  , false);
$$;

create table public.lesson_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant all on public.lesson_quiz_questions to service_role;
alter table public.lesson_quiz_questions enable row level security;
create policy "admins manage quiz questions" on public.lesson_quiz_questions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
grant select, insert, update, delete on public.lesson_quiz_questions to authenticated;

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.quiz_attempts to authenticated;
grant all on public.quiz_attempts to service_role;
alter table public.quiz_attempts enable row level security;
create policy "own attempts read" on public.quiz_attempts for select to authenticated using (user_id = auth.uid());
create policy "own attempts insert" on public.quiz_attempts for insert to authenticated with check (user_id = auth.uid());

create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
grant select, insert, update, delete on public.lesson_notes to authenticated;
grant all on public.lesson_notes to service_role;
alter table public.lesson_notes enable row level security;
create policy "own notes" on public.lesson_notes for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.lesson_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.course_lessons(id) on delete cascade,
  author_name text not null default 'متدرب',
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.lesson_questions to authenticated;
grant all on public.lesson_questions to service_role;
alter table public.lesson_questions enable row level security;
create policy "course members read questions" on public.lesson_questions for select to authenticated
  using (public.has_course_access(auth.uid(), course_id));
create policy "course members ask" on public.lesson_questions for insert to authenticated
  with check (user_id = auth.uid() and public.has_course_access(auth.uid(), course_id));
create policy "own question edit" on public.lesson_questions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own question delete" on public.lesson_questions for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.lesson_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.lesson_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'متدرب',
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.lesson_answers to authenticated;
grant all on public.lesson_answers to service_role;
alter table public.lesson_answers enable row level security;
create policy "course members read answers" on public.lesson_answers for select to authenticated
  using (exists (select 1 from public.lesson_questions q where q.id = question_id and public.has_course_access(auth.uid(), q.course_id)));
create policy "course members answer" on public.lesson_answers for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.lesson_questions q where q.id = question_id and public.has_course_access(auth.uid(), q.course_id)));
create policy "own answer delete" on public.lesson_answers for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  author_name text not null default 'متدرب',
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);
grant select on public.course_reviews to anon;
grant select, insert, update, delete on public.course_reviews to authenticated;
grant all on public.course_reviews to service_role;
alter table public.course_reviews enable row level security;
create policy "reviews are public" on public.course_reviews for select to anon, authenticated using (true);
create policy "members review" on public.course_reviews for insert to authenticated
  with check (user_id = auth.uid() and public.has_course_access(auth.uid(), course_id));
create policy "own review update" on public.course_reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own review delete" on public.course_reviews for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

insert into public.lesson_quiz_questions (lesson_id, question, options, correct_index, explanation, sort_order)
select l.id, q.question, q.options::jsonb, q.correct_index, q.explanation, q.sort_order
from public.course_lessons l
cross join lateral (
  values
    (1, 'ما الهدف الأساسي من درس «' || l.title || '»؟', '["الاكتفاء بالمعرفة النظرية","تحويل معنى الآية إلى سلوك عملي يومي","حفظ الآية فقط","الاستماع دون تطبيق"]', 1, 'منهجية «القرآن خطوة بخطوة» تقوم على الانتقال من المعرفة إلى التطبيق.', 1),
    (2, 'أي خطوة تُعدّ الأنسب لبدء التطبيق بعد هذا الدرس؟', '["تأجيل التطبيق حتى إنهاء الدورة","اختيار سلوك واحد صغير وتنفيذه اليوم","قراءة كتب إضافية فقط","مناقشة الدرس دون التزام"]', 1, 'التغيير يبدأ بخطوة صغيرة قابلة للقياس.', 2),
    (3, 'كيف نقيس أثر هذا الدرس؟', '["بالشعور العام فقط","بعدد ساعات المشاهدة","بمؤشر سلوكي قبل/بعد عبر تقييم Q360","بعدد الملاحظات المكتوبة"]', 2, 'Q360 يقيس التحول السلوكي قبل وبعد التطبيق.', 3)
) as q(sort_order, question, options, correct_index, explanation, s2)
where not exists (select 1 from public.lesson_quiz_questions x where x.lesson_id = l.id);
