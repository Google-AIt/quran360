import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Compass,
  GraduationCap,
  ListChecks,
  PlayCircle,
  Search,
  Sparkles,
  Target,
  Video,
} from "lucide-react";
import { getCourses, getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      {
        name: "description",
        content:
          "أكاديمية إلكترونية لتطبيق القرآن: كتالوج دورات تطبيقية، فيديوهات وأنشطة وتحديات وتقييم، قياس أثر Q360، عضوية سنوية، وشهادة إتمام.",
      },
      { property: "og:title", content: "أكاديمية القرآن خطوة بخطوة" },
      {
        property: "og:description",
        content: "تعلّم القرآن… طبّقه… واجعله سلوكًا. دورات تطبيقية مع تحديات وقياس أثر وشهادة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const features = [
  {
    icon: BookOpenCheck,
    title: "دورات قرآنية تطبيقية",
    text: "دورات إلكترونية مصممة حول معانٍ ومبادئ قرآنية محددة، وتحويلها إلى ممارسات عملية.",
  },
  {
    icon: Video,
    title: "تعلم بالفيديو",
    text: "محتوى مرئي منظم يمكنك مشاهدته في الوقت والمكان المناسبين لك.",
  },
  {
    icon: ClipboardList,
    title: "أنشطة وتطبيقات",
    text: "لا تكتفي بالمشاهدة؛ تنتقل إلى نشاط وتطبيق عملي مرتبط بحياتك.",
  },
  {
    icon: Target,
    title: "تحديات عملية",
    text: "تحديات تساعدك على تحويل ما تعلمته إلى سلوك يمكن ممارسته وملاحظته.",
  },
  {
    icon: BarChart3,
    title: "قياس الأثر Q360",
    text: "قياس يساعدك على معرفة مدى انتقال التعلم من المعرفة إلى التطبيق والسلوك.",
  },
  {
    icon: Award,
    title: "شهادة إتمام",
    text: "تحصل على شهادة عند استكمال متطلبات الدورة واجتياز التقييم.",
  },
];

const journey: [string, string][] = [
  ["التسجيل", "أنشئ حسابك وابدأ رحلتك."],
  ["شاهد", "شاهد الدرس وتعرّف على المفهوم القرآني."],
  ["افهم", "اختبر فهمك من خلال الأسئلة والتقييم."],
  ["طبّق", "حوّل ما تعلمته إلى ممارسة في حياتك."],
  ["تحدَّ", "نفّذ التحدي العملي المرتبط بالدورة."],
  ["قيّم", "راجع تجربتك ونتائج تطبيقك."],
  ["Q360", "قِس الأثر السلوكي كما يراه من حولك."],
  ["أكمل", "استكمل متطلبات الدورة."],
  ["الشهادة", "احصل على شهادة الإتمام الإلكترونية."],
];

const includes = [
  "فيديوهات تعليمية",
  "أنشطة تطبيقية",
  "تحديات عملية",
  "مهام",
  "تقييم",
  "Q360 لقياس الأثر",
  "متابعة نسبة الإنجاز",
  "شهادة إتمام",
];

const categories = [
  "جميع الدورات",
  "تطبيق القرآن",
  "السلوك القرآني",
  "مهارات الحياة",
  "الأسرة",
  "العمل",
  "القيادة",
  "دورات المدارس",
];

const upcoming = [
  ["دورة قادمة", "تعلم معنى قرآنيًا، وحوّله إلى ممارسة يومية."],
  ["دورة قادمة", "رحلة تطبيقية تجمع بين التعلم والممارسة وقياس الأثر."],
  ["دورة قادمة", "تعلّم ← طبّق ← تحدَّ ← قِس أثرك."],
];

const membershipFor = [
  "بناء رحلة تعلم قرآنية مستمرة.",
  "الوصول إلى أكثر من دورة.",
  "متابعة تقدمك في التعلم.",
  "تطبيق ما تتعلمه عمليًا.",
  "الاستفادة من التحديات والأنشطة.",
  "قياس أثرك من خلال Q360.",
];

const dashboardItems = [
  "الدورات المسجل بها",
  "نسبة الإنجاز",
  "الدروس المكتملة",
  "الأنشطة والتحديات",
  "نتائج التقييم",
  "Q360",
  "الشهادات",
];

const equation = [
  "محتوى قرآني",
  "تعلم بالفيديو",
  "نشاط",
  "تطبيق",
  "تحدي",
  "تقييم",
  "Q360",
  "شهادة",
];

function Page() {
  const { data } = useSuspenseQuery(q);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState(categories[0]!);

  const courses = useMemo(() => {
    const t = term.trim();
    if (!t) return data.courses;
    return data.courses.filter(
      (c) => c.title.includes(t) || (c.description ?? "").includes(t) || c.verse?.includes(t),
    );
  }, [data.courses, term]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="Quran Step by Step Academy"
        title="أكاديمية القرآن خطوة بخطوة"
        description="تعلّم القرآن… طبّقه… واجعله سلوكًا. دورات إلكترونية تطبيقية تنقلك من فهم المعنى القرآني إلى ممارسته في حياتك اليومية، عبر فيديوهات قصيرة وأنشطة عملية وتحديات وتقييمات وقياس للأثر."
        actions={
          <>
            <Button asChild variant="secondary">
              <a href="#catalog">
                <Compass /> استكشف الدورات
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="#membership">
                <GraduationCap /> ابدأ عضويتك
              </a>
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="5" label="دروس تطبيقية لكل دورة" />
          <HeroStat value="Q360" label="قياس الأثر السلوكي" />
          <HeroStat value="شهادة" label="عند إتمام الرحلة" />
        </div>
      </PageHero>

      <section className="mt-16">
        <SectionTitle
          title="ماذا ستجد في الأكاديمية؟"
          subtitle="حتى لا يبقى القرآن معرفة تُتعلّم، بل سلوكًا يُعاش."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{f.title}</h3>
              <p className="mt-2 text-sm leading-8 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="catalog" className="mt-16 scroll-mt-24">
        <SectionTitle
          title="اكتشف دورات الأكاديمية"
          subtitle="كل دورة رحلة قصيرة ومركزة لتحويل معنى قرآني إلى ممارسة يومية."
        />
        <div className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="ابحث عن دورة…"
              className="pe-11"
              aria-label="ابحث عن دورة"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-primary-deep"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {courses.map((c) => {
            const minutes = c.lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0);
            return (
              <article
                key={c.id}
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="ayah text-lg text-primary">{c.verse}</p>
                  <BookOpenCheck className="size-6 shrink-0 text-gold" />
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-primary-deep">{c.title}</h3>
                <p className="mt-2 leading-8 text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-3 py-1 text-primary-deep">
                    {c.lessons.length} دروس تطبيقية
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-primary-deep">
                    <Clock3 className="size-3" /> حوالي {minutes} دقيقة
                  </span>
                </div>
                <ol className="mt-6 space-y-2">
                  {c.lessons.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-start gap-3 rounded-2xl bg-secondary/60 px-4 py-3 text-sm"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-xs text-primary-foreground">
                        {String(l.lesson_number).padStart(2, "0")}
                      </span>
                      <span className="text-primary-deep">
                        {l.title}
                        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="size-3" />
                          {l.description} · {l.duration_minutes} دقيقة
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-wrap gap-2">
                  {includes.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground"
                    >
                      <CheckCircle2 className="size-3 text-primary" /> {i}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                  <span className="font-display text-lg font-bold text-primary">
                    {c.price} ريال
                  </span>
                  <Button asChild>
                    <Link to="/courses/$slug" params={{ slug: c.slug }}>
                      <PlayCircle /> ابدأ الدورة
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
        {courses.length === 0 && (
          <p className="mt-8 rounded-2xl bg-secondary/70 p-6 text-center text-muted-foreground">
            لا توجد دورة مطابقة لبحثك حاليًا.
          </p>
        )}
      </section>

      <section className="mt-16">
        <SectionTitle
          title="دورات قادمة"
          subtitle="مع إطلاق كل حقيبة قرآنية جديدة، تُضاف دورتها إلى كتالوج الأكاديمية."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {upcoming.map(([t, d], i) => (
            <div
              key={i}
              className="rounded-3xl border border-dashed border-border bg-secondary/40 p-6"
            >
              <span className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs text-primary-deep">
                قريبًا
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{t}</h3>
              <p className="mt-2 text-sm leading-8 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="كيف تتعلم في الأكاديمية؟"
          subtitle="رحلة واحدة… من المشاهدة إلى الأثر."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {journey.map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary font-display text-sm text-primary-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-bold text-primary-deep">{t}</h3>
              </div>
              <p className="mt-3 text-sm leading-8 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="membership" className="mt-16 scroll-mt-24">
        <div className="overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-soft md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs">
                عضوية الأكاديمية
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold md:text-3xl">
                تعلّم أكثر… وطبّق أكثر
              </h2>
              <p className="mt-4 leading-9 text-primary-foreground/85">
                بدل شراء كل دورة بشكل منفصل، يمكنك الاشتراك في عضوية المتدرب السنوية التي تشمل جميع
                دورات الأكاديمية، وتمنحك الوصول إلى الدورات التي يتم إطلاقها وفق سياسة العضوية.
              </p>
              <div className="mt-6 font-display text-3xl font-bold">
                {data.settings["price_trainee_membership"]} ريال
                <span className="text-base font-normal text-primary-foreground/75"> / سنويًا</span>
              </div>
              <Button asChild variant="secondary" className="mt-6">
                <Link to="/store">
                  <Sparkles /> اشترك في العضوية
                </Link>
              </Button>
            </div>
            <ul className="grid gap-3 self-center">
              {membershipFor.map((m) => (
                <li
                  key={m}
                  className="flex items-start gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <SectionTitle
            title="شهادتك ليست مجرد مشاهدة"
            subtitle="إكمال الفيديوهات وحده ليس نهاية الرحلة."
          />
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {["تعلّم", "طبّق", "قيّم", "أكمل", "الشهادة"].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-4 py-2 text-primary-deep">{s}</span>
                {i < arr.length - 1 && <span className="text-gold">←</span>}
              </span>
            ))}
          </div>
          <p className="mt-6 leading-8 text-muted-foreground">
            بعد استكمال متطلبات الدورة واجتياز التقييم، يحصل المتدرب على شهادة إتمام إلكترونية؛ فتصبح
            الشهادة مرتبطة برحلة تعلم وتقييم، لا بمجرد التسجيل في الدورة.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <SectionTitle title="من التعلم إلى قياس الأثر" subtitle="ماذا تغيّر بعد الدورة؟" />
          <ol className="mt-6 space-y-3">
            {["ماذا تعلّمت؟", "ماذا طبّقت؟", "ماذا تغيّر في سلوكك؟", "ما الأثر الذي تحقق؟"].map(
              (s) => (
                <li
                  key={s}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-primary-deep"
                >
                  <BarChart3 className="size-4 text-primary" /> {s}
                </li>
              ),
            )}
          </ol>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/q360">تعرّف على Q360</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="حسابك في الأكاديمية"
          subtitle="لوحة تعلم شخصية تجيبك دائمًا: أين أنا؟ وماذا أنجزت؟ وما الخطوة التالية؟"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardItems.map((d) => (
            <div
              key={d}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-sm text-primary-deep shadow-sm"
            >
              <ListChecks className="size-4 text-primary" /> {d}
            </div>
          ))}
        </div>
        <Button asChild className="mt-6">
          <Link to="/account">افتح لوحة تعلمك</Link>
        </Button>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="لماذا أكاديمية القرآن خطوة بخطوة؟"
          subtitle="ليست مكتبة فيديوهات، وليست مجرد منصة لبيع الدورات… إنها رحلة تعلم تطبيقية."
        />
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {equation.map((e, i, arr) => (
            <span key={e} className="flex items-center gap-2">
              <span className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-primary-deep shadow-sm">
                {e}
              </span>
              <span className="text-gold">{i < arr.length - 1 ? "+" : "="}</span>
            </span>
          ))}
          <span className="rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
            تعلّم يتحول إلى سلوك
          </span>
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl bg-hero px-6 py-14 text-center text-primary-foreground shadow-soft md:px-12">
        <h2 className="font-display text-2xl font-bold md:text-3xl">رؤيتنا للأكاديمية</h2>
        <p className="mx-auto mt-5 max-w-3xl leading-9 text-primary-foreground/85">
          أن يصبح تطبيق القرآن تجربة تعلم يمكن أن يعيشها كل شخص… خطوة بخطوة. لا نريد أن تكون
          النتيجة: «أنهيت دورة»، بل: «تعلمت معنى من القرآن… وبدأت أعيشه».
        </p>
        <p className="mt-6 font-display text-lg">القرآن خطوة بخطوة · تعلّم ← طبّق ← تغيّر</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <a href="#catalog">استكشف الدورات</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="#membership">ابدأ عضويتك</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
