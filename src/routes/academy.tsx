import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BookOpenCheck, Clock3, PlayCircle } from "lucide-react";
import { getCourses, getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({
  queryKey: ["academy"],
  queryFn: async () => ({ courses: await getCourses(), settings: await getSettings() }),
});

export const Route = createFileRoute("/academy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "أكاديمية القرآن خطوة بخطوة | دورات تطبيق القرآن" },
      { name: "description", content: "دورات إلكترونية مرتبطة بالحقائب القرآنية، كل دورة 5 دروس مع أنشطة وتحديات وتقييم Q360 وشهادة إتمام." },
      { property: "og:title", content: "أكاديمية القرآن خطوة بخطوة" },
      { property: "og:description", content: "رحلة تدريب متكاملة: محتوى، نشاط، تطبيق، تحدي، تقييم، Q360، شهادة." },
    ],
  }),
  component: Page,
});

const journey = ["التسجيل", "مشاهدة المحتوى", "النشاط", "التطبيق", "التحدي", "التقييم", "Q360", "إتمام الدورة", "الشهادة"];

function Page() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <PageHero eyebrow="تعلّم، طبّق، تغيّر" title="أكاديمية القرآن خطوة بخطوة" description={`دورات إلكترونية مرتبطة بالحقائب القرآنية، تنقلك من مشاهدة المحتوى إلى النشاط والتطبيق والتحدي وقياس الأثر. الدورة الواحدة ${data.settings["price_course"]} ريال، وعضوية المتدرب ${data.settings["price_trainee_membership"]} ريال سنويًا وتشمل جميع الدورات.`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="5" label="دروس تطبيقية لكل دورة" />
          <HeroStat value="Q360" label="قياس الأثر السلوكي" />
          <HeroStat value="شهادة" label="عند إتمام الرحلة" />
        </div>
      </PageHero>
      <div className="mt-10 flex flex-wrap gap-2">
        {journey.map((j, i) => <span key={j} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-primary-deep">{i + 1}. {j}</span>)}
      </div>

      <div className="mt-16">
        <SectionTitle title="اختر دورتك" subtitle="كل دورة هي رحلة قصيرة ومركزة لتحويل معنى قرآني إلى ممارسة يومية." />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {data.courses.map((c) => (
            <article key={c.id} className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft md:p-8">
              <div className="flex items-start justify-between gap-4"><p className="ayah text-lg text-primary">{c.verse}</p><BookOpenCheck className="size-6 shrink-0 text-gold" /></div>
              <h2 className="mt-3 font-display text-xl font-bold text-primary-deep">{c.title}</h2>
              <p className="mt-2 leading-8 text-muted-foreground">{c.description}</p>
              <ol className="mt-6 space-y-2">
                {c.lessons.map((l) => <li key={l.id} className="flex items-start gap-3 rounded-2xl bg-secondary/60 px-4 py-3 text-sm"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-xs text-primary-foreground">{l.lesson_number}</span><span className="text-primary-deep">{l.title}<span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{l.description} · {l.duration_minutes} دقيقة</span></span></li>)}
              </ol>
              <div className="mt-6 flex items-center justify-between gap-3"><span className="font-display text-lg font-bold text-primary">{c.price} ريال</span><Button asChild><Link to="/courses/$slug" params={{ slug: c.slug }}><PlayCircle /> ادخل الدورة</Link></Button></div>
            </article>
          ))}
        </div>
      </div>

      <p className="mt-10 rounded-2xl bg-secondary/70 p-6 leading-8 text-muted-foreground">
        بقية الدورات تُضاف تباعًا مع إطلاق حقائبها من لوحة الإدارة، وكل دورة تتكون من 5 فيديوهات وأنشطة
        وتحديات عملية ومهام وتقييم وQ360 ونسبة إنجاز وشهادة إتمام.
      </p>
    </div>
  );
}
