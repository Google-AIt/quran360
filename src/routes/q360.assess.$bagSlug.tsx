import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getBag } from "@/lib/public.functions";

const bagQuery = (slug: string) =>
  queryOptions({ queryKey: ["bag", slug], queryFn: () => getBag({ data: { slug } }) });

const PHASES = [
  { key: "pre", label: "قبلي (قبل التدريب)" },
  { key: "post", label: "بعدي (بعد التدريب)" },
  { key: "followup", label: "تتبعي (بعد شهر)" },
] as const;

const RATERS = [
  { key: "self", label: "تقييم ذاتي" },
  { key: "family", label: "الأسرة" },
  { key: "colleague", label: "الزملاء" },
  { key: "trainer", label: "المدرب / الميسّر" },
] as const;

export const Route = createFileRoute("/q360/assess/$bagSlug")({
  ssr: false,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(bagQuery(params.bagSlug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متاح" }, { name: "robots", content: "noindex" }] };
    const t = `تقييم Q360 — ${loaderData.bag.title}`;
    return {
      meta: [
        { title: `${t} | القرآن خطوة بخطوة` },
        { name: "description", content: "قياس الأثر السلوكي 360 درجة: تقييم قبلي وبعدي وتتبعي لكل حقيبة قرآنية." },
        { property: "og:title", content: t },
        { property: "og:description", content: "قِس أثر تطبيق القرآن في سلوكك عبر تقييم Q360." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: () => <div className="p-16 text-center text-muted-foreground">تعذّر تحميل التقييم.</div>,
  notFoundComponent: () => <div className="p-16 text-center text-muted-foreground">الحقيبة غير موجودة.</div>,
  component: Page,
});

type Assessment = { id: string; phase: string | null; average_score: number | null; status: string | null };

function Page() {
  const { bagSlug } = Route.useParams();
  const { data } = useSuspenseQuery(bagQuery(bagSlug));
  const bag = data!.bag;
  const questions = data!.questions;

  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<string>("pre");
  const [rater, setRater] = useState<string>("self");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<Assessment[]>([]);
  const [raterAvgs, setRaterAvgs] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState("");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: s }) => setSession(s.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadSaved(uid: string) {
    const { data: rows } = await supabase
      .from("q360_assessments")
      .select("id, phase, average_score, status")
      .eq("user_id", uid)
      .eq("bag_id", bag.id);
    setSaved(rows ?? []);
    const ids = (rows ?? []).map((r) => r.id);
    if (ids.length === 0) {
      setRaterAvgs({});
      return;
    }
    const { data: resp } = await supabase
      .from("q360_responses")
      .select("rater_type, score")
      .in("assessment_id", ids);
    const acc: Record<string, { sum: number; n: number }> = {};
    for (const r of resp ?? []) {
      const k = r.rater_type;
      acc[k] = { sum: (acc[k]?.sum ?? 0) + r.score, n: (acc[k]?.n ?? 0) + 1 };
    }
    setRaterAvgs(Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, v.sum / v.n])));
  }


  useEffect(() => {
    if (!session) {
      setSaved([]);
      return;
    }
    void loadSaved(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, bag.id]);

  async function submit() {
    if (!session) return;
    const answered = questions.filter((q) => scores[q.id]);
    if (answered.length !== questions.length) {
      setMsg("يرجى الإجابة على جميع العبارات قبل الحفظ.");
      return;
    }
    setBusy(true);
    setMsg("");
    const avg = answered.reduce((s, q) => s + (scores[q.id] ?? 0), 0) / answered.length;
    const { data: inserted, error } = await supabase
      .from("q360_assessments")
      .insert({
        user_id: session.user.id,
        bag_id: bag.id,
        phase,
        status: "completed",
        average_score: Number(avg.toFixed(2)),
      })
      .select("id")
      .single();
    if (error || !inserted) {
      setBusy(false);
      setMsg("تعذّر حفظ التقييم، حاول مرة أخرى.");
      return;
    }
    await supabase.from("q360_responses").insert(
      answered.map((q) => ({
        assessment_id: inserted.id,
        question_id: q.id,
        rater_type: rater,
        score: scores[q.id]!,
      })),
    );
    setScores({});
    await loadSaved(session.user.id);
    setBusy(false);
    setMsg("تم حفظ التقييم بنجاح.");
  }

  const pre = saved.find((s) => s.phase === "pre")?.average_score ?? null;
  const post = saved.find((s) => s.phase === "post")?.average_score ?? null;
  const change = pre && post ? Math.round(((post - pre) / pre) * 100) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <nav className="text-sm text-muted-foreground">
        <Link to="/q360" className="hover:text-primary">
          Q360
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary-deep">{bag.title}</span>
      </nav>

      <h1 className="mt-6 font-display text-3xl font-bold text-primary-deep sm:text-4xl">
        تقييم الأثر السلوكي — {bag.title}
      </h1>
      <p className="mt-3 leading-9 text-muted-foreground">
        قيّم العبارات السلوكية من 1 (نادرًا) إلى 5 (دائمًا). يُنصح بتعبئة التقييم القبلي قبل بدء الحقيبة،
        والبعدي بعد إتمامها، والتتبعي بعد شهر لقياس ثبات الأثر.
      </p>

      {!session ? (
        <Link
          to="/account"
          className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          سجّل الدخول لبدء التقييم
        </Link>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-muted-foreground">مرحلة القياس</span>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3"
              >
                {PHASES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">جهة التقييم</span>
              <select
                value={rater}
                onChange={(e) => setRater(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3"
              >
                {RATERS.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ol className="mt-8 space-y-3">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="leading-8 text-primary-deep">
                  {i + 1}. {q.text}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setScores({ ...scores, [q.id]: v })}
                      className={`size-11 rounded-xl border text-sm transition-colors ${
                        scores[q.id] === v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-primary-deep hover:bg-secondary/70"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {msg && <p className="mt-4 text-sm text-primary">{msg}</p>}

          <button
            onClick={() => void submit()}
            disabled={busy || questions.length === 0}
            className="mt-6 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            حفظ التقييم
          </button>

          {saved.length > 0 && (
            <section className="mt-12 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-bold text-primary-deep">نتائجي في هذه الحقيبة</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {PHASES.map((p) => {
                  const row = saved.find((s) => s.phase === p.key);
                  return (
                    <div key={p.key} className="rounded-xl bg-secondary/60 p-4">
                      <div className="text-xs text-muted-foreground">{p.label}</div>
                      <div className="mt-1 font-display text-2xl font-bold text-primary">
                        {row?.average_score != null ? `${row.average_score} / 5` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              {change !== null && (
                <p className="mt-5 rounded-xl bg-accent/20 p-4 leading-8 text-primary-deep">
                  نسبة التغير السلوكي بين القياس القبلي والبعدي:{" "}
                  <span className="font-display text-xl font-bold text-primary">{change}%</span>
                </p>
              )}

              <h3 className="mt-8 font-display text-lg font-bold text-primary-deep">
                المقارنة بين جهات التقييم (360 درجة)
              </h3>
              <div className="mt-4 space-y-3">
                {RATERS.map((r) => {
                  const v = raterAvgs[r.key];
                  return (
                    <div key={r.key} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-muted-foreground">{r.label}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${((v ?? 0) / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-sm font-medium text-primary-deep">
                        {v != null ? `${v.toFixed(1)} / 5` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h3 className="mt-8 font-display text-lg font-bold text-primary-deep">دعوة مقيّمين خارجيين</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                أرسل الرابط الخاص بكل قياس إلى أسرتك أو زملائك أو مدربك ليضيفوا تقييمهم لسلوكك بشكل موضوعي.
              </p>
              <div className="mt-4 space-y-2">
                {saved.map((s) => {
                  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/q360/rate/${s.id}`;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {PHASES.find((p) => p.key === s.phase)?.label ?? s.phase}
                      </span>
                      <code className="flex-1 truncate text-xs text-primary-deep" dir="ltr">
                        {url}
                      </code>
                      <button
                        onClick={() => {
                          void navigator.clipboard.writeText(url);
                          setCopied(s.id);
                        }}
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                      >
                        {copied === s.id ? "تم النسخ" : "نسخ الرابط"}
                      </button>
                    </div>
                  );
                })}
              </div>

            </section>
          )}
        </>
      )}
    </div>
  );
}
