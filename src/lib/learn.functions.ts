import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** هل يملك المستخدم الحالي صلاحية دخول محتوى الدورة (بعد الشراء) + حالة تسجيله فيها. */
export const getCourseAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => ({ courseId: String(d.courseId) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: access } = await sb.rpc("has_course_access", {
      _user: context.userId,
      _course: data.courseId,
    });
    const { data: enr } = await sb
      .from("enrollments")
      .select("id, progress")
      .eq("user_id", context.userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    return { access: !!access, enrolled: !!enr, progress: enr?.progress ?? 0 };
  });

/** تسجيل المستخدم في الدورة بعد التحقق من الشراء. */
export const enrollInCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => ({ courseId: String(d.courseId) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: access } = await sb.rpc("has_course_access", {
      _user: context.userId,
      _course: data.courseId,
    });
    if (!access) return { ok: false as const, error: "يلزم شراء الدورة أو العضوية للدخول إلى المحتوى." };
    const { error } = await sb
      .from("enrollments")
      .upsert(
        { user_id: context.userId, course_id: data.courseId, progress: 0 },
        { onConflict: "user_id,course_id" },
      );
    if (error) return { ok: false as const, error: "تعذّر التسجيل، حاول مجددًا." };
    return { ok: true as const };
  });

/** أسئلة اختبار الدرس بدون كشف الإجابات الصحيحة. */
export const getLessonQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string; courseId: string }) => ({
    lessonId: String(d.lessonId),
    courseId: String(d.courseId),
  }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: access } = await sb.rpc("has_course_access", {
      _user: context.userId,
      _course: data.courseId,
    });
    if (!access) return { access: false as const, questions: [], lastScore: null };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("lesson_quiz_questions")
      .select("id, question, options, sort_order")
      .eq("lesson_id", data.lessonId)
      .order("sort_order");

    const { data: attempt } = await sb
      .from("quiz_attempts")
      .select("score, total, created_at")
      .eq("user_id", context.userId)
      .eq("lesson_id", data.lessonId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      access: true as const,
      questions: (rows ?? []).map((r) => ({
        id: r.id,
        question: r.question,
        options: (Array.isArray(r.options) ? r.options : []) as string[],
      })),
      lastScore: attempt ? { score: attempt.score, total: attempt.total } : null,
    };
  });

/** تصحيح الاختبار وتسجيل المحاولة. */
export const submitLessonQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string; courseId: string; answers: Record<string, number> }) => ({
    lessonId: String(d.lessonId),
    courseId: String(d.courseId),
    answers: d.answers ?? {},
  }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { data: access } = await sb.rpc("has_course_access", {
      _user: context.userId,
      _course: data.courseId,
    });
    if (!access) return { ok: false as const, error: "لا تملك صلاحية الدخول لهذا الاختبار." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("lesson_quiz_questions")
      .select("id, correct_index, explanation")
      .eq("lesson_id", data.lessonId);

    const questions = rows ?? [];
    const results = questions.map((q) => ({
      id: q.id,
      correctIndex: q.correct_index,
      explanation: q.explanation,
      correct: data.answers[q.id] === q.correct_index,
    }));
    const score = results.filter((r) => r.correct).length;

    await sb.from("quiz_attempts").insert({
      user_id: context.userId,
      lesson_id: data.lessonId,
      score,
      total: questions.length,
      answers: data.answers,
    });

    return { ok: true as const, score, total: questions.length, results };
  });
