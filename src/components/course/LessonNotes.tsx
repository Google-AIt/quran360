import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function LessonNotes({ lessonId, userId }: { lessonId: string; userId: string }) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus("");
    void (async () => {
      const { data } = await supabase
        .from("lesson_notes")
        .select("content")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      setContent(data?.content ?? "");
    })();
  }, [lessonId, userId]);

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("lesson_notes")
      .upsert(
        { user_id: userId, lesson_id: lessonId, content, updated_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
    setBusy(false);
    setStatus(error ? "تعذّر الحفظ، حاول مجددًا." : "تم حفظ ملاحظتك.");
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        دوّن ما ستطبّقه من هذا الدرس؛ الملاحظات خاصة بك ولا يراها أحد غيرك.
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder="ما السلوك الذي سأطبّقه اليوم من هذا الدرس؟"
        className="w-full rounded-2xl border border-border bg-card p-4 text-sm leading-8 text-primary-deep outline-none focus:border-primary"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={busy}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "جارٍ الحفظ…" : "حفظ الملاحظة"}
        </button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
