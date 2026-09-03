import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type QRow = {
  id: string;
  body: string;
  author_name: string;
  created_at: string;
  user_id: string;
};
type ARow = { id: string; question_id: string; body: string; author_name: string; created_at: string };

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

export function LessonQA({
  courseId,
  lessonId,
  userId,
  authorName,
}: {
  courseId: string;
  lessonId: string;
  userId: string;
  authorName: string;
}) {
  const [questions, setQuestions] = useState<QRow[]>([]);
  const [answers, setAnswers] = useState<ARow[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data: qs } = await supabase
      .from("lesson_questions")
      .select("id, body, author_name, created_at, user_id")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })
      .limit(50);
    setQuestions(qs ?? []);
    const ids = (qs ?? []).map((q) => q.id);
    if (ids.length === 0) {
      setAnswers([]);
      return;
    }
    const { data: as } = await supabase
      .from("lesson_answers")
      .select("id, question_id, body, author_name, created_at")
      .in("question_id", ids)
      .order("created_at");
    setAnswers(as ?? []);
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function ask() {
    if (!body.trim()) return;
    setBusy(true);
    await supabase.from("lesson_questions").insert({
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      author_name: authorName,
      body: body.trim(),
    });
    setBody("");
    await load();
    setBusy(false);
  }

  async function answer(questionId: string) {
    if (!reply.trim()) return;
    setBusy(true);
    await supabase.from("lesson_answers").insert({
      question_id: questionId,
      user_id: userId,
      author_name: authorName,
      body: reply.trim(),
    });
    setReply("");
    setReplyTo(null);
    await load();
    setBusy(false);
  }

  async function remove(id: string) {
    await supabase.from("lesson_questions").delete().eq("id", id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="اطرح سؤالك حول هذا الدرس…"
          className="w-full rounded-xl border border-border bg-background p-3 text-sm leading-7 text-primary-deep outline-none focus:border-primary"
        />
        <button
          onClick={() => void ask()}
          disabled={busy}
          className="mt-3 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          نشر السؤال
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد أسئلة على هذا الدرس بعد، كن أول من يسأل.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary-deep">{q.author_name}</span>
                <span>{fmt(q.created_at)}</span>
              </div>
              <p className="mt-2 leading-8 text-primary-deep">{q.body}</p>

              <ul className="mt-4 space-y-3 border-r-2 border-secondary pr-4">
                {answers
                  .filter((a) => a.question_id === q.id)
                  .map((a) => (
                    <li key={a.id} className="rounded-xl bg-secondary/60 p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-primary-deep">{a.author_name}</span>
                        <span>{fmt(a.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{a.body}</p>
                    </li>
                  ))}
              </ul>

              {replyTo === q.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={2}
                    placeholder="اكتب إجابتك…"
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm text-primary-deep outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => void answer(q.id)}
                      disabled={busy}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      إرسال
                    </button>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-4 text-xs">
                  <button onClick={() => setReplyTo(q.id)} className="text-primary hover:underline">
                    إجابة
                  </button>
                  {q.user_id === userId && (
                    <button onClick={() => void remove(q.id)} className="text-destructive hover:underline">
                      حذف
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
