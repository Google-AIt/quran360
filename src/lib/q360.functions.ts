import { createServerFn } from "@tanstack/react-start";

const ALLOWED_RATERS = ["family", "colleague", "trainer"] as const;

/** يعيد نموذج التقييم الخارجي لرابط دعوة (معرّف التقييم يعمل كرمز سرّي). */
export const getRatingForm = createServerFn({ method: "GET" })
  .inputValidator((d: { assessmentId: string }) => d)
  .handler(async ({ data }) => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(data.assessmentId)) return null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: assessment } = await supabaseAdmin
      .from("q360_assessments")
      .select("id, phase, bag_id, user_id")
      .eq("id", data.assessmentId)
      .maybeSingle();
    if (!assessment) return null;

    const [{ data: bag }, { data: questions }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("quran_bags").select("title, slug").eq("id", assessment.bag_id ?? "").maybeSingle(),
      supabaseAdmin
        .from("q360_questions")
        .select("id, text, question_number")
        .eq("bag_id", assessment.bag_id ?? "")
        .order("question_number"),
      supabaseAdmin.from("profiles").select("full_name").eq("id", assessment.user_id).maybeSingle(),
    ]);

    return {
      assessmentId: assessment.id,
      phase: assessment.phase,
      bagTitle: bag?.title ?? "حقيبة قرآنية",
      personName: profile?.full_name || "المتدرب",
      questions: questions ?? [],
    };
  });

/** يستقبل تقييم جهة خارجية (أسرة/زملاء/مدرب) عبر رابط الدعوة. */
export const submitExternalRating = createServerFn({ method: "POST" })
  .inputValidator((d: { assessmentId: string; raterType: string; scores: { questionId: string; score: number }[] }) => d)
  .handler(async ({ data }) => {
    if (!(ALLOWED_RATERS as readonly string[]).includes(data.raterType)) {
      return { ok: false as const, error: "جهة تقييم غير صالحة." };
    }
    if (!Array.isArray(data.scores) || data.scores.length === 0 || data.scores.length > 100) {
      return { ok: false as const, error: "لا توجد إجابات." };
    }
    if (data.scores.some((s) => !Number.isInteger(s.score) || s.score < 1 || s.score > 5)) {
      return { ok: false as const, error: "قيم التقييم يجب أن تكون بين 1 و5." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: assessment } = await supabaseAdmin
      .from("q360_assessments")
      .select("id, bag_id")
      .eq("id", data.assessmentId)
      .maybeSingle();
    if (!assessment) return { ok: false as const, error: "رابط التقييم غير صالح." };

    const { data: valid } = await supabaseAdmin
      .from("q360_questions")
      .select("id")
      .eq("bag_id", assessment.bag_id ?? "");
    const validIds = new Set((valid ?? []).map((q) => q.id));
    const rows = data.scores
      .filter((s) => validIds.has(s.questionId))
      .map((s) => ({
        assessment_id: assessment.id,
        question_id: s.questionId,
        rater_type: data.raterType,
        score: s.score,
      }));
    if (rows.length === 0) return { ok: false as const, error: "لا توجد إجابات صالحة." };

    const { error } = await supabaseAdmin.from("q360_responses").insert(rows);
    if (error) return { ok: false as const, error: "تعذّر حفظ التقييم." };

    return { ok: true as const, count: rows.length };
  });
