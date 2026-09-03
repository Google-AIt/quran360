import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  getQ360State,
  submitSelfAssessment,
  createInvitations,
  deleteInvitation,
} from "@/lib/q360-course.functions";
import { RELATIONS, relationLabel, SCALE, PHASE_LABEL } from "@/lib/q360-relations";

export const Route = createFileRoute("/q360/course/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "قياس أثر التدريب Q360 | القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "قِس أثر الدورة على سلوكك: قياس قبلي وبعدي ومتابعة، مع تقييم من حولك وتقرير واضح لنسبة التحسن في كل مهارة.",
      },
      { property: "og:title", content: "قياس أثر التدريب Q360" },
      { property: "og:description", content: "تعلّم ← طبّق ← قِس الأثر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type Phase = "pre" | "post" | "followup";
const PHASES: Phase[] = ["pre", "post", "followup"];

function Page() {
  const { slug } = Route.useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("pre");

  const stateFn = useServerFn(getQ360State);
  const saveSelf = useServerFn(submitSelfAssessment);
  const invite = useServerFn(createInvitations);
  const removeInvite = useServerFn(deleteInvitation);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const q = useQuery({
    queryKey: ["q360-state", slug, session?.user.id],
    queryFn: () => stateFn({ data: { courseSlug: slug } }),
    enabled: !!session,
  });

  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const state = q.data;
  const run = useMemo(() => state?.runs?.find((r) => r.phase === phase), [state, phase]);
  const report = state?.report?.[phase] ?? null;
  const pre = state?.report?.["pre"] ?? null;
  const post = state?.report?.["post"] ?? null;

  if (!session)
    return (
      <Shell>
        <p>سجّل الدخول لبدء قياس أثر التدريب.</p>
        <Link to="/account" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-primary-foreground">
          تسجيل الدخول
        </Link>
      </Shell>
    );
  if (q.isLoading) return <Shell>جارِ التحميل…</Shell>;
  if (!state) return <Shell>الدورة غير موجودة.</Shell>;
  if (!state.program)
    return (
      <Shell>
        <p>قياس أثر التدريب غير مفعّل لهذه الدورة بعد.</p>
        <Link to="/academy" className="mt-6 inline-block text-primary underline">
          العودة إلى الأكاديمية
        </Link>
      </Shell>
    );
  if (!state.access)
    return (
      <Shell>
        <p>قياس أثر التدريب Q360 جزء من تجربة الدورة، ويتاح بعد الاشتراك فيها.</p>
        <Link to="/store" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-primary-foreground">
          اشترك في الدورة
        </Link>
      </Shell>
    );

  const competencies = state.competencies ?? [];
  const items = competencies.flatMap((c) => c.items);
  const selfDone = !!report?.selfDone;

  async function saveSelfAssessment() {
    const answered = items.filter((i) => i.id in scores).length;
    if (answered !== items.length) {
      setMsg("يرجى اختيار إجابة لكل عبارة.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await saveSelf({
      data: {
        courseSlug: slug,
        phase,
        answers: items.map((i) => ({ itemId: i.id, score: scores[i.id] ?? null })),
      },
    });
    setBusy(false);
    if (!res.ok) return setMsg(res.error);
    setScores({});
    setMsg("تم حفظ تقييمك الذاتي.");
    await q.refetch();
  }

  async function sendInvites() {
    if (!run) return setMsg("ابدأ بتعبئة تقييمك الذاتي أولًا.");
    if (!consent) return setMsg("يرجى الموافقة على مشاركة الدعوة قبل الإرسال.");
    if (picked.length === 0) return setMsg("اختر فئة مقيم واحدة على الأقل.");
    setBusy(true);
    setMsg("");
    const res = await invite({ data: { runId: run.id, raters: picked.map((p) => ({ relation: p })) } });
    setBusy(false);
    if (!res.ok) return setMsg(res.error);
    setPicked([]);
    setMsg("تم إنشاء الدعوات، شاركها مع من اخترتهم.");
    await q.refetch();
  }

  const improvement =
    pre?.overall && post?.overall ? Math.round(((post.overall - pre.overall) / pre.overall) * 100) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="text-sm text-muted-foreground">
        <Link to="/academy" className="hover:text-primary">
          الأكاديمية
        </Link>
        <span className="mx-2">/</span>
        <Link to="/courses/$slug" params={{ slug }} className="hover:text-primary">
          {state.course.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary-deep">Q360</span>
      </nav>

      <h1 className="mt-5 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
        {state.program.title}
      </h1>
      <p className="mt-3 leading-9 text-muted-foreground">
        لا نسألك فقط: هل تعلمت؟ بل نساعدك على معرفة: هل ظهر أثر ما تعلمته في سلوكك كما يراه من حولك؟
      </p>

      {/* رحلة القياس */}
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {["قياس قبلي", "التدريب والتطبيق", "قياس بعدي", "مقارنة النتائج", "تقرير الأثر"].map((s, i) => (
          <span key={s} className="rounded-full border border-border bg-card px-3 py-1.5 text-primary-deep">
            {i + 1}. {s}
          </span>
        ))}
      </div>

      {/* تبويب المراحل */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPhase(p);
              setScores({});
              setMsg("");
            }}
            className={`rounded-full px-4 py-2 text-sm ${
              phase === p ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-primary-deep"
            }`}
          >
            {PHASE_LABEL[p]}
            {p === "followup" ? ` (بعد ${state.program.followup_days} يومًا)` : ""}
          </button>
        ))}
      </div>

      {/* التقييم الذاتي */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-primary-deep">
          {selfDone ? "تقييمك الذاتي — تم" : "تقييمك الذاتي"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          قيّم ممارستك الفعلية للسلوكيات المستهدفة: {SCALE.map((s) => `${s.value}=${s.label}`).join(" · ")}.
        </p>

        {selfDone && (
          <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm text-primary-deep">
            متوسط تقييمك الذاتي في {PHASE_LABEL[phase]}: <strong>{report?.selfScore ?? "—"} / 5</strong>. يمكنك
            إعادة التعبئة أدناه لتحديث إجاباتك.
          </p>
        )}

        {competencies.map((c) => (
          <div key={c.id} className="mt-6">
            <h3 className="font-display font-bold text-primary-deep">{c.title}</h3>
            <ol className="mt-3 space-y-3">
              {c.items.map((it) => (
                <li key={it.id} className="rounded-2xl border border-border bg-card p-4">
                  <p className="leading-8 text-primary-deep">{it.text}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SCALE.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setScores({ ...scores, [it.id]: s.value })}
                        className={`rounded-xl border px-3 py-2 text-xs ${
                          scores[it.id] === s.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-primary-deep hover:bg-secondary/70"
                        }`}
                      >
                        {s.value} — {s.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setScores({ ...scores, [it.id]: null })}
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        it.id in scores && scores[it.id] === null
                          ? "border-primary bg-secondary text-primary-deep"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      لا ينطبق
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        {msg && <p className="mt-4 text-sm text-primary">{msg}</p>}

        <button
          onClick={() => void saveSelfAssessment()}
          disabled={busy}
          className="mt-6 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-60"
        >
          حفظ التقييم الذاتي
        </button>
      </section>

      {/* دعوة المقيمين */}
      <section className="mt-14 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold text-primary-deep">من يمكنه ملاحظة سلوكك؟</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          اختر الفئات المناسبة لمن يتعاملون معك باستمرار. ليست جميع الفئات إلزامية، ويمكنك بدء الدورة قبل اكتمال
          ردودهم. ولحماية الخصوصية لا تُعرض نتيجة أي فئة إذا قلّ عدد المقيمين فيها عن{" "}
          {state.program.min_group_raters}.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {RELATIONS.filter((r) => r.key !== "self").map((r) => {
            const n = picked.filter((p) => p === r.key).length;
            return (
              <button
                key={r.key}
                onClick={() => setPicked([...picked, r.key])}
                className={`rounded-full border px-4 py-2 text-sm ${
                  n ? "border-primary bg-primary/10 text-primary-deep" : "border-border text-primary-deep"
                }`}
              >
                {r.label}
                {n ? ` (${n})` : ""}
              </button>
            );
          })}
          {picked.length > 0 && (
            <button onClick={() => setPicked([])} className="rounded-full px-4 py-2 text-sm text-muted-foreground">
              مسح الاختيار
            </button>
          )}
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          أوافق على مشاركة رابط تقييم يتضمن اسمي واسم الدورة مع الأشخاص الذين أختارهم، وأعلم أن إجاباتهم تُعرض لي
          بشكل مجمّع فقط.
        </label>

        <button
          onClick={() => void sendInvites()}
          disabled={busy || !run}
          className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          إنشاء روابط الدعوة
        </button>
        {!run && <p className="mt-2 text-xs text-muted-foreground">ابدأ بحفظ تقييمك الذاتي لهذه المرحلة أولًا.</p>}

        {run && run.invites.length > 0 && (
          <ul className="mt-6 space-y-2">
            {run.invites.map((iv) => {
              const url = `${typeof window !== "undefined" ? window.location.origin : ""}/q360/invite/${iv.token}`;
              const text = `${relationLabel(iv.relation)}: مشاركة في قياس أثر التدريب لدورة ${state.course.title} — ${url}`;
              return (
                <li
                  key={iv.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <span className="text-sm text-primary-deep">{relationLabel(iv.relation)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      iv.status === "completed" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {iv.status === "completed" ? "تم الرد" : "بانتظار الرد"}
                  </span>
                  <code className="flex-1 truncate text-xs text-muted-foreground" dir="ltr">
                    {url}
                  </code>
                  <button
                    onClick={() => void navigator.clipboard.writeText(url)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                  >
                    نسخ
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-primary-deep"
                  >
                    واتساب
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent("قياس أثر التدريب")}&body=${encodeURIComponent(text)}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-primary-deep"
                  >
                    بريد
                  </a>
                  {iv.status !== "completed" && (
                    <button
                      onClick={async () => {
                        await removeInvite({ data: { inviteId: iv.id } });
                        await q.refetch();
                      }}
                      className="text-xs text-destructive"
                    >
                      حذف
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* التقرير */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-primary-deep">تقرير Q360 — قياس أثر التدريب</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {state.course.title} — {new Date().toLocaleDateString("ar-SA")}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card label="النتيجة قبل التدريب" value={pre?.overall != null ? `${pre.overall} / 5` : "—"} />
          <Card label="النتيجة بعد التدريب" value={post?.overall != null ? `${post.overall} / 5` : "—"} />
          <Card label="نسبة التحسن" value={improvement != null ? `${improvement}%` : "—"} />
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="text-right text-muted-foreground">
                <th className="border-b border-border p-3">المهارة</th>
                <th className="border-b border-border p-3">قبل</th>
                <th className="border-b border-border p-3">بعد</th>
                <th className="border-b border-border p-3">التغير</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c) => {
                const b = pre?.competencies.find((x) => x.id === c.id)?.overall ?? null;
                const a = post?.competencies.find((x) => x.id === c.id)?.overall ?? null;
                const d = b != null && a != null ? Number((a - b).toFixed(2)) : null;
                return (
                  <tr key={c.id}>
                    <td className="border-b border-border p-3 text-primary-deep">{c.title}</td>
                    <td className="border-b border-border p-3">{b ?? "—"}</td>
                    <td className="border-b border-border p-3">{a ?? "—"}</td>
                    <td className="border-b border-border p-3 text-primary">
                      {d != null ? (d > 0 ? `+${d}` : d) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* الذات مقابل الآخرين */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-primary-deep">التقييم الذاتي مقابل تقييم الآخرين</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                قبل التدريب: ذاتي {pre?.selfScore ?? "—"} · الآخرون {pre?.othersScore ?? "—"} · فجوة الإدراك{" "}
                {pre?.gap ?? "—"}
              </li>
              <li>
                بعد التدريب: ذاتي {post?.selfScore ?? "—"} · الآخرون {post?.othersScore ?? "—"} · فجوة الإدراك{" "}
                {post?.gap ?? "—"}
              </li>
            </ul>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              فجوة الإدراك هي الفرق بين تقييمك لنفسك ومتوسط تقييم الآخرين لك.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-primary-deep">تقييم الفئات ({PHASE_LABEL[phase]})</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {(report?.groups ?? []).length === 0 && <li>لا توجد ردود من مقيمين بعد.</li>}
              {(report?.groups ?? []).map((g) => (
                <li key={g.group}>
                  {g.label}: {g.hidden ? "غير معروضة (عدد المقيمين أقل من الحد الأدنى)" : `${g.score} / 5`}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* التحليل */}
        <Analysis pre={pre} post={post} competencies={competencies} comments={post?.comments ?? []} />
      </section>
    </div>
  );
}

type PhaseReport = NonNullable<Awaited<ReturnType<typeof getQ360State>>> extends { report: infer R }
  ? R extends Record<string, infer V>
    ? V
    : never
  : never;

function Analysis({
  pre,
  post,
  competencies,
  comments,
}: {
  pre: PhaseReport | null;
  post: PhaseReport | null;
  competencies: { id: string; title: string }[];
  comments: string[];
}) {
  if (!pre || !post) return null;
  const deltas = competencies
    .map((c) => {
      const b = pre.competencies.find((x) => x.id === c.id)?.overall;
      const a = post.competencies.find((x) => x.id === c.id)?.overall;
      return b != null && a != null ? { title: c.title, delta: a - b, after: a } : null;
    })
    .filter((d): d is { title: string; delta: number; after: number } => !!d);
  if (deltas.length === 0) return null;
  const best = [...deltas].sort((a, b) => b.delta - a.delta)[0]!;
  const needs = [...deltas].sort((a, b) => a.after - b.after)[0]!;

  return (
    <div className="mt-8 rounded-2xl bg-secondary/60 p-6">
      <h3 className="font-display text-lg font-bold text-primary-deep">قراءة سريعة للنتائج</h3>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
        <li>
          أكثر المهارات تحسناً: <strong className="text-primary-deep">{best.title}</strong> (+
          {best.delta.toFixed(2)})
        </li>
        <li>
          مهارة تحتاج إلى مزيد من التطوير: <strong className="text-primary-deep">{needs.title}</strong>
        </li>
        <li>
          أبرز فجوة بين تقييمك لنفسك وتقييم الآخرين بعد التدريب: {post.gap != null ? post.gap : "—"}
        </li>
      </ul>
      {comments.length > 0 && (
        <>
          <h4 className="mt-5 font-display font-bold text-primary-deep">أبرز ما لاحظه من حولك</h4>
          <ul className="mt-2 space-y-2 text-sm leading-7 text-muted-foreground">
            {comments.slice(0, 6).map((c, i) => (
              <li key={i}>«{c}»</li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        هذه النتائج تصف السلوكيات المستهدفة في الدورة فقط، ولا تُستخدم لتشخيص الشخصية أو الحالة النفسية.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center leading-8 text-muted-foreground">{children}</div>;
}
