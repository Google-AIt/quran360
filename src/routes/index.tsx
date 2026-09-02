import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpenText,
  GraduationCap,
  School,
  Users,
  Gauge,
  Sparkles,
} from "lucide-react";
import { getBags, getSettings, getStories } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: async () => ({
    bags: await getBags(),
    settings: await getSettings(),
    stories: await getStories(),
  }),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  head: () => ({
    meta: [
      { title: "القرآن خطوة بخطوة | منصة التدريب على تطبيق القرآن" },
      {
        name: "description",
        content:
          "منصة عربية متكاملة للتدريب على تطبيق القرآن الكريم: منهجية تطبيقية، حقائب قرآنية، أكاديمية، برامج مدارس، وقياس أثر Q360.",
      },
      { property: "og:title", content: "القرآن خطوة بخطوة" },
      {
        property: "og:description",
        content: "تعلّم وتدرّب خطوة بخطوة على تطبيق القرآن، لتكون قرآنًا يمشي على الأرض.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "القرآن خطوة بخطوة",
          url: "https://quran360.lovable.app",
          description:
            "منصة عربية متكاملة للتدريب على تطبيق القرآن الكريم: منهجية تطبيقية، حقائب قرآنية، أكاديمية، برامج مدارس، وقياس أثر Q360.",
          inLanguage: "ar",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "القرآن خطوة بخطوة",
          url: "https://quran360.lovable.app",
          inLanguage: "ar",
        }),
      },
    ],
  }),
  component: Home,
});

const journey = [
  "آية قرآنية",
  "تصور ذهني صحيح",
  "خطوات عملية",
  "تدريب",
  "تطبيق",
  "سلوك",
  "قياس الأثر",
  "قرآنًا يمشي على الأرض",
];

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const s = data.settings;

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs">
              <Sparkles className="size-3.5 text-gold" />
              منظومة متكاملة للتدريب على تطبيق القرآن
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.25] md:text-6xl">
              القرآن خطوة بخطوة
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-primary-foreground/85">
              تعلّم وتدرّب خطوة بخطوة على تطبيق القرآن، لتكون قرآنًا يمشي على الأرض.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/academy"
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                ابدأ التدريب <ArrowLeft className="size-4" />
              </Link>
              <Link
                to="/bags"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/35 px-6 py-3 font-medium hover:bg-primary-foreground/10"
              >
                استكشف الحقائب
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-primary-foreground/20 bg-primary-foreground/5 p-6 backdrop-blur">
            <p className="ayah text-center text-2xl text-gold">﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm">
              {[
                ["12", "حقيبة قرآنية"],
                ["12", "دورة إلكترونية"],
                ["5", "مراحل منهجية"],
                ["Q360", "قياس الأثر"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-primary-foreground/10 px-3 py-4">
                  <div className="font-display text-2xl font-bold text-gold">{v}</div>
                  <div className="mt-1 text-primary-foreground/75">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading
          title="من معرفة القرآن إلى تطبيق القرآن"
          subtitle="مسار واضح ينقل الآية من الفهم إلى سلوك يُقاس أثره."
        />
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((step, i) => (
            <li
              key={step}
              className={`relative rounded-2xl border p-5 ${
                i === journey.length - 1
                  ? "border-gold bg-gold-soft"
                  : "border-border bg-card"
              }`}
            >
              <span className="font-display text-xs text-muted-foreground">المرحلة {i + 1}</span>
              <p className="mt-1 font-display text-base font-bold text-primary-deep">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Methodology */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            title="المنهجية التطبيقية"
            subtitle="التصور الذهني الصحيح ← الخطوات العملية ← النتائج ← التطبيق ← قياس الأثر"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              ["التصور الذهني الصحيح", "استخراج المفهوم والصورة الذهنية من الآية باعتبارها المبدأ."],
              ["الخطوات العملية", "تحويل التصور إلى خطوات واضحة قابلة للتدريب."],
              ["النتائج", "تحديد النتائج التي تظهر عند تطبيق الخطوات."],
              ["التطبيق", "ممارسة الخطوات في مواقف الحياة الواقعية."],
              ["قياس الأثر", "قياس انتقال المعرفة إلى سلوك وتغير فعلي."],
            ].map(([t, d], i) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display">
                  {i + 1}
                </div>
                <h3 className="font-display text-base font-bold text-primary-deep">{t}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/methodology" className="inline-flex items-center gap-2 font-medium text-primary">
              تعرّف على المنهجية كاملة <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bags */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading title="الحقائب القرآنية" subtitle="حقائب تدريبية مبنية على المنهجية التطبيقية." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.bags.slice(0, 6).map((bag) => (
            <Link
              key={bag.id}
              to="/bags/$slug"
              params={{ slug: bag.slug }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-soft"
            >
              {bagImage(bag.slug) && (
                <img
                  src={bagImage(bag.slug)}
                  alt={`غلاف حقيبة ${bag.title}`}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="p-6">
              <p className="ayah text-lg text-primary">{bag.verse}</p>
              <h3 className="mt-3 font-display text-lg font-bold text-primary-deep">{bag.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{bag.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                تفاصيل الحقيبة <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/bags" className="inline-flex items-center gap-2 font-medium text-primary">
            جميع الحقائب <ArrowLeft className="size-4" />
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: GraduationCap, title: "الأكاديمية", desc: `دورات إلكترونية من 5 دروس — ${s["price_course"]} ريال للدورة.`, to: "/academy" as const },
            { icon: Users, title: "الميسّرون", desc: `تأهيل واعتماد الميسّرين — العضوية ${s["price_facilitator_membership"]} ريال سنويًا.`, to: "/facilitators" as const },
            { icon: School, title: "المدارس", desc: "برنامج متكامل لبناء الثقافة والسلوك القرآني في البيئة المدرسية.", to: "/schools" as const },
            { icon: Gauge, title: "Q360", desc: `قياس الأثر القرآني — ${s["price_q360"]} ريال.`, to: "/q360" as const },
          ].map((c) => (
            <Link key={c.title} to={c.to} className="rounded-2xl border border-border bg-card p-6 hover:shadow-soft">
              <c.icon className="size-7 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{c.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeading title="قصص الأثر" subtitle="قرآنًا يمشي على الأرض." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {data.stories.map((st) => (
            <article key={st.id} className="rounded-2xl border border-border bg-card p-6">
              <BookOpenText className="size-6 text-gold" />
              <h3 className="mt-3 font-display text-base font-bold text-primary-deep">{st.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{st.story}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {st.person_name} — {st.person_role}
                {st.change_percent ? ` · نسبة التغير ${st.change_percent}%` : ""}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-hero px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-bold">ابدأ رحلتك اليوم</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-8 text-primary-foreground/85">
            سجّل في الأكاديمية أو اشترك في عضوية المتدرب ({s["price_trainee_membership"]} ريال سنويًا)
            لتصل إلى جميع الدورات والحقائب وأدوات قياس الأثر.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/account" className="rounded-xl bg-gold px-6 py-3 font-medium text-accent-foreground">
              إنشاء حساب
            </Link>
            <Link to="/store" className="rounded-xl border border-primary-foreground/35 px-6 py-3 font-medium">
              زيارة المتجر
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-bold text-primary-deep">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl leading-8 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
