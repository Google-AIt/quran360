import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, ShoppingBag, Sparkles } from "lucide-react";
import { getBags, getProducts } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { productImage } from "@/lib/product-images";
import { contentFor, categoryLabels } from "@/lib/product-content";
import { contentForBag } from "@/lib/bag-content";
import { detailForCourse, courseIncludes } from "@/lib/course-details";
import { BagObjectives, ObjectiveChips } from "@/components/site/BagObjectives";
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
          "متجر المنتجات التعليمية القرآنية: الدورات التطبيقية بأهدافها الثلاثة، عضوية المتدرب، تأهيل الميسّرين، Q360، وبرامج المدارس.",
      },
      { property: "og:title", content: "متجر القرآن خطوة بخطوة" },
      {
        property: "og:description",
        content: "تعلّم القرآن… طبّقه… واجعله أسلوب حياة. دورات وحقائب وبرامج قرآنية تطبيقية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const period: Record<string, string> = { one_time: "دفعة واحدة", yearly: "سنويًا" };

const learningSteps: [string, string][] = [
  ["شاهد", "شاهد الدرس بالفيديو."],
  ["افهم", "تعرف على المفهوم القرآني والتصور الذهني."],
  ["طبّق", "نفّذ النشاط والخطوة العملية."],
  ["تحدَّ", "حوّل التعلم إلى ممارسة."],
  ["قيّم", "اختبر فهمك وتقدمك."],
  ["قِس الأثر", "تعرف على ما تغيّر في سلوكك."],
  ["الشهادة", "احصل عليها بعد استكمال متطلبات الدورة."],
];

const chain = [
  "الآية",
  "المفهوم",
  "المهارة",
  "الخطوات العملية",
  "التطبيق",
  "النتيجة",
  "قياس الأثر",
];

function Page() {
  const { data } = useSuspenseQuery(q);
  const { products, bags } = data;
  const { add, count } = useCart();

  const addToCart = (p: {
    id: string;
    slug: string;
    title: string;
    price: number | string;
    billing_period: string;
  }) => {
    add({
      productId: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      billing_period: p.billing_period,
    });
    toast.success("تمت الإضافة إلى السلة");
  };

  const others = products.filter((p) => p.category !== "bag");
  const schoolProducts = others.filter((p) => p.category === "school");
  const generalProducts = others.filter((p) => p.category !== "school");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <section className="overflow-hidden rounded-3xl bg-hero px-6 py-10 text-primary-foreground md:px-12 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-gold">المتجر | القرآن خطوة بخطوة</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            تعلّم القرآن… طبّقه… واجعله أسلوب حياة
          </h1>
          <p className="mt-5 text-base leading-9 text-primary-foreground/85 md:text-lg">
            دورات وحقائب وبرامج قرآنية تطبيقية، صُممت لتساعدك على الانتقال من فهم الآية ← إلى
            اكتساب المهارة ← إلى التطبيق ← إلى قياس الأثر.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <a href="#courses">استكشف الدورات</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="#products">استكشف جميع المنتجات</a>
            </Button>
            <Button asChild size="lg">
              <Link to="/cart">
                <ShoppingBag /> السلة{count > 0 ? ` (${count})` : ""}
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-10 grid gap-3 border-t border-primary-foreground/20 pt-6 sm:grid-cols-3">
          {[
            ["01", "فهم الآية", "مفهوم قرآني صحيح"],
            ["02", "اكتساب المهارة", "خطوات عملية للتطبيق"],
            ["03", "قياس الأثر", "تقرير يوثّق ما تغيّر فيك"],
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

      <section className="mt-14">
        <BagObjectives title="منهجية كل منتج" />
      </section>

      <section id="courses" className="mt-16 scroll-mt-24">
        <SectionTitle
          title="الدورات القرآنية"
          subtitle="اختر الدورة الأقرب إلى احتياجك؛ كل دورة تبدأ من مفهوم قرآني ثم تحوّله إلى مهارة وخطوات عملية قابلة للتطبيق."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bags.map((b) => {
            const bag = contentForBag(b.slug);
            const d = detailForCourse(b.slug);
            const prod = products.find((p) => p.slug === `bag-${b.slug}`);
            return (
              <article
                key={b.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
              >
                <Link to="/bags/$slug" params={{ slug: b.slug }}>
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
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-lg font-bold text-primary-deep">
                    دورة {b.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {d?.subtitle ?? bag?.focus}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {d?.summary ?? bag?.description ?? b.summary}
                  </p>

                  {d && (
                    <>
                      <h4 className="mt-5 font-display text-sm font-bold text-primary-deep">
                        ماذا ستتعلم؟
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-sm leading-7 text-foreground/80">
                        {d.learn.map((l) => (
                          <li key={l} className="flex gap-2">
                            <CheckCircle2 className="mt-1.5 size-3.5 shrink-0 text-primary" />
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>

                      <h4 className="mt-5 font-display text-sm font-bold text-primary-deep">
                        أهداف الدورة
                      </h4>
                      <ul className="mt-2 space-y-2 text-xs leading-6">
                        {[
                          ["معرفي", d.objectives.cognitive],
                          ["مهاري", d.objectives.skill],
                          ["سلوكي", d.objectives.behavior],
                        ].map(([k, v]) => (
                          <li key={k} className="rounded-xl bg-secondary/60 px-3 py-2">
                            <span className="font-bold text-primary-deep">{k}:</span>{" "}
                            <span className="text-muted-foreground">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {!d && <ObjectiveChips className="mt-4" />}

                  <h4 className="mt-5 font-display text-sm font-bold text-primary-deep">
                    تشمل الدورة
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {courseIncludes.map((i) => (
                      <span
                        key={i}
                        className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground"
                      >
                        {i}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-1 items-end justify-between gap-3 border-t border-border pt-5">
                    <span className="font-display text-xl font-bold text-primary">
                      {prod ? `${prod.price} ريال` : "300 ريال"}{" "}
                      {prod && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {period[prod.billing_period]}
                        </span>
                      )}
                    </span>
                    {prod ? (
                      <Button size="sm" onClick={() => addToCart(prod)}>
                        اشترك الآن
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/bags/$slug" params={{ slug: b.slug }}>
                          تفاصيل الحقيبة
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <Link
                      to="/bags/$slug"
                      params={{ slug: b.slug }}
                      className="font-medium text-primary"
                    >
                      عرض التفاصيل ←
                    </Link>
                    {d?.source && (
                      <a
                        href={d.source}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                      >
                        الصفحة الأصلية <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-20">
        <SectionTitle title="طريقة التعلم" subtitle="دورة واحدة… رحلة متكاملة." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {learningSteps.map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-sm text-primary-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-primary-deep">{t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-secondary/70 px-6 py-4 text-center font-display text-primary-deep">
          شاهد ← افهم ← طبّق ← تحدَّ ← قِس ← تغيّر
        </p>
      </section>

      <section id="products" className="mt-20 scroll-mt-24 border-t border-border pt-16">
        <SectionTitle
          title="منتجات أخرى في المتجر"
          subtitle="العضويات وبرامج تأهيل الميسّرين وخدمة قياس الأثر Q360."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {generalProducts.map((p) => {
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
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
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
                    <Button size="sm" onClick={() => addToCart(p)}>
                      اشترك الآن
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {schoolProducts.length > 0 && (
        <section className="mt-20">
          <SectionTitle
            title="برامج المدارس"
            subtitle="منتجات مخصصة للمدارس التي تريد إدماج تطبيق القرآن في خطتها التعليمية."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {schoolProducts.map((p) => (
              <article
                key={p.id}
                className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center"
              >
                <div>
                  <h3 className="font-display text-lg font-bold text-primary-deep">{p.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.description}</p>
                  <span className="mt-3 block font-display text-xl font-bold text-primary">
                    {p.price} ريال{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {period[p.billing_period]}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/schools">اعرف المزيد</Link>
                  </Button>
                  <Button size="sm" onClick={() => addToCart(p)}>
                    أضف للسلة
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-20">
        <SectionTitle
          title="لماذا متجر القرآن خطوة بخطوة؟"
          subtitle="منتجات تعليمية وليست مجرد محتوى؛ نربط المفاهيم القرآنية بالواقع العملي ونحوّلها إلى خطوات يمكن تطبيقها وقياس نتائجها."
        />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {chain.map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <span className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-primary-deep shadow-sm">
                {c}
              </span>
              {i < chain.length - 1 && <span className="text-gold">←</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl bg-hero px-6 py-14 text-center text-primary-foreground shadow-soft md:px-12">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          لا تكتفِ بتعلّم القرآن… تعلّم كيف تطبّقه.
        </h2>
        <p className="mt-4 text-primary-foreground/85">القرآن خطوة بخطوة · تعلّم · طبّق · تغيّر</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <a href="#courses">
              <Sparkles /> استكشف الدورات
            </a>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/cart">عرض السلة</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
