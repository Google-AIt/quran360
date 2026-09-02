import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { getBags, getProducts } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { productImage } from "@/lib/product-images";
import { contentFor, categoryLabels } from "@/lib/product-content";
import { ObjectiveChips } from "@/components/site/BagObjectives";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle } from "@/components/site/PageHero";

const q = queryOptions({
  queryKey: ["store"],
  queryFn: async () => ({ products: await getProducts(), bags: await getBags() }),
});

export const Route = createFileRoute("/store")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المتجر | حقائب ودورات وعضويات القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "متجر المنصة: الدورات الإلكترونية، عضوية المتدرب والميسّر، تأهيل الميسّرين، Q360، وبرامج المدارس.",
      },
      { property: "og:title", content: "متجر القرآن خطوة بخطوة" },
      { property: "og:description", content: "اشترِ الدورات والعضويات وخدمة قياس الأثر Q360." },
    ],
  }),
  component: Page,
});

const period: Record<string, string> = { one_time: "دفعة واحدة", yearly: "سنويًا" };

const steps = [
  { n: "١", t: "اختر الحقيبة أو الخدمة", d: "حدّد الآية أو المهارة التي تريد التدرب عليها" },
  { n: "٢", t: "أضف إلى السلة", d: "راجع تفاصيل المنتج وما يشمله قبل الشراء" },
  { n: "٣", t: "أكمل الطلب", d: "تفعيل يدوي أو تحويل بنكي معتمد" },
  { n: "٤", t: "ابدأ التطبيق", d: "خطوات عملية وقياس أثر بعد التدريب" },
];

function Page() {
  const { data } = useSuspenseQuery(q);
  const { products, bags } = data;
  const { add, count } = useCart();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="متجر القرآن خطوة بخطوة"
        title="اختر مسارك نحو قرآنٍ يمشي على الأرض"
        description="منتجات تدريبية أصيلة تجمع بين الآية، والمهارة، والتطبيق، وقياس الأثر. اختر الحقيبة أو البرنامج الذي يلامس احتياجك وابدأ بخطوة واضحة."
        actions={
          <Button asChild size="lg">
            <Link to="/cart">
              <ShoppingBag /> عرض السلة{count > 0 ? ` (${count})` : ""}
            </Link>
          </Button>
        }
      >
        <ol className="grid gap-4 border-t border-primary-foreground/20 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold font-display text-sm font-bold text-accent-foreground">
                {s.n}
              </span>
              <span>
                <span className="block font-display text-sm font-bold">{s.t}</span>
                <span className="mt-1 block text-xs leading-6 text-primary-foreground/70">
                  {s.d}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </PageHero>

      <section className="mt-16">
        <SectionTitle
          title="الحقائب القرآنية"
          subtitle="ابدأ من الآية الأقرب إلى احتياجك، وانتقل معها من فهم المعنى إلى ممارسة السلوك."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bags.map((b) => (
            <Link
              key={b.id}
              to="/bags/$slug"
              params={{ slug: b.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              {bagImage(b.slug) && (
                <img
                  src={bagImage(b.slug)}
                  alt={`غلاف حقيبة ${b.title}`}
                  loading="lazy"
                  width={1200}
                  height={750}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-primary-deep">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                  {b.summary}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  تفاصيل الحقيبة ←
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-border pt-16">
        <SectionTitle
          title="الدورات والعضويات والخدمات"
          subtitle="مسارات مرنة للأفراد والميسّرين والمدارس، مصممة لترافقك من أول خطوة حتى الأثر."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const c = contentFor(p.slug);
            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative">
                  {productImage(p.slug) && (
                    <img
                      src={productImage(p.slug)}
                      alt={p.title}
                      loading="lazy"
                      width={1024}
                      height={640}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  )}
                  {c?.badge && (
                    <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      {c.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {categoryLabels[p.category] ?? p.category}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-primary-deep">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {c?.tagline ?? p.description}
                  </p>
                  {c && (
                    <>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">{c.audience}</p>
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                        {c.includes.map((it) => (
                          <li key={it} className="flex gap-2">
                            <span aria-hidden className="mt-1 text-primary">
                              ✦
                            </span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 rounded-xl bg-gold-soft px-4 py-3 text-xs leading-6 text-accent-foreground">
                        النتيجة: {c.outcome}
                      </p>
                    </>
                  )}
                  <div className="mt-6 flex flex-1 items-end justify-between gap-3">
                    <span className="font-display text-xl font-bold text-primary">
                      {p.price} ريال{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        {period[p.billing_period]}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        add({
                          productId: p.id,
                          slug: p.slug,
                          title: p.title,
                          price: Number(p.price),
                          billing_period: p.billing_period,
                        });
                        toast.success("تمت الإضافة إلى السلة");
                      }}
                    >
                      أضف للسلة
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
