import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Eye,
  Link2,
  LockKeyhole,
  MessagesSquare,
  Repeat2,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/q360/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "Q360 — قياس أثر التدريب في السلوك" },
      {
        name: "description",
        content:
          "Q360 خدمة داخل كل دورة تقيس أثر التدريب على السلوك: قياس قبلي، تدريب وتطبيق، قياس بعدي، مقارنة النتائج وتقرير أثر واضح مع تقييم من حولك.",
      },
      { property: "og:title", content: "Q360 — قياس أثر التدريب" },
      {
        property: "og:description",
        content: "لا نسألك: هل تعلمت؟ بل: هل ظهر أثر ما تعلمته في سلوكك كما يراه من حولك؟",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const steps = [
  {
    t: "1. قياس قبلي",
    d: "قبل بدء الدورة تقيّم مستوى ممارستك للمهارات المستهدفة، ويقيّمك من حولك بنفس الأسئلة.",
  },
  { t: "2. التدريب", d: "تشاهد الدروس وتتفاعل مع الأنشطة والاختبارات داخل الدورة." },
  { t: "3. التطبيق", d: "تمارس المهارات في حياتك اليومية خلال فترة الدورة." },
  { t: "4. قياس بعدي", d: "تعيد التقييم الذاتي، ويعيد المقيّمون أنفسهم التقييم قدر الإمكان." },
  { t: "5. مقارنة النتائج", d: "نقارن الدرجات قبل وبعد لكل مهارة ونحسب نسبة التحسن." },
  { t: "6. تقرير الأثر", d: "تقرير واضح بأكثر المهارات تطوراً وما يحتاج مزيداً من التطوير." },
];

const raters = [
  "أنا / التقييم الذاتي",
  "الأب",
  "الأم",
  "المعلم",
  "المدير المباشر",
  "الزميل",
  "المرؤوس",
  "الصديق",
  "الأخ / الأخت",
  "عضو فريق",
  "قائد / مشرف",
  "شريك",
  "مستفيد / عميل",
  "آخر",
];

const scale = [
  "1 = أبداً",
  "2 = نادراً",
  "3 = أحياناً",
  "4 = غالباً",
  "5 = دائماً",
  "لا أعرف / لا ينطبق (لا تدخل في الحساب)",
];

const raterFlow = [
  {
    icon: UsersRound,
    t: "اختيار المقيّمين",
    d: "بعد شراء الدورة تختار الفئات المناسبة لك: الأسرة، الزملاء، المدير، المعلم، الفريق… لا شيء إلزامي.",
  },
  {
    icon: Link2,
    t: "إرسال دعوة آمنة",
    d: "ينشئ النظام رابطاً فريداً لكل مقيّم يمكن إرساله عبر واتساب أو البريد أو أي وسيلة مشاركة، مع تاريخ انتهاء للدعوة.",
  },
  {
    icon: LockKeyhole,
    t: "تقييم بدون حساب",
    d: "يفتح المقيّم الرابط ويجيب مباشرة دون إنشاء حساب، ويرى اسم المتدرب واسم الدورة ونوع العلاقة فقط.",
  },
  {
    icon: ClipboardList,
    t: "تسجيل التقييم القبلي",
    d: "تُحفظ إجاباته تحت مرحلة «قبل التدريب» مرتبطة بالدورة والمهارة والعلاقة وتاريخ التقييم.",
  },
  {
    icon: Repeat2,
    t: "إعادة الدعوة بعد التدريب",
    d: "بعد إكمال الدورة تُرسل دعوة جديدة لنفس المقيّمين لضمان دقة المقارنة، ويمكن إضافة مقيّم جديد ويظهر ذلك في التقرير.",
  },
  {
    icon: BarChart3,
    t: "المقارنة والتقرير",
    d: "نحسب متوسط كل مهارة قبل وبعد، ونسبة التحسن، وفجوة الإدراك بين تقييمك لنفسك وتقييم الآخرين.",
  },
];

const example = [
  ["المبادرة والدخول في السباق", "2.8", "4.1"],
  ["استثمار الوقت", "2.6", "3.8"],
  ["التغلب على التحديات", "3.0", "4.0"],
  ["معرفة واستثمار نقاط القوة", "2.9", "4.2"],
  ["القدوة وصناعة التحول", "2.5", "3.9"],
];

const outcomes = [
  "مستوى أدائك قبل التدريب وبعده",
  "أكثر المهارات تطوراً",
  "الجوانب التي تحتاج إلى مزيد من التطوير",
  "الفرق بين تقييمك لنفسك وتقييم الآخرين",
  "التغيرات التي لاحظها من حولك",
];

const privacy = [
  "تقييمات الآخرين تُعرض مجمّعة، ولا تُنسب إجابة لشخص بعينه.",
  "لا تظهر نتيجة فئة مستقلة إذا قلّ عدد المقيّمين فيها عن ثلاثة.",
  "موافقة واضحة قبل إرسال أي دعوة، ورابط فريد لكل مقيّم مع تاريخ انتهاء.",
  "النتائج تقيس السلوكيات المستهدفة في الدورة، لا شخصية المتدرب ولا حالته النفسية.",
];

function Page() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="تعلّم → طبّق → قِس الأثر"
        title="Q360 — قياس أثر التدريب"
        description="لا نكتفي بأن تسأل نفسك: هل استفدت من الدورة؟ بل نساعدك على معرفة: هل ظهر أثر ما تعلمته في سلوكك كما يراه من حولك؟ Q360 خدمة داخل كل دورة، مرتبطة بمهاراتها وحدها، تقيس ممارستك للسلوكيات المستهدفة قبل التدريب وبعده."
        actions={
          <Button asChild variant="secondary">
            <Link to="/q360/course/$slug" params={{ slug: "course-fastabiqu-alkhayrat" }}>
              ابدأ قياس أثر التدريب <ArrowLeft />
            </Link>
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="360°" label="رؤية متكاملة للسلوك" />
          <HeroStat value="5" label="محاور مهارية لكل دورة" />
          <HeroStat value="3" label="مراحل قياس: قبلي وبعدي ومتابعة" />
        </div>
      </PageHero>

      <section className="mt-16">
        <SectionTitle
          title="كيف يعمل Q360؟"
          subtitle="رحلة واضحة تبدأ قبل أول درس وتنتهي بتقرير أثر خاص بك في هذه الدورة."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.t} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold text-primary-deep">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="كيف يدخل المقيّمون؟ وكيف يُرصد تقييمهم قبل التدريب وبعده؟"
          subtitle="من اختيار المقيّم إلى المقارنة النهائية، خطوة بخطوة داخل المنصة."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {raterFlow.map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-4 rounded-3xl border border-border bg-card p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display font-bold text-primary-deep">{t}</h3>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            <UsersRound className="ml-2 inline size-5 text-gold" />
            من يمكنه تقييمك؟
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {raters.map((r) => (
              <li key={r} className="rounded-full border border-border px-3 py-1">
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">مقياس الإجابة</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {scale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            <MessagesSquare className="ml-2 inline size-5 text-gold" />
            أسئلة نوعية اختيارية
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            <li>قبل التدريب: ما أكثر سلوك ترى أنه يحتاج إلى تطوير؟</li>
            <li>بعد التدريب: ما أكثر تغير إيجابي لاحظته؟</li>
            <li>وما السلوك الذي ما زال يحتاج إلى تطوير؟</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="نموذج نتائج — دورة «فاستبقوا الخيرات»"
          subtitle="خمسة محاور، 15 سؤالاً سلوكياً، ومقارنة واضحة بين ما قبل التدريب وما بعده."
        />
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/70 text-primary-deep">
              <tr>
                <th className="p-4 font-display">المهارة</th>
                <th className="p-4 font-display">قبل التدريب</th>
                <th className="p-4 font-display">بعد التدريب</th>
                <th className="p-4 font-display">التغيّر</th>
              </tr>
            </thead>
            <tbody>
              {example.map(([name, pre, post]) => (
                <tr key={name} className="border-t border-border">
                  <td className="p-4 text-primary-deep">{name}</td>
                  <td className="p-4 text-muted-foreground">{pre}</td>
                  <td className="p-4 text-muted-foreground">{post}</td>
                  <td className="p-4 font-medium text-gold">
                    +{(Number(post) - Number(pre)).toFixed(1)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border bg-secondary/40">
                <td className="p-4 font-display font-bold text-primary-deep">المتوسط العام</td>
                <td className="p-4 font-medium text-primary-deep">2.76 / 5</td>
                <td className="p-4 font-medium text-primary-deep">4.00 / 5</td>
                <td className="p-4 font-display font-bold text-gold">نسبة تحسن 45%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display font-bold text-primary-deep">
              <Eye className="ml-2 inline size-5 text-gold" />
              فجوة الإدراك
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              هي الفرق بين تقييمك لنفسك ومتوسط تقييم الآخرين لك. في المثال: قبل التدريب 0.6 (ذاتي
              3.5 مقابل 2.9)، وبعد التدريب 0.3 (ذاتي 4.3 مقابل 4.0) — أي أن رؤيتك لنفسك اقتربت مما
              يراه من حولك.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-display font-bold text-primary-deep">
              <Repeat2 className="ml-2 inline size-5 text-gold" />
              قياس المتابعة بعد 30 يوماً
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              مرحلة اختيارية بنفس الأسئلة السلوكية، هدفها معرفة هل استمر التغيير أم كان مؤقتاً.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-gold bg-gold-soft p-6">
          <h2 className="font-display text-lg font-bold text-accent-foreground">
            <Sparkles className="ml-2 inline size-5" />
            ماذا ستعرف من تقرير الأثر؟
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-accent-foreground">
            {outcomes.map((o) => (
              <li key={o} className="flex gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            <ShieldCheck className="ml-2 inline size-5 text-gold" />
            الخصوصية أولاً
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {privacy.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-gold">•</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-10 rounded-2xl border border-border bg-secondary/60 p-6 leading-8 text-primary-deep">
        Q360 مرتبط بكل دورة على حدة: لكل دورة محاورها وأسئلتها الخاصة، فدورة «فاستبقوا الخيرات» تقيس
        المبادرة والوقت والتحديات ونقاط القوة والقدوة، بينما ستقيس دورة «وجادلهم بالتي هي أحسن»
        مهارات الحوار وتقبّل الآخر. والقياس ليس شرطاً للحصول على شهادة إكمال الدورة.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/q360/course/$slug"
          params={{ slug: "course-fastabiqu-alkhayrat" }}
          className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground"
        >
          ابدأ قياس أثر التدريب
        </Link>
        <Link
          to="/store"
          className="rounded-xl border border-border px-8 py-3 font-medium text-primary-deep"
        >
          تصفّح الدورات ({data["price_q360"]} ريال لخدمة Q360 المستقلة)
        </Link>
      </div>
    </div>
  );
}
