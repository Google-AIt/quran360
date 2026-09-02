import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const ORIGIN = "https://quran360.lovable.app";

const STATIC_PATHS = [
  "", "methodology", "bags", "academy", "facilitators", "schools",
  "q360", "store", "blog", "impact", "walking-quran", "contact", "verify",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const sb = createClient(
          import.meta.env.VITE_SUPABASE_URL as string,
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          { auth: { persistSession: false } },
        );
        const urls = [...STATIC_PATHS.map((p) => `${ORIGIN}/${p}`)];
        const [bags, courses, posts] = await Promise.all([
          sb.from("quran_bags").select("slug").eq("is_published", true),
          sb.from("courses").select("slug").eq("is_published", true),
          sb.from("blog_posts").select("slug").eq("is_published", true),
        ]);
        (bags.data ?? []).forEach((b: any) => urls.push(`${ORIGIN}/bags/${b.slug}`));
        (courses.data ?? []).forEach((c: any) => urls.push(`${ORIGIN}/courses/${c.slug}`));
        (posts.data ?? []).forEach((p: any) => urls.push(`${ORIGIN}/blog/${p.slug}`));

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join("\n") +
          `\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
