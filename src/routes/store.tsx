import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBags, getProducts } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { productImage } from "@/lib/product-images";
import { contentFor, categoryLabels } from "@/lib/product-content";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

const q = queryOptions({
  queryKey: ["store"],
  queryFn: async () => ({ products: await getProducts(), bags: await getBags() }),
});

export const Route = createFileRoute("/store")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المتجر | حقائب ودورات وعضويات القرآن خطوة بخطوة" },
      { name: "description", content: "متجر المنصة: الدورات الإلكترونية، عضوية المتدرب والميسّر، تأهيل الميسّرين، Q360، وبرامج المدارس." },
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
    <div className="mx-auto max-w-7xl px-4 py-16">
      <header className="rounded-3xl border border-border bg-card/60 p-8 md:p-12">
        <span className="inline-flex rounded-full bg-gold-soft px-4 py-1 text-xs font-medium text-accent-foreground">
          متجر المنصة
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold text-primary-deep">حقائب وبرامج للتدريب على تطبيق القرآن</h1>
        <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
          كل منتج هنا مبني على المنهجية التطبيقية: تصحيح التصور الذهني للآية، ثم ربط المتدرب بالمهارة المحددة فيها، ثم
          خطوات عملية محددة تُنفَّذ ويُقاس أثرها. الأسعار بالريال السعودي.
        </p>
        <Link
          to="/cart"
          className="mt-6 inline-flex rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          عرض السلة{count > 0 ? ` (${count})` : ""}
        </Link>

        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {s.n}
              </span>
              <span>
                <span className="block font-display text-sm font-bold text-primary-deep">{s.t}</span>
                <span className="mt-1 block text-xs leading-6 text-muted-foreground">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </header>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-primary-deep">الحقائب القرآنية</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          حقائب تدريبية تتبع طريقة مبتكرة: إضاءة تشرح مفهوم الآية وصورها الذهنية، ثم تدريب على خطوات عملية محددة توصل
          إلى نتائج مباشرة، لنكون قرآنًا يمشي على الأرض.
        </p>
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
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-primary-deep">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{b.summary}</p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">تفاصيل الحقيبة ←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-bold text-primary-deep">الدورات والعضويات والخدمات</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          اختر ما يناسبك: دورة مفردة، عضوية سنوية، تأهيل واعتماد ميسّر، أو قياس أثر Q360 وبرامج المدارس.
        </p>
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
                  <h3 className="mt-3 font-display text-lg font-bold text-primary-deep">{p.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{c?.tagline ?? p.description}</p>
                  {c && (
                    <>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">{c.audience}</p>
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-foreground/80">
                        {c.includes.map((it) => (
                          <li key={it} className="flex gap-2">
                            <span aria-hidden className="mt-1 text-primary">✦</span>
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
                      <span className="text-xs font-normal text-muted-foreground">{period[p.billing_period]}</span>
                    </span>
                    <button
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
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
                    >
                      أضف للسلة
                    </button>
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
