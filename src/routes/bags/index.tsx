import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBags } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";

const q = queryOptions({ queryKey: ["bags"], queryFn: () => getBags() });

export const Route = createFileRoute("/bags/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "الحقائب القرآنية | القرآن خطوة بخطوة" },
      { name: "description", content: "12 حقيبة قرآنية تدريبية مبنية على المنهجية التطبيقية لتحويل الآية إلى سلوك." },
      { property: "og:title", content: "الحقائب القرآنية" },
      { property: "og:description", content: "حقائب تدريبية تحوّل مفاهيم القرآن إلى خطوات عملية وسلوك مقاس." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: bags } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">الحقائب القرآنية</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
        نستهدف 12 حقيبة قرآنية. المتاح حاليًا {bags.length} حقيبة، وتُضاف بقية الحقائب من لوحة الإدارة.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bags.map((b) => (
          <Link key={b.id} to="/bags/$slug" params={{ slug: b.slug }} className="overflow-hidden rounded-2xl border border-border bg-card hover:shadow-soft">
            {bagImage(b.slug) && (
              <img
                src={bagImage(b.slug)}
                alt={`غلاف حقيبة ${b.title}`}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
            )}
            <div className="p-6">
            <p className="ayah text-lg text-primary">{b.verse}</p>
            <p className="mt-1 text-xs text-muted-foreground">{b.verse_reference}</p>
            <h2 className="mt-3 font-display text-lg font-bold text-primary-deep">{b.title}</h2>
            {b.concept && <span className="mt-2 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs text-accent-foreground">التصور: {b.concept}</span>}
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{b.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
