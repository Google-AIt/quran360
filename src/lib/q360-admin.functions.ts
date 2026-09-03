import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("غير مصرّح");
}

/** قائمة برامج Q360 لكل الدورات + مؤشرات المشاركة والنتائج. */
export const listQ360Programs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: courses }, { data: programs }, { data: comps }, { data: items }, { data: runs }, { data: invites }] =
      await Promise.all([
        supabaseAdmin.from("courses").select("id, slug, title").order("sort_order"),
        supabaseAdmin.from("q360_programs").select("*"),
        supabaseAdmin.from("q360_competencies").select("id, program_id, title, sort_order").order("sort_order"),
        supabaseAdmin.from("q360_items").select("id, competency_id, text, sort_order").order("sort_order"),
        supabaseAdmin.from("q360_runs").select("id, program_id, user_id, phase, self_score, others_score"),
        supabaseAdmin.from("q360_invitations").select("id, run_id, status"),
      ]);

    const avg = (n: number[]) => (n.length ? Number((n.reduce((a, b) => a + b, 0) / n.length).toFixed(2)) : null);

    return (courses ?? []).map((c) => {
      const p = (programs ?? []).find((x) => x.course_id === c.id) ?? null;
      const pRuns = p ? (runs ?? []).filter((r) => r.program_id === p.id) : [];
      const runIds = new Set(pRuns.map((r) => r.id));
      const pInvites = (invites ?? []).filter((i) => runIds.has(i.run_id));
      const score = (phase: string) =>
        avg(
          pRuns
            .filter((r) => r.phase === phase)
            .flatMap((r) => [r.self_score, r.others_score])
            .map((v) => Number(v))
            .filter((v) => Number.isFinite(v)),
        );
      const preAvg = score("pre");
      const postAvg = score("post");
      const participants = new Set(pRuns.map((r) => r.user_id)).size;
      const preCount = pRuns.filter((r) => r.phase === "pre").length;
      const postCount = pRuns.filter((r) => r.phase === "post").length;
      return {
        course: c,
        program: p,
        competencies: p
          ? (comps ?? [])
              .filter((x) => x.program_id === p.id)
              .map((x) => ({
                ...x,
                items: (items ?? []).filter((i) => i.competency_id === x.id),
              }))
          : [],
        stats: {
          participants,
          preCount,
          postCount,
          followupCount: pRuns.filter((r) => r.phase === "followup").length,
          completion: preCount ? Math.round((postCount / preCount) * 100) : 0,
          preAvg,
          postAvg,
          improvement: preAvg && postAvg ? Math.round(((postAvg - preAvg) / preAvg) * 100) : null,
          invitesSent: pInvites.length,
          invitesAnswered: pInvites.filter((i) => i.status === "completed").length,
        },
      };
    });
  });

/** إنشاء أو تحديث إعدادات برنامج Q360 لدورة. */
export const saveQ360Program = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      courseId: string;
      title?: string | undefined;
      intro?: string | undefined;
      enabled?: boolean | undefined;
      followupDays?: number | undefined;
      minGroupRaters?: number | undefined;
      inviteValidDays?: number | undefined;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      course_id: data.courseId,
      title: data.title?.slice(0, 160) || "Q360 — قياس أثر التدريب",
      intro: data.intro ?? null,
      enabled: data.enabled ?? true,
      followup_days: Math.min(365, Math.max(1, data.followupDays ?? 30)),
      min_group_raters: Math.min(20, Math.max(1, data.minGroupRaters ?? 3)),
      invite_valid_days: Math.min(365, Math.max(1, data.inviteValidDays ?? 30)),
    };
    const { error } = await supabaseAdmin.from("q360_programs").upsert(payload, { onConflict: "course_id" });
    if (error) return { ok: false as const, error: "تعذّر الحفظ." };
    return { ok: true as const };
  });

/** إضافة محور (مهارة) إلى برنامج. */
export const addQ360Competency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { programId: string; title: string; sortOrder?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("q360_competencies").insert({
      program_id: data.programId,
      title: data.title.slice(0, 160),
      sort_order: data.sortOrder ?? 0,
    });
    return error ? { ok: false as const, error: "تعذّر الحفظ." } : { ok: true as const };
  });

/** إضافة سؤال سلوكي إلى محور. */
export const addQ360Item = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { competencyId: string; text: string; sortOrder?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("q360_items").insert({
      competency_id: data.competencyId,
      text: data.text.slice(0, 400),
      sort_order: data.sortOrder ?? 0,
    });
    return error ? { ok: false as const, error: "تعذّر الحفظ." } : { ok: true as const };
  });

/** تعديل نص سؤال. */
export const updateQ360Item = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string; text: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("q360_items").update({ text: data.text.slice(0, 400) }).eq("id", data.itemId);
    return { ok: true as const };
  });

/** حذف سؤال أو محور. */
export const deleteQ360Node = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { kind: "item" | "competency"; id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = data.kind === "item" ? "q360_items" : "q360_competencies";
    await supabaseAdmin.from(table).delete().eq("id", data.id);
    return { ok: true as const };
  });

/** تصدير نتائج Q360 لدورة بصيغة CSV مجمّعة (بدون بيانات شخصية للمقيمين). */
export const exportQ360Csv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { programId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: runs } = await supabaseAdmin
      .from("q360_runs")
      .select("id, user_id, phase, self_score, others_score, created_at")
      .eq("program_id", data.programId);
    const header = "run_id,phase,self_score,others_score,created_at";
    const lines = (runs ?? []).map((r) =>
      [r.id, r.phase, r.self_score ?? "", r.others_score ?? "", r.created_at].join(","),
    );
    return { csv: [header, ...lines].join("\n") };
  });
