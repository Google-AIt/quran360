import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getStories } from "@/lib/public.functions";
import { getImpactStats } from "@/lib/stats.functions";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({
  queryKey: ["impact"],
  queryFn: async () => ({ stories: await getStories(), stats: await getImpactStats() }),
});

export const Route = createFileRoute("/impact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "الأثر والنتائج | قياس الأثر القرآني" },
      {
        name: "description",
        content:
          "مؤشرات الأثر: المتدربون، الميسّرون، المدارس، نسب الإتمام، نتائج Q360 ونسب التغير السلوكي.",
      },
      { property: "og:title", content: "الأثر والنتائج" },
      { property: "og:description", content: "قياس ما تغير في سلوك الإنسان، وليس فقط ما تعلّمه." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(q);
  const { stories, stats } = data;
  const nf = new Intl.NumberFormat("ar-EG");
  const kpis: [string, string][] = [
    ["المتدربون", nf.format(stats.trainees)],
    ["الميسّرون", nf.format(stats.facilitators)],
    ["المدارس", nf.format(stats.schools)],
    ["المعلمون", nf.format(stats.teachers)],
    ["الطلاب", nf.format(stats.students)],
    ["الحقائب", nf.format(stats.bags)],
    ["الدورات", nf.format(stats.courses)],
    ["متوسط الإتمام", `${nf.format(stats.completionRate)}%`],
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="قرآنًا يمشي على الأرض"
        title="الأثر والنتائج"
        description="قياس ما تغير في سلوك الإنسان، وليس فقط ما تعلّمه."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value={nf.format(stats.trainees)} label="متدربون" />
          <HeroStat value={nf.format(stats.schools)} label="مدارس" />
          <HeroStat value={`${nf.format(stats.completionRate)}%`} label="متوسط الإتمام" />
        </div>
      </PageHero>

      <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="font-display text-3xl font-bold text-primary">{v}</div>
            <div className="mt-1 text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <SectionTitle
          title="نتائج Q360 ونسب التغير"
          subtitle="قصص حقيقية تُعرض من خلال مؤشرات قابلة للملاحظة والتتبع."
        />
      </div>
      <div className="mt-8 space-y-4">
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
