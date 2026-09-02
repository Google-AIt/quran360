import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBags } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { contentForBag } from "@/lib/bag-content";
import { BagObjectives, ObjectiveChips } from "@/components/site/BagObjectives";

const q = queryOptions({ queryKey: ["bags"], queryFn: () => getBags() });

export const Route = createFileRoute("/bags/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "الحقائب القرآنية | القرآن خطوة بخطوة" },
      {
        name: "description",
        content: "12 حقيبة قرآنية تدريبية مبنية على المنهجية التطبيقية لتحويل الآية إلى سلوك.",
      },
      { property: "og:title", content: "الحقائب القرآنية" },
      {
        property: "og:description",
        content: "حقائب تدريبية تحوّل مفاهيم القرآن إلى خطوات عملية وسلوك مقاس.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: bags } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <section className="overflow-hidden rounded-3xl bg-hero px-6 py-10 text-primary-foreground md:px-12 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-gold">مسارات تطبيقية من القرآن</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">الحقائب القرآنية</h1>
          <p className="mt-5 text-base leading-9 text-primary-foreground/85 md:text-lg">
            حقائب تدريبية تساعدك على فهم الآية، وبناء تصور ذهني واضح لمعناها، ثم تحويلها إلى خطوات
            عملية تقيس أثرها في حياتك.
          </p>
        </div>
        <div className="mt-10 grid gap-3 border-t border-primary-foreground/20 pt-6 sm:grid-cols-3">
          {[
            ["01", "فهم الآية", "تصحيح المفهوم القرآني"],
            ["02", "تصور المهارة", "رؤية المعنى في الواقع"],
            ["03", "تطبيق وقياس", "خطوة عملية وأثر ملموس"],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-3">
              <span className="font-display text-sm text-gold">{number}</span>
              <div>
                <p className="font-display font-bold">{title}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BagObjectives className="mt-12" />

      <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">اختر موضوعك التدريبي</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-primary-deep">
            ابدأ من الآية الأقرب إلى احتياجك
          </h2>
        </div>
        <span className="text-sm text-muted-foreground">{bags.length} حقائب متاحة الآن</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bags.map((b) => {
          const content = contentForBag(b.slug);
          return (
            <Link
              key={b.id}
              to="/bags/$slug"
              params={{ slug: b.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              {bagImage(b.slug) ? (
                <img
                  src={bagImage(b.slug)}
                  alt={`غلاف حقيبة ${b.title}`}
                  loading="lazy"
                  width={1200}
                  height={750}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-secondary text-sm text-muted-foreground">
                  صورة الحقيبة قريبًا
                </div>
              )}
              <div className="p-6">
                <p className="ayah text-lg text-primary">{b.verse}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.verse_reference}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-primary-deep">{b.title}</h3>
                {content ? (
                  <>
                    <span className="mt-3 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs text-accent-foreground">
                      المهارة: {content.focus}
                    </span>
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {content.description}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted-foreground">
                    {b.summary}
                  </p>
                )}
                <ObjectiveChips className="mt-4" />
                <span className="mt-5 inline-block text-sm font-medium text-primary">
                  استكشف الحقيبة ←
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
