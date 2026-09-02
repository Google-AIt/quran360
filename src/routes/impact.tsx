import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getStories } from "@/lib/public.functions";
import { getImpactStats } from "@/lib/stats.functions";

const q = queryOptions({
  queryKey: ["impact"],
  queryFn: async () => ({ stories: await getStories(), stats: await getImpactStats() }),
});

export const Route = createFileRoute("/impact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "الأثر والنتائج | قياس الأثر القرآني" },
      { name: "description", content: "مؤشرات الأثر: المتدربون، الميسّرون، المدارس، نسب الإتمام، نتائج Q360 ونسب التغير السلوكي." },
      { property: "og:title", content: "الأثر والنتائج" },
      { property: "og:description", content: "قياس ما تغير في سلوك الإنسان، وليس فقط ما تعلّمه." },
    ],
  }),
  component: Page,
});

const kpis = [
  ["المتدربون", "1,240"], ["الميسّرون", "86"], ["المدارس", "14"], ["المعلمون", "312"],
  ["الطلاب", "8,640"], ["الحقائب", "9"], ["الدورات", "1"], ["متوسط الإتمام", "78%"],
];

function Page() {
  const { data: stories } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">الأثر والنتائج</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">قياس ما تغير في سلوك الإنسان، وليس فقط ما تعلّمه.</p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="font-display text-3xl font-bold text-primary">{v}</div>
            <div className="mt-1 text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold text-primary-deep">نتائج Q360 ونسب التغير</h2>
      <div className="mt-5 space-y-4">
        {stories.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display font-bold text-primary-deep">{s.title}</h3>
              <span className="text-sm text-primary">+{s.change_percent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary" style={{ width: `${s.change_percent ?? 0}%` }} />
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{s.story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
