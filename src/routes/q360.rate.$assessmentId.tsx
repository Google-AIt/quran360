import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRatingForm, submitExternalRating } from "@/lib/q360.functions";

export const Route = createFileRoute("/q360/rate/$assessmentId")({
  head: () => ({
    meta: [
      { title: "تقييم خارجي Q360 | القرآن خطوة بخطوة" },
      {
        name: "description",
        content: "شارك بتقييم سلوكي موضوعي لأحد المتدربين ضمن نظام قياس الأثر Q360 في منصة القرآن خطوة بخطوة.",
      },
      { property: "og:title", content: "تقييم خارجي Q360" },
      { property: "og:description", content: "قيّم السلوك المُلاحَظ من 1 إلى 5 لدعم قياس الأثر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const RATERS = [
  { key: "family", label: "من الأسرة" },
  { key: "colleague", label: "زميل / صديق" },
  { key: "trainer", label: "المدرب / الميسّر" },
];

const PHASE: Record<string, string> = { pre: "قبلي", post: "بعدي", followup: "تتبعي" };

function Page() {
  const { assessmentId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["q360-rate", assessmentId],
    queryFn: () => getRatingForm({ data: { assessmentId } }),
  });

  const [rater, setRater] = useState("family");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <div className="p-16 text-center text-muted-foreground">جارِ التحميل…</div>;
  if (!data)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="mb-4 font-display text-2xl font-bold text-primary-deep">رابط التقييم غير صالح</h1>
        <Link to="/q360" className="text-primary hover:underline">
          العودة إلى صفحة Q360
        </Link>
      </div>
    );

  async function submit() {
    if (!data) return;
    const rows = data.questions.filter((q) => scores[q.id]).map((q) => ({ questionId: q.id, score: scores[q.id]! }));
    if (rows.length !== data.questions.length) {
      setMsg("يرجى الإجابة على جميع العبارات.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await submitExternalRating({ data: { assessmentId, raterType: rater, scores: rows } });
    setBusy(false);
    if (res.ok) setDone(true);
    else setMsg(res.error);
  }

  if (done)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-primary-deep">جزاك الله خيرًا</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          تم استلام تقييمك بنجاح، وسيُحتسب ضمن قياس الأثر السلوكي 360 درجة.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-primary-deep">تقييم سلوكي خارجي</h1>
      <p className="mt-3 leading-9 text-muted-foreground">
        دُعيت لتقييم <span className="font-semibold text-primary-deep">{data.personName}</span> في حقيبة{" "}
        <span className="font-semibold text-primary-deep">{data.bagTitle}</span>
        {data.phase ? ` — القياس ${PHASE[data.phase] ?? data.phase}` : ""}. قيّم ما تلاحظه فعليًا من 1 (نادرًا) إلى 5
        (دائمًا). التقييم مجهول ويُستخدم للقياس فقط.
      </p>

      <label className="mt-8 block">
        <span className="text-sm text-muted-foreground">صفتك</span>
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

      <ol className="mt-8 space-y-3">
        {data.questions.map((q, i) => (
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

      {msg && <p className="mt-4 text-sm text-destructive">{msg}</p>}

      <button
        onClick={() => void submit()}
        disabled={busy}
        className="mt-6 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-60"
      >
        {busy ? "جارِ الإرسال…" : "إرسال التقييم"}
      </button>
    </div>
  );
}
