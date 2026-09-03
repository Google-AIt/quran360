import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getCourse } from "@/lib/public.functions";
import { issueCourseCertificate } from "@/lib/certificates.functions";
import { getCourseAccess, enrollInCourse } from "@/lib/learn.functions";
import { lessonPoster, lessonStage } from "@/lib/lesson-media";
import { BagObjectives } from "@/components/site/BagObjectives";
import { LessonQuiz } from "@/components/course/LessonQuiz";
import { LessonNotes } from "@/components/course/LessonNotes";
import { LessonQA } from "@/components/course/LessonQA";
import { CourseReviews } from "@/components/course/CourseReviews";

const courseQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: () => getCourse({ data: { slug } }),
  });

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(courseQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "الدورة غير متاحة" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.course.title} | أكاديمية القرآن خطوة بخطوة`;
    const d =
      loaderData.course.description ??
      "دورة تفاعلية: مشغّل فيديو، اختبارات، ملاحظات، أسئلة وأجوبة، تتبع تقدم وشهادة إتمام.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => (
    <div className="p-16 text-center text-muted-foreground">تعذّر تحميل الدورة، حاول التحديث.</div>
  ),
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <p className="text-muted-foreground">هذه الدورة غير موجودة.</p>
      <Link to="/academy" className="mt-4 inline-block text-primary underline">
        عودة إلى الأكاديمية
      </Link>
    </div>
  ),
  component: Page,
});

type Tab = "overview" | "quiz" | "qa" | "notes" | "reviews";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "نظرة عامة" },
  { id: "quiz", label: "الاختبار" },
  { id: "qa", label: "أسئلة وأجوبة" },
  { id: "notes", label: "ملاحظاتي" },
  { id: "reviews", label: "التقييمات" },
];

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(slug));
  const course = data!.course;
  const lessons = data!.lessons;

  const [session, setSession] = useState<Session | null>(null);
  const [access, setAccess] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [certNumber, setCertNumber] = useState<string | null>(null);
  const [certError, setCertError] = useState("");
  const [accessError, setAccessError] = useState("");

  const issueCert = useServerFn(issueCourseCertificate);
  const checkAccess = useServerFn(getCourseAccess);
  const enrollFn = useServerFn(enrollInCourse);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: s }) => setSession(s.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAccess(false);
      setEnrolled(false);
      setDone([]);
      return;
    }
    const uid = session.user.id;
    void (async () => {
      const [state, { data: prog }] = await Promise.all([
        checkAccess({ data: { courseId: course.id } }),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", uid).eq("completed", true),
      ]);
      setAccess(state.access);
      setEnrolled(state.enrolled);
      const ids = lessons.map((l) => l.id);
      setDone((prog ?? []).map((p) => p.lesson_id).filter((id): id is string => !!id && ids.includes(id)));
    })();
  }, [session, course.id, lessons, checkAccess]);

  const percent = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;
  const unlocked = access && enrolled;
  const authorName = useMemo(
    () =>
      (session?.user.user_metadata?.["full_name"] as string | undefined) ??
      session?.user.email?.split("@")[0] ??
      "متدرب",
    [session],
  );

  async function issue() {
    setBusy(true);
    setCertError("");
    const res = await issueCert({ data: { courseId: course.id } });
    if (res.ok) setCertNumber(res.number);
    else setCertError(res.error);
    setBusy(false);
  }

  async function enroll() {
    if (!session) return;
    setBusy(true);
    setAccessError("");
    const res = await enrollFn({ data: { courseId: course.id } });
    if (res.ok) {
      setAccess(true);
      setEnrolled(true);
    } else setAccessError(res.error);
    setBusy(false);
  }

  async function markDone(lessonId: string, value: boolean) {
    if (!session || !unlocked) return;
    const uid = session.user.id;
    const next = value ? [...new Set([...done, lessonId])] : done.filter((d) => d !== lessonId);
    setDone(next);
    if (value) {
      await supabase
        .from("lesson_progress")
        .upsert(
          { user_id: uid, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
          { onConflict: "user_id,lesson_id" },
        );
    } else {
      await supabase.from("lesson_progress").delete().eq("user_id", uid).eq("lesson_id", lessonId);
    }
    const pct = lessons.length ? Math.round((next.length / lessons.length) * 100) : 0;
    await supabase
      .from("enrollments")
      .update({ progress: pct, completed_at: pct === 100 ? new Date().toISOString() : null })
      .eq("user_id", uid)
      .eq("course_id", course.id);
  }

  const lesson = lessons[active];
  const stage = lesson ? lessonStage(lesson.lesson_number) : null;
  const isDone = lesson ? done.includes(lesson.id) : false;

  return (
    <div className="bg-background">
      {/* شريط علوي داكن على نمط منصات التعلم */}
      <div className="bg-primary-deep text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <nav className="text-xs text-primary-foreground/70">
              <Link to="/academy" className="hover:text-accent">
                الأكاديمية
              </Link>
              <span className="mx-2">/</span>
              <span>{course.title}</span>
            </nav>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{course.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-xs text-primary-foreground/70">نسبة الإنجاز</p>
              <p className="font-display text-xl font-bold text-accent">{percent}%</p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-primary-foreground/20">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl gap-8 px-4 py-8 lg:grid lg:grid-cols-[1fr_340px]">
        {/* المشغّل والمحتوى */}
        <div>
          {lesson ? (
            <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="relative aspect-video w-full overflow-hidden bg-primary-deep">
                <img
                  src={lessonPoster(lesson.lesson_number)}
                  alt={`صورة توضيحية لدرس ${lesson.lesson_number}: ${lesson.title}`}
                  width={1024}
                  height={576}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {unlocked && lesson.video_url ? (
                  <iframe
                    src={lesson.video_url}
                    title={`فيديو ${lesson.title}`}
                    className="relative z-10 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-primary-deep/75 p-6 text-center text-primary-foreground">
                    {unlocked ? (
                      <p className="text-sm">فيديو الدرس يُضاف قريبًا من لوحة الإدارة.</p>
                    ) : (
                      <>
                        <span className="text-3xl">🔒</span>
                        <p className="text-sm">محتوى الدورة متاح بعد الشراء.</p>
                        <Link
                          to="/store"
                          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground"
                        >
                          اشترِ الدورة من المتجر
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-accent-foreground">
                    {stage?.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{lesson.duration_minutes} دقيقة</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-primary-deep">
                  الدرس {lesson.lesson_number}: {lesson.title}
                </h2>

                {/* أزرار التحكم */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {!session ? (
                    <Link
                      to="/account"
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                    >
                      سجّل الدخول لبدء التعلم
                    </Link>
                  ) : !access ? (
                    <Link
                      to="/store"
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                    >
                      اشترِ الدورة لفتح المحتوى
                    </Link>
                  ) : !enrolled ? (
                    <button
                      onClick={() => void enroll()}
                      disabled={busy}
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      ابدأ الدورة
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => void markDone(lesson.id, !isDone)}
                        className={`rounded-xl px-6 py-3 text-sm font-medium ${
                          isDone
                            ? "border border-primary text-primary"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isDone ? "تم إكمال الدرس ✓" : "تحديد كمكتمل والانتقال"}
                      </button>
                      {active < lessons.length - 1 && (
                        <button
                          onClick={() => {
                            setActive(active + 1);
                            setTab("overview");
                          }}
                          className="rounded-xl border border-border px-6 py-3 text-sm text-primary-deep"
                        >
                          الدرس التالي ←
                        </button>
                      )}
                    </>
                  )}
                  {accessError && <span className="text-sm text-destructive">{accessError}</span>}
                </div>

                {/* التبويبات التفاعلية */}
                <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`rounded-full px-4 py-2 text-sm transition-colors ${
                        tab === t.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/70 text-primary-deep hover:bg-secondary"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {tab === "overview" && (
                    <div>
                      <p className="leading-8 text-muted-foreground">{lesson.description ?? stage?.caption}</p>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-secondary/70 p-5">
                          <h3 className="font-display font-bold text-primary-deep">النشاط التطبيقي</h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {lesson.activity ?? "نشاط تطبيقي يُضاف مع محتوى الدرس."}
                          </p>
                        </div>
                        <div className="rounded-xl bg-accent/15 p-5">
                          <h3 className="font-display font-bold text-primary-deep">التحدي العملي</h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {lesson.challenge ?? "تحدٍ عملي يُضاف مع محتوى الدرس."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab !== "overview" && tab !== "reviews" && !unlocked && (
                    <p className="rounded-2xl bg-secondary/70 p-5 text-sm text-muted-foreground">
                      هذا القسم التفاعلي متاح للمشتركين في الدورة بعد الشراء.
                    </p>
                  )}

                  {tab === "quiz" && unlocked && (
                    <LessonQuiz
                      lessonId={lesson.id}
                      courseId={course.id}
                      onPassed={() => void markDone(lesson.id, true)}
                    />
                  )}

                  {tab === "qa" && unlocked && session && (
                    <LessonQA
                      courseId={course.id}
                      lessonId={lesson.id}
                      userId={session.user.id}
                      authorName={authorName}
                    />
                  )}

                  {tab === "notes" && unlocked && session && (
                    <LessonNotes lessonId={lesson.id} userId={session.user.id} />
                  )}

                  {tab === "reviews" && (
                    <CourseReviews
                      courseId={course.id}
                      userId={session?.user.id ?? null}
                      authorName={authorName}
                      canReview={unlocked}
                    />
                  )}
                </div>
              </div>
            </article>
          ) : (
            <p className="rounded-2xl bg-secondary/70 p-6 text-muted-foreground">دروس هذه الدورة تُضاف قريبًا.</p>
          )}

          <section className="mt-10">
            <p className="ayah text-lg text-primary">{course.verse}</p>
            <p className="mt-3 max-w-3xl leading-9 text-muted-foreground">{course.description}</p>
            <BagObjectives className="mt-8" />
          </section>

          {/* ===== Q360 — قياس أثر التدريب ===== */}
          <section className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8">
            <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-accent-foreground">
              Q360 — قياس أثر التدريب
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-primary-deep">
              هل ظهر أثر ما تعلمته في سلوكك كما يراه من حولك؟
            </h2>
            <p className="mt-3 leading-9 text-muted-foreground">
              لا نكتفي بأن تسأل نفسك: هل استفدت من الدورة؟ بل نساعدك على معرفة أثر التدريب في سلوكك. قبل التدريب
              تقيس مستوى ممارستك للمهارات المستهدفة، وبعد التدريب تعيد القياس وتقارن النتائج، ويمكنك أيضًا دعوة
              أشخاص يعرفونك للمشاركة في التقييم.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-5">
              {["قياس قبلي", "التدريب والتطبيق", "قياس بعدي", "مقارنة النتائج", "تقرير الأثر"].map((s, i) => (
                <div key={s} className="rounded-2xl bg-secondary/60 p-4 text-center text-sm text-primary-deep">
                  <span className="font-display text-lg font-bold text-primary">{i + 1}</span>
                  <p className="mt-1">{s}</p>
                </div>
              ))}
            </div>

            <ul className="mt-6 grid gap-2 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
              {[
                "مستوى أدائك قبل وبعد التدريب",
                "أكثر المهارات تطوراً",
                "الجوانب التي تحتاج إلى مزيد من التطوير",
                "الفرق بين تقييمك لنفسك وتقييم الآخرين",
                "التغيرات التي لاحظها من حولك",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-gold">•</span>
                  {t}
                </li>
              ))}
            </ul>

            <Link
              to="/q360/course/$slug"
              params={{ slug }}
              className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              ابدأ قياس أثر التدريب
            </Link>
          </section>

        </div>

        {/* قائمة الدروس الجانبية */}
        <aside className="mt-8 space-y-6 lg:mt-0">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {done.length} من {lessons.length} دروس
              </span>
              <span className="font-display text-lg font-bold text-primary">{percent}%</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-l from-primary to-accent transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            {percent === 100 && (
              <div className="mt-4 rounded-xl border border-accent/30 bg-gold-soft p-4 text-sm text-accent-foreground">
                <p>
                  أتممت الدورة.{" "}
                  <Link to="/q360/course/$slug" params={{ slug }} className="text-primary underline">
                    انتقل إلى القياس البعدي Q360
                  </Link>{" "}
                  لقياس أثر التطبيق.
                </p>
                {certNumber ? (
                  <Link
                    to="/verify/$number"
                    params={{ number: certNumber }}
                    className="mt-3 inline-block text-primary underline"
                  >
                    عرض شهادتك ({certNumber})
                  </Link>
                ) : (
                  <button
                    onClick={() => void issue()}
                    disabled={busy}
                    className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                  >
                    إصدار شهادة الإتمام
                  </button>
                )}
                {certError && <p className="mt-2 text-destructive">{certError}</p>}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-4">
              <p className="font-display font-bold text-primary-deep">قائمة الدروس</p>
              <span className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
                {lessons.length} دروس
              </span>
            </div>
            <ol className="divide-y divide-border">
              {lessons.map((l, i) => {
                const isCompleted = done.includes(l.id);
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => {
                        setActive(i);
                        setTab("overview");
                      }}
                      className={`flex w-full items-start gap-4 px-4 py-4 text-right text-sm transition-colors ${
                        i === active
                          ? "border-r-4 border-accent bg-primary/5"
                          : "hover:bg-secondary/50"
                      } ${unlocked || isCompleted ? "" : "opacity-80"}`}
                    >
                      <span
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : i === active
                              ? "bg-primary-deep text-primary-foreground"
                              : "border-2 border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : unlocked ? l.lesson_number : "🔒"}
                      </span>
                      <span className="flex-1 text-primary-deep">
                        <span className="block font-bold">{l.title}</span>
                        <span className="mt-1 block text-xs text-primary">
                          {lessonStage(l.lesson_number).label}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {l.duration_minutes} دقيقة
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>


          {data!.bag && (
            <Link
              to="/bags/$slug"
              params={{ slug: data!.bag.slug }}
              className="block rounded-2xl bg-secondary/70 p-5 text-sm text-primary-deep"
            >
              الحقيبة المرتبطة: {data!.bag.title} ←
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
