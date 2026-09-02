import { createServerFn } from "@tanstack/react-start";

export type ImpactStats = {
  trainees: number;
  facilitators: number;
  schools: number;
  teachers: number;
  students: number;
  bags: number;
  courses: number;
  completionRate: number;
};

export const getImpactStats = createServerFn({ method: "GET" }).handler(async (): Promise<ImpactStats> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const head = { count: "exact" as const, head: true };
  const [
    trainees,
    facilitators,
    schools,
    teachers,
    students,
    bags,
    courses,
    enrollments,
    completed,
  ] = await Promise.all([
    supabaseAdmin.from("user_roles").select("id", head).eq("role", "trainee"),
    supabaseAdmin.from("user_roles").select("id", head).eq("role", "facilitator"),
    supabaseAdmin.from("schools").select("id", head),
    supabaseAdmin.from("school_members").select("id", head).eq("member_type", "teacher"),
    supabaseAdmin.from("school_members").select("id", head).eq("member_type", "student"),
    supabaseAdmin.from("quran_bags").select("id", head),
    supabaseAdmin.from("courses").select("id", head),
    supabaseAdmin.from("enrollments").select("id", head),
    supabaseAdmin.from("enrollments").select("id", head).gte("progress", 100),
  ]);

  const total = enrollments.count ?? 0;
  return {
    trainees: trainees.count ?? 0,
    facilitators: facilitators.count ?? 0,
    schools: schools.count ?? 0,
    teachers: teachers.count ?? 0,
    students: students.count ?? 0,
    bags: bags.count ?? 0,
    courses: courses.count ?? 0,
    completionRate: total > 0 ? Math.round(((completed.count ?? 0) / total) * 100) : 0,
  };
});
