import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInviteForm, submitInviteRating } from "@/lib/q360-invite.functions";
import { relationLabel, SCALE } from "@/lib/q360-relations";

export const Route = createFileRoute("/q360/invite/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "مشاركة في قياس أثر التدريب | القرآن خطوة بخطوة" },
      {
        name: "description",
        content: "شارك بملاحظاتك حول السلوكيات المستهدفة في الدورة التدريبية لمساعدة المتدرب على قياس أثر التدريب.",
      },
      { property: "og:title", content: "مشاركة في قياس أثر التدريب" },
      { property: "og:description", content: "تقييم سلوكي بسيط من 1 إلى 5 يستغرق دقائق قليلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { token } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["q360-invite", token],
    queryFn: () => getInviteForm({ data: { token } }),
  });

  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoading) return <Shell>جارِ التحميل…</Shell>;
  if (!data) return <Shell>رابط التقييم غير صالح.</Shell>;
  if (data.state === "done") return <Shell>تم استلام تقييمك مسبقًا، جزاك الله خيرًا.</Shell>;
  if (data.state === "expired") return <Shell>انتهت صلاحية رابط التقييم.</Shell>;
  if (done)
    return (
      <Shell>
        <span className="font-display text-2xl font-bold text-primary-deep">جزاك الله خيرًا</span>
        <p className="mt-3">تم استلام مشاركتك، وستظهر ضمن النتائج المجمّعة دون كشف هويتك.</p>
      </Shell>
    );

  const items = data.competencies.flatMap((c) => c.items);
  const isPost = data.phase !== "pre";

  async function submit() {
    if (!data || data.state !== "open") return;
    const answers = items.map((i) => ({ itemId: i.id, score: scores[i.id] ?? null }));
    if (answers.some((a) => a.score === undefined)) return;
    const answered = items.filter((i) => i.id in scores).length;
    if (answered !== items.length) {
      setMsg("يرجى اختيار إجابة لكل عبارة (يمكنك اختيار «لا أعرف / لا ينطبق»).");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await submitInviteRating({
      data: { token, answers, qualitative: { improved: q1, needs: q2 } },
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else setMsg(res.error);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-accent-foreground">
        قياس أثر التدريب — Q360
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold text-primary-deep">مشاركتك تصنع الفرق</h1>
      <p className="mt-3 leading-9 text-muted-foreground">
        <span className="font-semibold text-primary-deep">{data.traineeName}</span> يشارك في دورة{" "}
        <span className="font-semibold text-primary-deep">{data.courseTitle}</span>، ويدعوك — بصفتك{" "}
        <span className="font-semibold text-primary-deep">{relationLabel(data.relation)}</span> — للمشاركة في قياس
        أثر التدريب من خلال تقييم بعض السلوكيات التي يمكن ملاحظتها في حياته اليومية. مشاركتك مجهولة وتُعرض ضمن
        نتائج مجمّعة فقط.
      </p>

      <div className="mt-6 rounded-2xl bg-secondary/60 p-4 text-sm leading-7 text-muted-foreground">
        اختر ما تلاحظه فعليًا: {SCALE.map((s) => `${s.value} = ${s.label}`).join(" · ")} — أو «لا أعرف / لا ينطبق»
        إن لم تكن لديك ملاحظة كافية (لا تدخل في حساب المتوسط).
      </div>

      {data.competencies.map((c) => (
        <section key={c.id} className="mt-8">
          <h2 className="font-display text-lg font-bold text-primary-deep">{c.title}</h2>
          <ol className="mt-3 space-y-3">
            {c.items.map((it) => (
              <li key={it.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="leading-8 text-primary-deep">{it.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setScores({ ...scores, [it.id]: s.value })}
                      className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
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
                    className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                      it.id in scores && scores[it.id] === null
                        ? "border-primary bg-secondary text-primary-deep"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    لا أعرف / لا ينطبق
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="mt-10 space-y-4">
        <label className="block">
          <span className="text-sm text-primary-deep">
            {isPost
              ? "ما أكثر تغير إيجابي لاحظته على المتدرب منذ حصوله على التدريب؟ (اختياري)"
              : "ما أكثر سلوك ترى أن المتدرب يحتاج إلى تطويره في هذا المجال؟ (اختياري)"}
          </span>
          <textarea
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="text-sm text-primary-deep">ما السلوك الذي ما زال يحتاج إلى تطوير؟ (اختياري)</span>
          <textarea
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3"
          />
        </label>
      </section>

      {msg && <p className="mt-4 text-sm text-destructive">{msg}</p>}

      <button
        onClick={() => void submit()}
        disabled={busy}
        className="mt-6 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-60"
      >
        {busy ? "جارِ الإرسال…" : "إرسال التقييم"}
      </button>
      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        تُستخدم إجاباتك لقياس أثر التدريب فقط، ولا تُستخدم لتشخيص الشخصية، ولا يظهر اسمك أو إجاباتك بشكل منفرد.{" "}
        <Link to="/q360" className="text-primary hover:underline">
          تعرّف على Q360
        </Link>
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center leading-8 text-muted-foreground">{children}</div>;
}
