import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("settings").select("key, value, label");
  const map: Record<string, number | string> = {};
  for (const row of data ?? []) map[row.key] = row.value as number | string;
  return map;
});

export const getBags = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("quran_bags")
    .select("id, slug, title, verse, verse_reference, concept, summary, outcome, sort_order")
    .order("sort_order");
  return data ?? [];
});

export const getBag = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data: input }) => {
    const sb = publicClient();
    const { data: bag } = await sb.from("quran_bags").select("*").eq("slug", input.slug).maybeSingle();
    if (!bag) return null;
    const [{ data: steps }, { data: course }, { data: questions }] = await Promise.all([
      sb.from("bag_steps").select("*").eq("bag_id", bag.id).order("step_number"),
      sb.from("courses").select("id, slug, title, description, price").eq("bag_id", bag.id).maybeSingle(),
      sb.from("q360_questions").select("id, text, question_number").eq("bag_id", bag.id).order("question_number"),
    ]);
    return { bag, steps: steps ?? [], course: course ?? null, questions: questions ?? [] };
  });

export const getCourses = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data: courses } = await sb
    .from("courses")
    .select("id, slug, title, verse, description, objectives, price, bag_id")
    .order("sort_order");
  const { data: lessons } = await sb
    .from("course_lessons")
    .select("id, course_id, lesson_number, title, description, duration_minutes")
    .order("lesson_number");
  return (courses ?? []).map((c) => ({ ...c, lessons: (lessons ?? []).filter((l) => l.course_id === c.id) }));
});

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("products")
    .select("id, slug, title, description, category, price, billing_period")
    .order("sort_order");
  return data ?? [];
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("blog_posts")
    .select("id, slug, title, excerpt, category, author, published_at")
    .order("published_at", { ascending: false });
  return data ?? [];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data: input }) => {
    const { data } = await publicClient().from("blog_posts").select("*").eq("slug", input.slug).maybeSingle();
    return data;
  });

export const getStories = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("impact_stories")
    .select("id, slug, title, person_name, person_role, story, bag_title, change_percent")
    .order("created_at");
  return data ?? [];
});
