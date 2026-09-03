import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { RELATION_KEYS, relationGroup, GROUP_LABELS } from "@/lib/q360-relations";

const PHASES = ["pre", "post", "followup"] as const;
type Phase = (typeof PHASES)[number];

type Answer = { itemId: string; score: number | null };

function avg(nums: number[]) {
  if (nums.length === 0) return null;
  return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
}

/** يبني تقرير مرحلة واحدة من الإجابات الخام (بشكل مجمّع يحفظ خصوصية المقيمين). */
function buildPhaseReport(
  submissions: {
    id: string;
    rater_kind: string;
    relation: string;
    qualitative: Record<string, string> | null;
  }[],
  answers: { submission_id: string; item_id: string; score: number | null }[],
  competencies: { id: string; title: string; items: { id: string }[] }[],
  minGroup: number,
) {
  const bySub = new Map<string, { item_id: string; score: number }[]>();
  for (const a of answers) {
    if (a.score == null) continue;
    const arr = bySub.get(a.submission_id) ?? [];
    arr.push({ item_id: a.item_id, score: a.score });
    bySub.set(a.submission_id, arr);
  }

  const selfSubs = submissions.filter((s) => s.rater_kind === "self");
  const otherSubs = submissions.filter((s) => s.rater_kind === "other");

  const scoresFor = (subs: typeof submissions, itemIds: string[]) => {
    const set = new Set(itemIds);
    const nums: number[] = [];
    for (const s of subs) for (const a of bySub.get(s.id) ?? []) if (set.has(a.item_id)) nums.push(a.score);
    return nums;
  };

  const comps = competencies.map((c) => {
    const ids = c.items.map((i) => i.id);
    const self = avg(scoresFor(selfSubs, ids));
    const others = avg(scoresFor(otherSubs, ids));
    const all = avg(scoresFor(submissions, ids));
    return { id: c.id, title: c.title, self, others, overall: all };
  });

  const allIds = competencies.flatMap((c) => c.items.map((i) => i.id));
  const selfScore = avg(scoresFor(selfSubs, allIds));
  const othersScore = avg(scoresFor(otherSubs, allIds));
  const overall = avg(scoresFor(submissions, allIds));

  // تجميع حسب المجموعة مع إخفاء الفئات قليلة العدد حفاظًا على الخصوصية
  const groups = new Map<string, typeof submissions>();
  for (const s of otherSubs) {
    const g = relationGroup(s.relation);
    groups.set(g, [...(groups.get(g) ?? []), s]);
  }
  const groupScores = [...groups.entries()].map(([g, subs]) => ({
    group: g,
    label: GROUP_LABELS[g] ?? g,
    count: subs.length,
    hidden: subs.length < minGroup,
    score: subs.length < minGroup ? null : avg(scoresFor(subs, allIds)),
  }));

  const comments = otherSubs
    .flatMap((s) => Object.values(s.qualitative ?? {}))
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter((t) => t.length > 0);

  return {
    selfScore,
    othersScore,
    overall,
    gap: selfScore != null && othersScore != null ? Number((selfScore - othersScore).toFixed(2)) : null,
    raters: otherSubs.length,
    selfDone: selfSubs.length > 0,
    competencies: comps,
    groups: groupScores,
    comments: otherSubs.length >= minGroup ? comments : [],
  };
}

/** الحالة الكاملة لـ Q360 لدورة معيّنة للمستخدم الحالي: البرنامج، الأسئلة، الجولات، الدعوات، التقرير. */
export const getQ360State = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseSlug: string }) => ({ courseSlug: String(d.courseSlug) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("id, slug, title")
      .eq("slug", data.courseSlug)
      .maybeSingle();
    if (!course) return null;

    const { data: program } = await supabaseAdmin
      .from("q360_programs")
      .select("id, title, intro, enabled, followup_days, min_group_raters, invite_valid_days")
      .eq("course_id", course.id)
      .maybeSingle();
    if (!program || !program.enabled) return { course, program: null };

    const { data: access } = await sb.rpc("has_course_access", { _user: context.userId, _course: course.id });

    const [{ data: comps }, { data: items }, { data: runs }] = await Promise.all([
      supabaseAdmin
        .from("q360_competencies")
        .select("id, title, description, sort_order")
        .eq("program_id", program.id)
        .order("sort_order"),
      supabaseAdmin.from("q360_items").select("id, competency_id, text, sort_order").order("sort_order"),
      supabaseAdmin
        .from("q360_runs")
        .select("id, phase, status, self_score, others_score, created_at, completed_at")
        .eq("program_id", program.id)
        .eq("user_id", context.userId),
    ]);

    const competencies = (comps ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      items: (items ?? []).filter((i) => i.competency_id === c.id).map((i) => ({ id: i.id, text: i.text })),
    }));

    const runIds = (runs ?? []).map((r) => r.id);
    const [{ data: invites }, { data: subs }] = await Promise.all([
      runIds.length
        ? supabaseAdmin
            .from("q360_invitations")
            .select("id, run_id, token, relation, rater_label, status, expires_at")
            .in("run_id", runIds)
        : Promise.resolve({ data: [] as never[] }),
      runIds.length
        ? supabaseAdmin
            .from("q360_submissions")
            .select("id, run_id, rater_kind, relation, qualitative")
            .in("run_id", runIds)
        : Promise.resolve({ data: [] as never[] }),
    ]);

    const subIds = (subs ?? []).map((s) => s.id);
    const { data: answers } = subIds.length
      ? await supabaseAdmin.from("q360_answers").select("submission_id, item_id, score").in("submission_id", subIds)
      : { data: [] as never[] };

    const report: Record<string, ReturnType<typeof buildPhaseReport>> = {};
    for (const phase of PHASES) {
      const run = (runs ?? []).find((r) => r.phase === phase);
      if (!run) continue;
      const phaseSubs = (subs ?? []).filter((s) => s.run_id === run.id);
      const phaseIds = new Set(phaseSubs.map((s) => s.id));
      report[phase] = buildPhaseReport(
        phaseSubs.map((s) => ({
          id: s.id,
          rater_kind: s.rater_kind,
          relation: s.relation,
          qualitative: (s.qualitative ?? {}) as Record<string, string>,
        })),
        (answers ?? []).filter((a) => phaseIds.has(a.submission_id)),
        competencies,
        program.min_group_raters,
      );
    }

    return {
      course,
      program,
      access: !!access,
      competencies,
      runs: (runs ?? []).map((r) => ({
        ...r,
        invites: (invites ?? [])
          .filter((i) => i.run_id === r.id)
          .map((i) => ({
            id: i.id,
            token: i.token,
            relation: i.relation,
            label: i.rater_label,
            status: i.status,
            expiresAt: i.expires_at,
          })),
      })),
      report,
    };
  });

/** حفظ التقييم الذاتي للمتدرب في مرحلة معيّنة (ينشئ الجولة إن لم تكن موجودة). */
export const submitSelfAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { courseSlug: string; phase: Phase; answers: Answer[]; qualitative?: Record<string, string> }) => d)
  .handler(async ({ data, context }) => {
    if (!PHASES.includes(data.phase)) return { ok: false as const, error: "مرحلة غير صالحة." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: course } = await supabaseAdmin
      .from("courses")
      .select("id")
      .eq("slug", data.courseSlug)
      .maybeSingle();
    if (!course) return { ok: false as const, error: "الدورة غير موجودة." };

    const { data: access } = await context.supabase.rpc("has_course_access", {
      _user: context.userId,
      _course: course.id,
    });
    if (!access) return { ok: false as const, error: "قياس الأثر متاح بعد الاشتراك في الدورة." };

    const { data: program } = await supabaseAdmin
      .from("q360_programs")
      .select("id, enabled")
      .eq("course_id", course.id)
      .maybeSingle();
    if (!program?.enabled) return { ok: false as const, error: "قياس الأثر غير مفعّل لهذه الدورة." };

    const { data: validItems } = await supabaseAdmin
      .from("q360_items")
      .select("id, q360_competencies!inner(program_id)")
      .eq("q360_competencies.program_id", program.id);
    const valid = new Set((validItems ?? []).map((i) => i.id));
    const rows = (data.answers ?? []).filter(
      (a) => valid.has(a.itemId) && (a.score === null || (Number.isInteger(a.score) && a.score >= 1 && a.score <= 5)),
    );
    if (rows.length === 0) return { ok: false as const, error: "لا توجد إجابات صالحة." };

    let { data: run } = await supabaseAdmin
      .from("q360_runs")
      .select("id")
      .eq("program_id", program.id)
      .eq("user_id", context.userId)
      .eq("phase", data.phase)
      .maybeSingle();

    if (!run) {
      const { data: created, error } = await supabaseAdmin
        .from("q360_runs")
        .insert({ program_id: program.id, course_id: course.id, user_id: context.userId, phase: data.phase })
        .select("id")
        .single();
      if (error || !created) return { ok: false as const, error: "تعذّر بدء القياس." };
      run = created;
    }

    // تقييم ذاتي واحد لكل جولة (يُستبدل عند إعادة التعبئة)
    const { data: existing } = await supabaseAdmin
      .from("q360_submissions")
      .select("id")
      .eq("run_id", run.id)
      .eq("rater_kind", "self");
    if (existing?.length) {
      await supabaseAdmin
        .from("q360_submissions")
        .delete()
        .in("id", existing.map((e) => e.id));
    }

    const scored = rows.filter((r) => r.score != null).map((r) => r.score as number);
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("q360_submissions")
      .insert({
        run_id: run.id,
        rater_kind: "self",
        relation: "self",
        average_score: avg(scored),
        qualitative: data.qualitative ?? {},
      })
      .select("id")
      .single();
    if (subErr || !sub) return { ok: false as const, error: "تعذّر حفظ التقييم." };

    await supabaseAdmin
      .from("q360_answers")
      .insert(rows.map((r) => ({ submission_id: sub.id, item_id: r.itemId, score: r.score })));

    await supabaseAdmin
      .from("q360_runs")
      .update({ self_score: avg(scored), status: "in_progress", completed_at: new Date().toISOString() })
      .eq("id", run.id);

    return { ok: true as const, runId: run.id };
  });

/** إنشاء دعوات لمقيمين خارجيين ضمن جولة قياس. */
export const createInvitations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { runId: string; raters: { relation: string; label?: string }[] }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: run } = await supabaseAdmin
      .from("q360_runs")
      .select("id, user_id, program_id")
      .eq("id", data.runId)
      .maybeSingle();
    if (!run || run.user_id !== context.userId) return { ok: false as const, error: "جولة غير صالحة." };

    const { data: program } = await supabaseAdmin
      .from("q360_programs")
      .select("invite_valid_days")
      .eq("id", run.program_id)
      .maybeSingle();

    const raters = (data.raters ?? []).filter((r) => RELATION_KEYS.includes(r.relation)).slice(0, 30);
    if (raters.length === 0) return { ok: false as const, error: "اختر فئة مقيم واحدة على الأقل." };

    const days = program?.invite_valid_days ?? 30;
    const expires = new Date(Date.now() + days * 86400000).toISOString();
    const rows = raters.map((r) => ({
      run_id: run.id,
      token: crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8),
      relation: r.relation,
      rater_label: r.label?.slice(0, 60) || null,
      expires_at: expires,
    }));
    const { data: created, error } = await supabaseAdmin.from("q360_invitations").insert(rows).select("id, token, relation, rater_label, status, expires_at");
    if (error) return { ok: false as const, error: "تعذّر إنشاء الدعوات." };
    return { ok: true as const, invites: created ?? [] };
  });

/** حذف دعوة لم يُجب عليها بعد. */
export const deleteInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inviteId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv } = await supabaseAdmin
      .from("q360_invitations")
      .select("id, status, q360_runs!inner(user_id)")
      .eq("id", data.inviteId)
      .maybeSingle();
    const owner = (inv as unknown as { q360_runs?: { user_id: string } } | null)?.q360_runs?.user_id;
    if (!inv || owner !== context.userId) return { ok: false as const, error: "دعوة غير صالحة." };
    if (inv.status === "completed") return { ok: false as const, error: "لا يمكن حذف دعوة تم الرد عليها." };
    await supabaseAdmin.from("q360_invitations").delete().eq("id", inv.id);
    return { ok: true as const };
  });
