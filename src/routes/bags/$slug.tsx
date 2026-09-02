import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBag } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";

export const Route = createFileRoute("/bags/$slug")({
  loader: async ({ params }) => {
    const data = await getBag({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "الحقيبة غير متاحة" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.bag.title} | حقيبة قرآنية`;
    const d = loaderData.bag.summary ?? "حقيبة قرآنية تدريبية مبنية على المنهجية التطبيقية.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  errorComponent: () => <div className="p-16 text-center">تعذّر تحميل الحقيبة.</div>,
  notFoundComponent: () => <div className="p-16 text-center">الحقيبة غير موجودة.</div>,
  component: Page,
});

function List({ title, items }: { title: string; items: unknown }) {
  const arr = Array.isArray(items) ? (items as string[]) : [];
  if (!arr.length) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold text-primary-deep">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
        {arr.map((x, i) => (
          <li key={i} className="flex gap-2"><span className="text-gold">•</span>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function Page() {
  const { bag, steps, course, questions } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        <div className="rounded-3xl bg-hero p-8 text-primary-foreground md:p-12">
          <p className="ayah text-2xl text-gold">{bag.verse}</p>
          <p className="mt-1 text-sm text-primary-foreground/70">{bag.verse_reference}</p>
          <h1 className="mt-5 font-display text-4xl font-bold">{bag.title}</h1>
          {bag.summary && <p className="mt-4 max-w-3xl leading-9 text-primary-foreground/85">{bag.summary}</p>}
        </div>
        {bagImage(bag.slug) && (
          <img
            src={bagImage(bag.slug)}
            alt={`غلاف حقيبة ${bag.title}`}
            className="h-full w-full rounded-3xl border border-border object-cover"
          />
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["المفهوم / التصور الذهني", bag.mental_image ?? bag.concept], ["المبدأ أو القانون", bag.principle], ["النتيجة", bag.outcome]].map(([t, v]) =>
          v ? (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-sm font-bold text-muted-foreground">{t}</h2>
              <p className="mt-2 leading-8 text-primary-deep">{v}</p>
            </div>
          ) : null,
        )}
      </div>

      {steps.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-primary-deep">الخطوات العملية</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {steps.map((s) => (
              <div key={s.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-primary-foreground">{s.step_number}</div>
                <div>
                  <h3 className="font-display font-bold text-primary-deep">{s.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <List title="الأدلة القرآنية والنبوية" items={bag.evidences} />
        <List title="الأنشطة" items={bag.activities} />
        <List title="التطبيقات" items={bag.applications} />
        <List title="التحديات" items={bag.challenges} />
        <List title="التقييم" items={bag.assessment} />
        {questions.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-primary-deep">مؤشرات Q360 السلوكية</h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
              {questions.map((qq) => <li key={qq.id} className="flex gap-2"><span className="text-gold">•</span>{qq.text}</li>)}
            </ul>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link to="/q360" className="text-sm font-medium text-primary">تفاصيل Q360</Link>
              <Link
                to="/q360/assess/$bagSlug"
                params={{ bagSlug: bag.slug }}
                className="text-sm font-medium text-primary"
              >
                ابدأ تقييم الأثر ←
              </Link>
            </div>
          </section>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {course && (
          <Link
            to="/courses/$slug"
            params={{ slug: course.slug }}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            الدورة المرتبطة: {course.title} — {course.price} ريال
          </Link>
        )}
        <Link to="/store" className="rounded-xl border border-border px-6 py-3 font-medium text-primary-deep">
          شراء من المتجر
        </Link>
      </div>

    </div>
  );
}
