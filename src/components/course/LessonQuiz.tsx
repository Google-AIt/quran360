import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getLessonQuiz, submitLessonQuiz } from "@/lib/learn.functions";

type Q = { id: string; question: string; options: string[] };
type Result = { id: string; correctIndex: number; explanation: string | null; correct: boolean };

export function LessonQuiz({
  lessonId,
  courseId,
  onPassed,
}: {
  lessonId: string;
  courseId: string;
  onPassed?: () => void;
}) {
  const load = useServerFn(getLessonQuiz);
  const submit = useServerFn(submitLessonQuiz);

  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [score, setScore] = useState<{ score: number; total: number } | null>(null);
  const [last, setLast] = useState<{ score: number; total: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAnswers({});
    setResults(null);
    setScore(null);
    void (async () => {
      const res = await load({ data: { lessonId, courseId } });
      setQuestions(res.questions);
      setLast(res.lastScore);
    })();
  }, [lessonId, courseId, load]);

  async function send() {
    if (Object.keys(answers).length < questions.length) {
      setError("أجب عن جميع الأسئلة أولًا.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await submit({ data: { lessonId, courseId, answers } });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResults(res.results);
    setScore({ score: res.score, total: res.total });
    if (res.total > 0 && res.score / res.total >= 0.6) onPassed?.();
  }

  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">لا يوجد اختبار لهذا الدرس بعد.</p>;
  }

  return (
    <div className="space-y-5">
      {last && !score && (
        <p className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-primary-deep">
          آخر محاولة: {last.score} من {last.total}
        </p>
      )}

      {questions.map((q, qi) => {
        const r = results?.find((x) => x.id === q.id);
        return (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display font-bold text-primary-deep">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                const state = r
                  ? i === r.correctIndex
                    ? "border-primary bg-primary/10"
                    : selected
                      ? "border-destructive bg-destructive/10"
                      : "border-border"
                  : selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary/60";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!!results}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-right text-sm transition-colors ${state}`}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] text-primary">
                      {selected ? "●" : ""}
                    </span>
                    <span className="text-primary-deep">{opt}</span>
                  </button>
                );
              })}
            </div>
            {r?.explanation && (
              <p className="mt-3 rounded-xl bg-secondary/70 p-3 text-sm leading-7 text-muted-foreground">
                {r.correct ? "إجابة صحيحة — " : "الإجابة الصحيحة موضّحة أعلاه — "}
                {r.explanation}
              </p>
            )}
          </div>
        );
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {score ? (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-accent/15 p-5">
          <p className="font-display text-lg font-bold text-primary-deep">
            نتيجتك: {score.score} من {score.total}
          </p>
          <button
            onClick={() => {
              setResults(null);
              setScore(null);
              setAnswers({});
            }}
            className="rounded-xl border border-primary px-5 py-2 text-sm font-medium text-primary"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <button
          onClick={() => void send()}
          disabled={busy}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "جارٍ التصحيح…" : "تسليم الاختبار"}
        </button>
      )}
    </div>
  );
}
