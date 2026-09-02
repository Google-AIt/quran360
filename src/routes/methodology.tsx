import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/methodology")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المنهجية التطبيقية للقرآن الكريم | القرآن خطوة بخطوة" },
      { name: "description", content: "المنهجية التطبيقية: التصور الذهني الصحيح، الخطوات العملية، النتائج، التطبيق، وقياس الأثر." },
      { property: "og:title", content: "المنهجية التطبيقية للقرآن الكريم" },
      { property: "og:description", content: "منهجية تنقل القرآن من المعرفة إلى السلوك المقاس." },
    ],
  }),
  component: Page,
});

const stages = [
  ["التصور الذهني الصحيح", "استخراج المفهوم والصورة الذهنية الصحيحة من الآية، باعتبارها المبدأ أو القانون الذي يقوم عليه الموضوع."],
  ["الخطوات العملية", "تحويل التصور الذهني إلى خطوات عملية واضحة قابلة للتدريب والممارسة."],
  ["النتائج", "تحديد النتائج العملية التي تظهر عند تطبيق الخطوات."],
  ["التطبيق", "ممارسة الخطوات في مواقف الحياة الواقعية."],
  ["قياس الأثر", "قياس مدى انتقال المعرفة إلى سلوك وتغير فعلي."],
];

function Page() {
  const { data } = useSuspenseQuery(q);
  const video = String(data["methodology_video_url"] ?? "");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero eyebrow="منهجية القرآن خطوة بخطوة" title="المنهجية التطبيقية للقرآن الكريم" description="منهجية تنقل القرآن الكريم من المعرفة والفهم إلى التدريب، ثم التطبيق، ثم السلوك، ثم قياس الأثر." actions={<Button asChild variant="secondary"><Link to="/bags">استكشف الحقائب <ArrowLeft /></Link></Button>} />

      <div className="mt-10 aspect-video overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <iframe className="size-full" src={video} title="الفيديو الترويجي للمنهجية التطبيقية" allowFullScreen />
      </div>

      <section className="mt-16">
        <SectionTitle title="كيف تتحول الآية إلى أثر؟" subtitle="خمس محطات متتابعة تجعل التطبيق واضحًا وقابلًا للممارسة والقياس." />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {stages.map(([t, d], i) => <div key={t} className="rounded-3xl border border-border bg-card p-5 shadow-sm"><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary font-display text-primary-foreground">{i + 1}</div><h2 className="font-display text-base font-bold text-primary-deep">{t}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p></div>)}
        </div>
      </section>

      <div className="mt-14 rounded-3xl bg-secondary/70 p-8">
        <h2 className="font-display text-2xl font-bold text-primary-deep">أساس كل ما نقدّمه</h2>
        <p className="mt-3 leading-8 text-muted-foreground">
          جميع الحقائب القرآنية والدورات الإلكترونية وبرامج المدارس وتأهيل الميسّرين مبنية على هذه المنهجية،
          ويُقاس أثرها من خلال نظام Q360.
        </p>
      </div>
    </div>
  );
}
