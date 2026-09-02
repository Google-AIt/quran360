import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function makeNumber(kind: string) {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `QSBS-${kind === "facilitator" ? "F" : "C"}${year}-${rand}`;
}

/** يصدر شهادة إتمام بعد التحقق من اكتمال الدورة فعليًا (100%). */
export const issueCourseCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: enrollment } = await context.supabase
      .from("enrollments")
      .select("progress, courses(title)")
      .eq("user_id", context.userId)
      .eq("course_id", data.courseId)
      .maybeSingle();

    if (!enrollment || (enrollment.progress ?? 0) < 100) {
      return { ok: false as const, error: "لم تكتمل الدورة بعد." };
    }

    const course = enrollment.courses as unknown as { title: string } | null;
    const programTitle = course?.title ?? "دورة تطبيقية";

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("certificate_number")
      .eq("user_id", context.userId)
      .eq("kind", "course")
      .eq("program_title", programTitle)
      .maybeSingle();

    if (existing) return { ok: true as const, number: existing.certificate_number };

    const number = makeNumber("course");
    const { error } = await supabaseAdmin.from("certificates").insert({
      user_id: context.userId,
      certificate_number: number,
      kind: "course",
      program_title: programTitle,
      recipient_name: profile?.full_name?.trim() || "متدرب",
    });
    if (error) return { ok: false as const, error: "تعذّر إصدار الشهادة." };
    return { ok: true as const, number };
  });

/** تحقق عام من شهادة برقمها — يعيد بيانات محدودة فقط. */
export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((d: { number: string }) => d)
  .handler(async ({ data }) => {
    const number = data.number.trim().toUpperCase().slice(0, 40);
    if (!/^[A-Z0-9-]{6,40}$/.test(number)) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("certificates")
      .select("certificate_number, kind, program_title, recipient_name, issued_at")
      .eq("certificate_number", number)
      .maybeSingle();
    return row ?? null;
  });
