import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getCourse } from "@/lib/public.functions";
import { issueCourseCertificate } from "@/lib/certificates.functions";

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
    const d = loaderData.course.description ?? "دورة تطبيقية من 5 دروس مع أنشطة وتحديات وتقييم Q360 وشهادة إتمام.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
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

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(slug));
  const course = data!.course;
  const lessons = data!.lessons;

  const [session, setSession] = useState<Session | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [certNumber, setCertNumber] = useState<string | null>(null);
  const [certError, setCertError] = useState("");

  const issueCert = useServerFn(issueCourseCertificate);

  async function issue() {
    setBusy(true);
    setCertError("");
    const res = await issueCert({ data: { courseId: course.id } });
    if (res.ok) setCertNumber(res.number);
    else setCertError(res.error);
    setBusy(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: s }) => setSession(s.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setEnrolled(false);
      setDone([]);
      return;
    }
    const uid = session.user.id;
    void (async () => {
      const [{ data: enr }, { data: prog }] = await Promise.all([
        supabase.from("enrollments").select("id").eq("user_id", uid).eq("course_id", course.id).maybeSingle(),
        supabase.from("lesson_progress").select("lesson_id").eq("user_id", uid).eq("completed", true),
      ]);
      setEnrolled(!!enr);
      const ids = lessons.map((l) => l.id);
      setDone((prog ?? []).map((p) => p.lesson_id).filter((id): id is string => !!id && ids.includes(id)));
    })();
  }, [session, course.id, lessons]);

  const percent = lessons.length ? Math.round((done.length / lessons.length) * 100) : 0;

  async function enroll() {
    if (!session) return;
    setBusy(true);
    await supabase.from("enrollments").insert({ user_id: session.user.id, course_id: course.id, progress: 0 });
    setEnrolled(true);
    setBusy(false);
  }

  async function toggle(lessonId: string) {
    if (!session || !enrolled) return;
    const uid = session.user.id;
    const isDone = done.includes(lessonId);
    const next = isDone ? done.filter((d) => d !== lessonId) : [...done, lessonId];
    setDone(next);
    if (isDone) {
      await supabase.from("lesson_progress").delete().eq("user_id", uid).eq("lesson_id", lessonId);
    } else {
      await supabase
        .from("lesson_progress")
        .upsert(
          { user_id: uid, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
          { onConflict: "user_id,lesson_id" },
        );
    }
    const pct = lessons.length ? Math.round((next.length / lessons.length) * 100) : 0;
    await supabase
      .from("enrollments")
      .update({ progress: pct, completed_at: pct === 100 ? new Date().toISOString() : null })
      .eq("user_id", uid)
      .eq("course_id", course.id);
  }

  const lesson = lessons[active];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <nav className="text-sm text-muted-foreground">
        <Link to="/academy" className="hover:text-primary">
          الأكاديمية
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary-deep">{course.title}</span>
      </nav>

      <p className="ayah mt-6 text-xl text-primary">{course.verse}</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-primary-deep sm:text-4xl">{course.title}</h1>
      <p className="mt-3 max-w-3xl leading-9 text-muted-foreground">{course.description}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {lesson ? (
            <article className="rounded-2xl border border-border bg-card p-6">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-secondary">
                {lesson.video_url ? (
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    فيديو الدرس يُضاف قريبًا من لوحة الإدارة
                  </div>
                )}
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold text-primary-deep">
                الدرس {lesson.lesson_number}: {lesson.title}
              </h2>
              <p className="mt-2 leading-8 text-muted-foreground">{lesson.description}</p>

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

              {!session ? (
                <Link
                  to="/account"
                  className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  سجّل الدخول لمتابعة تقدمك
                </Link>
              ) : !enrolled ? (
                <button
                  onClick={enroll}
                  disabled={busy}
                  className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  التسجيل في الدورة
                </button>
              ) : (
                <button
                  onClick={() => void toggle(lesson.id)}
                  className="mt-6 rounded-xl border border-primary px-6 py-3 text-sm font-medium text-primary"
                >
                  {done.includes(lesson.id) ? "إلغاء إتمام الدرس" : "تحديد الدرس كمكتمل"}
                </button>
              )}
            </article>
          ) : (
            <p className="rounded-2xl bg-secondary/70 p-6 text-muted-foreground">دروس هذه الدورة تُضاف قريبًا.</p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">نسبة الإنجاز</span>
              <span className="font-display text-lg font-bold text-primary">{percent}%</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            {percent === 100 && (
              <div className="mt-4 rounded-xl bg-accent/20 p-3 text-sm text-primary-deep">
                <p>أتممت الدورة. انتقل إلى تقييم Q360 البعدي لقياس أثر التطبيق.</p>
                {certNumber ? (
                  <Link to="/verify/$number" params={{ number: certNumber }} className="mt-3 inline-block text-primary underline">
                    عرض شهادتك ({certNumber})
                  </Link>
                ) : (
                  <button
                    onClick={issue}
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

          <ol className="space-y-2">
            {lessons.map((l, i) => (
              <li key={l.id}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-right text-sm transition-colors ${
                    i === active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/60"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      done.includes(l.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-primary-deep"
                    }`}
                  >
                    {done.includes(l.id) ? "✓" : l.lesson_number}
                  </span>
                  <span className="text-primary-deep">
                    {l.title}
                    <span className="block text-xs text-muted-foreground">{l.duration_minutes} دقيقة</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

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
