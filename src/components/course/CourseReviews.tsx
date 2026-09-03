import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string;
  created_at: string;
  user_id: string;
};

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex flex-row-reverse justify-end gap-1">
      {[5, 4, 3, 2, 1].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} من 5`}
          className={`text-lg ${n <= value ? "text-accent" : "text-border"} ${onChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function CourseReviews({
  courseId,
  userId,
  authorName,
  canReview,
}: {
  courseId: string;
  userId: string | null;
  authorName: string;
  canReview: boolean;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("course_reviews")
      .select("id, rating, comment, author_name, created_at, user_id")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(50);
    setReviews(data ?? []);
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const mine = reviews.find((r) => r.user_id === userId);
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    }
  }, [reviews, userId]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function send() {
    if (!userId) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("course_reviews").upsert(
      { user_id: userId, course_id: courseId, author_name: authorName, rating, comment: comment.trim() || null },
      { onConflict: "user_id,course_id" },
    );
    setBusy(false);
    if (err) setError("تعذّر حفظ التقييم، تأكد من اشتراكك في الدورة.");
    else await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-display text-3xl font-bold text-primary-deep">{avg ? avg.toFixed(1) : "—"}</span>
        <Stars value={Math.round(avg)} />
        <span className="text-sm text-muted-foreground">{reviews.length} تقييم</span>
      </div>

      {canReview && userId && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display font-bold text-primary-deep">قيّم تجربتك في الدورة</p>
          <div className="mt-3">
            <Stars value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="ما الأثر الذي لمسته بعد التطبيق؟"
            className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm leading-7 text-primary-deep outline-none focus:border-primary"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <button
            onClick={() => void send()}
            disabled={busy}
            className="mt-3 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "جارٍ الحفظ…" : "حفظ التقييم"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-primary-deep">{r.author_name}</span>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 text-sm leading-7 text-muted-foreground">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
