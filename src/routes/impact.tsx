import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  Repeat2,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { getStories } from "@/lib/public.functions";
import { getImpactStats } from "@/lib/stats.functions";
import { getSettings } from "@/lib/public.functions";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

const q = queryOptions({
  queryKey: ["impact"],
  queryFn: async () => ({
    stories: await getStories(),
    stats: await getImpactStats(),
    settings: await getSettings(),
  }),
});

export const Route = createFileRoute("/impact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "Q360 — قياس أثر التدريب | القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "Q360 خدمة داخل كل دورة تقيس أثر التدريب على السلوك: قياس قبلي، تدريب وتطبيق، قياس بعدي، وتقرير أثر يوضح ما تغيّر فيك كما يراه من حولك.",
      },
      { property: "og:title", content: "Q360 — قياس أثر التدريب" },
      {
        property: "og:description",
        content:
          "لا نكتفي بأن تسأل نفسك: هل استفدت من الدورة؟ بل نكتشف: هل ظهر أثرها في سلوكك كما يراه من حولك؟",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const howSteps = [
  {
    icon: ClipboardList,
    t: "1. قياس قبلي",
    d: "قبل بدء الدورة، تقوم بتقييم مستوى ممارستك للمهارات والسلوكيات التي تستهدفها الدورة.",
  },
  {
    icon: UsersRound,
    t: "2. تقييم من حولك",
    d: "بحسب طبيعتك، يمكنك دعوة أشخاص يعرفونك ويتعاملون معك بشكل مستمر للمشاركة في التقييم، مثل: الأب والأم – المعلم – الزملاء – الأصدقاء – المدير – المرؤوسين – أعضاء الفريق وغيرها.",
  },
  {
    icon: Repeat2,
    t: "3. التدريب والتطبيق",
    d: "تدرس محتوى الدورة وتتعلم المنهجية العملية، ثم تطبق الخطوات والمهارات المستهدفة في حياتك.",
  },
  {
    icon: TrendingUp,
    t: "4. قياس بعدي",
    d: "بعد التدريب والتطبيق، تعيد تقييم نفسك، ويُعاد التقييم من المشاركين الذين اخترتهم؛ لنقيس ما إذا كان هناك تغير فعلي في السلوك.",
  },
  {
    icon: Eye,
    t: "5. تقرير الأثر",
    d: "تحصل على تقرير يوضح مستواك قبل التدريب وبعده، مقدار التحسن، المهارات الأكثر تطوراً، والجوانب التي ما زالت تحتاج إلى تطوير، والفرق بين تقييمك لنفسك وتقييم الآخرين لك، والملاحظات النوعية.",
  },
];

const exampleSkills = [
  "المبادرة وتحمل المسؤولية",
  "استثمار الوقت",
  "التغلب على التحديات",
  "استثمار نقاط القوة",
  "القدوة وصناعة التحول",
];

const exampleQuestions = [
  "هل أصبحت أكثر مبادرة؟",
  "هل أصبحت تستثمر وقتك بصورة أفضل؟",
  "هل أصبحت أكثر قدرة على مواجهة التحديات؟",
  "هل أصبحت تستخدم نقاط قوتك بصورة أفضل؟",
  "وهل لاحظ من حولك هذا التغيير فعلاً؟",
];

const reportItems = [
  "مستواك قبل التدريب.",
  "مستواك بعد التدريب.",
  "مقدار التحسن.",
  "المهارات الأكثر تطوراً.",
  "الجوانب التي ما زالت تحتاج إلى تطوير.",
  "الفرق بين تقييمك لنفسك وتقييم الآخرين لك.",
  "الملاحظات النوعية التي يقدمها المشاركون حول التغير الذي لاحظوه.",
];

const chain = ["فهم", "مهارة", "ممارسة", "سلوك", "أثر"];

function Page() {
  const { data } = useSuspenseQuery(q);
  const { stories, stats, settings } = data;
  const nf = new Intl.NumberFormat("ar-EG");
  const kpis: [string, string][] = [
    ["المتدربون", nf.format(stats.trainees)],
    ["الميسّرون", nf.format(stats.facilitators)],
    ["المدارس", nf.format(stats.schools)],
    ["المعلمون", nf.format(stats.teachers)],
    ["الطلاب", nf.format(stats.students)],
    ["الحقائب", nf.format(stats.bags)],
    ["الدورات", nf.format(stats.courses)],
    ["متوسط الإتمام", `${nf.format(stats.completionRate)}%`],
  ];
  const q360Price = settings["price_q360"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="تعلّم → طبّق → قِس الأثر"
        title="Q360 — قياس أثر التدريب"
        description="لا نكتفي بأن تسأل نفسك: هل استفدت من الدورة؟ بل نكتشف: هل ظهر أثرها في سلوكك كما يراه من حولك؟"
        actions={
          <Button asChild variant="secondary">
            <Link to="/store">
              اشترك في الدورة وابدأ قياس أثرك <ArrowLeft />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="360°" label="رؤية متكاملة للسلوك" />
          <HeroStat value="قبلي + بعدي" label="مراحل قياس قبل وبعد التدريب" />
          <HeroStat value="تقرير أثر" label="ما تغيّر فيك كما يراه من حولك" />
        </div>
      </PageHero>

      <section className="mt-16">
        <div className="max-w-3xl">
          <p className="text-base leading-9 text-foreground/90 md:text-lg">
            كل دورة تدريبية في منصة{" "}
            <span className="font-bold text-primary-deep">القرآن خطوة بخطوة</span> لا تهدف إلى تقديم
            المعرفة فقط، بل إلى تحويل المعاني القرآنية إلى{" "}
            <span className="font-bold text-primary">مهارات وسلوكيات عملية قابلة للملاحظة والقياس</span>.
          </p>
          <p className="mt-4 text-base leading-9 text-muted-foreground">
            لذلك تتضمن الدورة خدمة <span className="font-bold text-primary">Q360 لقياس أثر التدريب</span>،
            والتي تساعدك على معرفة مستوى ممارستك للمهارات المستهدفة{" "}
            <span className="font-bold text-primary-deep">قبل التدريب وبعده</span>، من خلال تقييمك
            لنفسك، والاستفادة من ملاحظات الأشخاص الذين يتعاملون معك في حياتك اليومية.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="كيف يعمل Q360؟"
          subtitle="رحلة واضحة تبدأ قبل أول درس وتنتهي بتقرير أثر خاص بك في هذه الدورة."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {howSteps.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gold-soft text-gold">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="مثال: دورة «فاستبقوا الخيرات»"
          subtitle="تقيس الدورة مجموعة من المهارات المستوحاة من المنهجية التطبيقية للآية."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-primary-deep">المهارات المستهدفة</h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-foreground/80">
              {exampleSkills.map((s) => (
                <li key={s} className="flex gap-2">
                  <span aria-hidden className="mt-1 text-gold">
                    ✦
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-gold bg-gold-soft p-6">
            <h3 className="font-display text-lg font-bold text-accent-foreground">
              فبدلاً من شهادة فقط… تعرف الإجابة
            </h3>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-accent-foreground">
              {exampleQuestions.map((qtxt) => (
                <li key={qtxt} className="flex gap-2">
                  <CheckCircle2 className="mt-1 size-4 shrink-0" />
                  <span>{qtxt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="لماذا Q360؟"
          subtitle="لأننا لا نريد أن يكون التدريب مجرد معلومة تتعلمها ثم تنساها."
        />
        <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="font-display text-xl font-bold text-primary-deep md:text-2xl">
            نريد أن يتحول القرآن إلى:
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {chain.map((c, i) => (
              <span key={c} className="flex items-center gap-2">
                <span className="rounded-2xl border border-border bg-secondary/60 px-4 py-2 text-sm font-medium text-primary-deep">
                  {c}
                </span>
                {i < chain.length - 1 && <span className="text-gold">←</span>}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-secondary/50 px-6 py-5">
              <p className="text-sm leading-7 text-muted-foreground">
                ولهذا فإن Q360 لا يسألك فقط:
              </p>
              <p className="mt-2 font-display text-lg font-bold text-primary-deep">
                «هل أعجبتك الدورة؟»
              </p>
            </div>
            <div className="rounded-2xl bg-gold-soft px-6 py-5">
              <p className="text-sm leading-7 text-accent-foreground">بل يساعدك على الإجابة عن سؤال أهم:</p>
              <p className="mt-2 font-display text-lg font-bold text-accent-foreground">
                «هل غيّرت الدورة شيئاً في سلوكي؟»
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="ماذا ستحصل عليه؟"
          subtitle="عند إتمام مراحل القياس، تحصل على تقرير Q360 لقياس أثر الدورة."
        />
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-sm leading-7 text-muted-foreground">
            يوضح تقرير الأثر رحلة تطورك في المهارات المستهدفة، ويمكنك استخدامه كأداة شخصية لمعرفة نقاط
            القوة وفرص التطوير:
          </p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {reportItems.map((r) => (
              <li key={r} className="flex gap-2 rounded-2xl bg-secondary/40 px-4 py-3 text-sm leading-7">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                <span className="text-foreground/85">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl bg-hero px-6 py-14 text-center text-primary-foreground shadow-soft md:px-12">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          ابدأ الدورة اليوم، ولا تكتفِ بقياس ما تعلمته...
        </h2>
        <p className="mt-4 font-display text-xl font-bold text-gold md:text-2xl">قِس ما تغيّر فيك.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link to="/store">
              <Sparkles /> اشترك في الدورة وابدأ قياس أثرك
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/q360">تفاصيل أكثر عن Q360</Link>
          </Button>
        </div>
        {q360Price != null && (
          <p className="mt-5 text-sm text-primary-foreground/75">
            (خدمة Q360 المستقلة: {q360Price} ريال)
          </p>
        )}
      </section>

      {/* مؤشرات الأثر والقصص — أدلة داعمة */}
      <section className="mt-20 border-t border-border pt-16">
        <SectionTitle
          title="مؤشرات الأثر على أرض الواقع"
          subtitle="أرقام وقصص حقيقية من المتدربين تُظهر ما يتغير في السلوك، وليس فقط ما يُتعلَّم."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <div className="font-display text-3xl font-bold text-primary">{v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {stories.length > 0 && (
        <section className="mt-16">
          <SectionTitle
            title="نتائج Q360 ونسب التغير"
            subtitle="قصص حقيقية تُعرض من خلال مؤشرات قابلة للملاحظة والتتبع."
          />
          <div className="mt-8 space-y-4">
            {stories.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display font-bold text-primary-deep">{s.title}</h3>
                  <span className="text-sm font-bold text-primary">+{s.change_percent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${s.change_percent ?? 0}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{s.story}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
