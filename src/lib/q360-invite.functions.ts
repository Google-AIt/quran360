import { createServerFn } from "@tanstack/react-start";

/** نموذج التقييم الخاص برابط دعوة (بدون الحاجة لإنشاء حساب). */
export const getInviteForm = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) => ({ token: String(d.token).slice(0, 80) }))
  .handler(async ({ data }) => {
    if (!/^[a-z0-9]{20,80}$/i.test(data.token)) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invite } = await supabaseAdmin
      .from("q360_invitations")
      .select("id, run_id, relation, rater_label, status, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (!invite) return null;
    if (invite.status === "completed") return { state: "done" as const };
    if (new Date(invite.expires_at).getTime() < Date.now()) return { state: "expired" as const };

    const { data: run } = await supabaseAdmin
      .from("q360_runs")
      .select("id, phase, user_id, program_id, course_id")
      .eq("id", invite.run_id)
      .maybeSingle();
    if (!run) return null;

    const [{ data: course }, { data: profile }, { data: comps }] = await Promise.all([
      supabaseAdmin.from("courses").select("title").eq("id", run.course_id).maybeSingle(),
      supabaseAdmin.from("profiles").select("full_name").eq("id", run.user_id).maybeSingle(),
      supabaseAdmin
        .from("q360_competencies")
        .select("id, title, sort_order")
        .eq("program_id", run.program_id)
        .order("sort_order"),
    ]);

    const { data: items } = await supabaseAdmin
      .from("q360_items")
      .select("id, competency_id, text, sort_order")
      .in("competency_id", (comps ?? []).map((c) => c.id))
      .order("sort_order");

    return {
      state: "open" as const,
      phase: run.phase,
      relation: invite.relation,
      raterLabel: invite.rater_label,
      courseTitle: course?.title ?? "دورة تدريبية",
      traineeName: profile?.full_name || "المتدرب",
      competencies: (comps ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        items: (items ?? []).filter((i) => i.competency_id === c.id).map((i) => ({ id: i.id, text: i.text })),
      })),
    };
  });

/** استقبال تقييم المقيم الخارجي عبر رابط الدعوة. */
export const submitInviteRating = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      token: string;
      answers: { itemId: string; score: number | null }[];
      qualitative?: Record<string, string>;
    }) => d,
  )
  .handler(async ({ data }) => {
    if (!/^[a-z0-9]{20,80}$/i.test(data.token ?? "")) return { ok: false as const, error: "رابط غير صالح." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invite } = await supabaseAdmin
      .from("q360_invitations")
      .select("id, run_id, relation, status, expires_at")
      .eq("token", data.token)
      .maybeSingle();
    if (!invite) return { ok: false as const, error: "رابط التقييم غير صالح." };
    if (invite.status === "completed") return { ok: false as const, error: "تم إرسال هذا التقييم مسبقًا." };
    if (new Date(invite.expires_at).getTime() < Date.now())
      return { ok: false as const, error: "انتهت صلاحية رابط التقييم." };

    const { data: run } = await supabaseAdmin
      .from("q360_runs")
      .select("id, program_id")
      .eq("id", invite.run_id)
      .maybeSingle();
    if (!run) return { ok: false as const, error: "رابط التقييم غير صالح." };

    const { data: validItems } = await supabaseAdmin
      .from("q360_items")
      .select("id, q360_competencies!inner(program_id)")
      .eq("q360_competencies.program_id", run.program_id);
    const valid = new Set((validItems ?? []).map((i) => i.id));

    const rows = (data.answers ?? []).filter(
      (a) => valid.has(a.itemId) && (a.score === null || (Number.isInteger(a.score) && a.score >= 1 && a.score <= 5)),
    );
    if (rows.length === 0) return { ok: false as const, error: "لا توجد إجابات صالحة." };

    const scored = rows.filter((r) => r.score != null).map((r) => r.score as number);
    const average = scored.length ? Number((scored.reduce((a, b) => a + b, 0) / scored.length).toFixed(2)) : null;

    const qualitative: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.qualitative ?? {})) {
      if (typeof v === "string" && v.trim()) qualitative[k] = v.trim().slice(0, 600);
    }

    const { data: sub, error } = await supabaseAdmin
      .from("q360_submissions")
      .insert({
        run_id: run.id,
        invitation_id: invite.id,
        rater_kind: "other",
        relation: invite.relation,
        average_score: average,
        qualitative,
      })
      .select("id")
      .single();
    if (error || !sub) return { ok: false as const, error: "تعذّر حفظ التقييم." };

    await supabaseAdmin
      .from("q360_answers")
      .insert(rows.map((r) => ({ submission_id: sub.id, item_id: r.itemId, score: r.score })));

    await supabaseAdmin
      .from("q360_invitations")
      .update({ status: "completed", responded_at: new Date().toISOString() })
      .eq("id", invite.id);

    // تحديث متوسط تقييم الآخرين للجولة
    const { data: others } = await supabaseAdmin
      .from("q360_submissions")
      .select("average_score")
      .eq("run_id", run.id)
      .eq("rater_kind", "other");
    const vals = (others ?? []).map((o) => Number(o.average_score)).filter((n) => Number.isFinite(n));
    if (vals.length) {
      await supabaseAdmin
        .from("q360_runs")
        .update({ others_score: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) })
        .eq("id", run.id);
    }

    return { ok: true as const };
  });
