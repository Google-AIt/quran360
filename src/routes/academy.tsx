import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCourses, getSettings } from "@/lib/public.functions";

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
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">أكاديمية القرآن خطوة بخطوة</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
        12 دورة إلكترونية مرتبطة بالحقائب القرآنية. الدورة الواحدة {data.settings["price_course"]} ريال،
        وعضوية المتدرب {data.settings["price_trainee_membership"]} ريال سنويًا وتشمل جميع الدورات.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {journey.map((j, i) => (
          <span key={j} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-primary-deep">
            {i + 1}. {j}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {data.courses.map((c) => (
          <article key={c.id} className="rounded-2xl border border-border bg-card p-6">
            <p className="ayah text-lg text-primary">{c.verse}</p>
            <h2 className="mt-3 font-display text-xl font-bold text-primary-deep">{c.title}</h2>
            <p className="mt-2 leading-8 text-muted-foreground">{c.description}</p>
            <ol className="mt-4 space-y-2">
              {c.lessons.map((l) => (
                <li key={l.id} className="flex items-start gap-3 rounded-xl bg-secondary/60 px-4 py-3 text-sm">
                  <span className="font-display text-primary">{l.lesson_number}</span>
                  <span className="text-primary-deep">
                    {l.title}
                    <span className="block text-xs text-muted-foreground">{l.description} · {l.duration_minutes} دقيقة</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-primary">{c.price} ريال</span>
              <Link
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                ادخل الدورة
              </Link>
            </div>

          </article>
        ))}
      </div>

      <p className="mt-10 rounded-2xl bg-secondary/70 p-6 leading-8 text-muted-foreground">
        بقية الدورات تُضاف تباعًا مع إطلاق حقائبها من لوحة الإدارة، وكل دورة تتكون من 5 فيديوهات وأنشطة
        وتحديات عملية ومهام وتقييم وQ360 ونسبة إنجاز وشهادة إتمام.
      </p>
    </div>
  );
}
