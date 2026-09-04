import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BadgeCheck, GraduationCap, ShieldCheck, Building2, Users, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/facilitators/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "تأهيل واعتماد ميسّر الحقائب القرآنية | القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "برنامج تأهيل واعتماد ميسّر الحقائب القرآنية: أساسيات التيسير، إدارة الحوار والأنشطة، التيسير الحضوري والافتراضي، وقياس التعلم والأثر مع شهادة معتمدة قابلة للتحقق.",
      },
      { property: "og:title", content: "تأهيل واعتماد ميسّر الحقائب القرآنية" },
      {
        property: "og:description",
        content: "لا تكتفِ بتقديم الحقيبة… تعلّم كيف تيسّر تجربة تغيّر المتعلم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const facilitatorRole = [
  "يهيئ البيئة التعليمية المناسبة",
  "يقود الحوار والنقاش",
  "يحفّز المتعلمين على المشاركة",
  "يربط محتوى الحقيبة بحياة المتعلم",
  "يستخدم الأنشطة والأسئلة بطريقة فعالة",
  "ينقل المتعلم من المعرفة إلى التطبيق",
  "يقيس مدى تحقق أهداف الحقيبة",
  "يحافظ على جودة تجربة التعلم",
];

const whyBecome = [
  {
    icon: Building2,
    title: "قدّم الحقائب في مدرستك",
    body: "بدل الاعتماد على مدرب خارجي لكل برنامج، تُعِدّ المدرسة ميسّرين من داخل منظومتها لتقديم الحقائب وفق منهجية موحدة.",
  },
  {
    icon: GraduationCap,
    title: "طوّر مهاراتك المهنية",
    body: "التيسير، إدارة الحوار، طرح الأسئلة، إدارة الأنشطة، التعامل مع اختلاف المستويات، إدارة الوقت، والتقييم.",
  },
  {
    icon: Sparkles,
    title: "استخدم الحقيبة باحتراف",
    body: "لا تحصل على المحتوى فقط، بل تتعلم كيف تستخدم الحقيبة وتقود تجربتها التعليمية كاملة.",
  },
  {
    icon: Users,
    title: "ساهم في نشر التعلم القرآني",
    body: "تصبح حلقة وصل بين الحقيبة القرآنية والمتعلم، وتوسّع نطاق الاستفادة داخل المدرسة والمجتمع.",
  },
  {
    icon: BadgeCheck,
    title: "ابنِ هويتك المهنية",
    body: "شهادة تُضاف إلى ملفك المهني وسيرتك الذاتية، ويمكن إبرازها للجهات التعليمية والتدريبية.",
  },
  {
    icon: ShieldCheck,
    title: "كن جزءًا من شبكة الميسّرين",
    body: "مجتمع لتبادل الخبرات والممارسات الناجحة ودعم الميسّرين في تقديم البرامج.",
  },
];

const curriculum = [
  {
    n: "01",
    title: "أساسيات التيسير",
    body: "فهم دور الميسّر والفرق بين المحاضر ← المدرب ← الميسّر، والانتقال من تقديم المعلومات إلى إدارة تجربة تعلم تفاعلية.",
  },
  {
    n: "02",
    title: "قراءة الحقيبة القرآنية",
    body: "أهداف الحقيبة، مخرجات التعلم، تسلسل الأنشطة، الرسائل الأساسية، أدوات التقييم، والأنشطة التطبيقية.",
  },
  {
    n: "03",
    title: "مهارات التقديم",
    body: "كيف تبدأ الجلسة وتقدّم المحتوى وتستخدم القصص والأسئلة والأمثلة والأنشطة بطريقة تجذب المتعلم.",
  },
  {
    n: "04",
    title: "إدارة الحوار",
    body: "طرح السؤال الصحيح، إدارة النقاش، التعامل مع الإجابات المختلفة، والحفاظ على مشاركة الجميع.",
  },
  {
    n: "05",
    title: "إدارة الأنشطة",
    body: "تحويل الحقيبة من شرائح ومعلومات إلى تجربة تعليمية تفاعلية.",
  },
  {
    n: "06",
    title: "التعامل مع المتعلمين",
    body: "الفروق الفردية، المشاركون المترددون، كثيرو التفاعل، والمواقف غير المتوقعة.",
  },
  {
    n: "07",
    title: "التيسير الحضوري والافتراضي",
    body: "أساسيات تقديم الحقيبة حضوريًا وعن بُعد (Face-to-Face + Online).",
  },
  {
    n: "08",
    title: "قياس التعلم والأثر",
    body: "التأكد من أن المتعلم لم يكتفِ بالحضور، بل فهم واستفاد وبدأ في التطبيق.",
  },
];

const journey = [
  { title: "التسجيل", body: "الانضمام إلى برنامج تأهيل الميسّر." },
  { title: "التعلم والتأهيل", body: "دراسة محتوى برنامج تأهيل الميسّر." },
  { title: "التطبيق", body: "تطبيق مهارات التيسير على نماذج من الحقائب القرآنية." },
  { title: "التقييم", body: "اختبار المعرفة والمهارات المطلوبة." },
  { title: "النجاح", body: "استيفاء متطلبات الاعتماد." },
  { title: "الشهادة", body: "شهادة ميسّر الحقائب القرآنية — Certified Quranic Program Facilitator." },
];

const schoolsBenefits = [
  "بناء قدرات المعلمين",
  "زيادة عدد البرامج التي يمكن تنفيذها",
  "توحيد منهجية تقديم الحقائب",
  "تقليل الاعتماد على المدربين الخارجيين",
  "إنشاء خبرات داخلية قابلة للاستمرار",
  "قياس مشاركة الطلاب والاستفادة من البرامج",
  "بناء مجتمع تعلم قرآني داخل المدرسة",
];

const audience = [
  { title: "المعلمون", body: "الراغبون في تقديم برامج وحقائب قرآنية بطريقة تفاعلية." },
  { title: "قادة المدارس والمشرفون", body: "الراغبون في بناء قدرات داخلية في المدرسة." },
  { title: "المربون والعاملون في التعليم", body: "الراغبون في تطوير مهارات التيسير." },
  { title: "مدربو البرامج القرآنية", body: "الراغبون في تطوير منهجية تقديمهم." },
  { title: "المتطوعون في المبادرات القرآنية", body: "الراغبون في المساهمة في نشر البرامج." },
];

const network = [
  "تبادل الخبرات",
  "أفضل ممارسات التيسير",
  "الموارد والأدوات",
  "اللقاءات التطويرية",
  "فرص التطبيق",
  "التطوير المهني المستمر",
];

const levels = ["مشارك", "ميسّر متأهل", "ميسّر معتمد", "ميسّر متمكن", "ميسّر خبير"];

const membershipBenefits = [
  "الوصول إلى المنصة",
  "المواد التعليمية",
  "أدلة الميسّر",
  "الأدوات التدريبية",
  "المحتوى",
  "التحديثات",
];

function Page() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="تأهيل • تطبيق • تقييم • اعتماد • أثر"
        title="تأهيل واعتماد ميسّر الحقائب القرآنية"
        description="كن الميسّر الذي يحوّل الحقيبة القرآنية من محتوى يُقدَّم إلى تجربة تعليمية تُعاش وتُطبَّق. برنامج مصمم للمعلمين والمشرفين وقادة المدارس والعاملين في التعليم والتدريب."
        actions={
          <>
            <Button asChild>
              <Link to="/facilitators/apply">
                <BadgeCheck /> ابدأ برنامج الاعتماد
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/store">اشترك في عضوية الميسّر</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/schools">للمدارس والمؤسسات</Link>
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="8" label="محاور تأهيل" />
          <HeroStat value="12" label="حقيبة قرآنية للتطبيق" />
          <HeroStat value="QR" label="شهادة قابلة للتحقق" />
        </div>
      </PageHero>

      <p className="mt-8 rounded-3xl border border-gold/40 bg-gold-soft px-6 py-6 text-center font-display text-lg leading-9 text-accent-foreground md:text-xl">
        لا تكتفِ بتقديم الحقيبة… تعلّم كيف تيسّر تجربة تغيّر المتعلم.
      </p>

      <section className="mt-16">
        <SectionTitle
          title="ما هو ميسّر الحقائب القرآنية؟"
          subtitle="الميسّر ليس مجرد شخص يشرح المحتوى، بل هو من يجعل المتعلم شريكًا في رحلة التعلم لا مجرد مستمع."
        />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {facilitatorRole.map((x) => (
            <li
              key={x}
              className="flex gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-muted-foreground"
            >
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold" />
              {x}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionTitle title="لماذا تصبح ميسّرًا معتمدًا؟" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {whyBecome.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gold-soft text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display font-bold text-primary-deep">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle title="ماذا ستتعلم؟" subtitle="ثمانية محاور متدرّجة تبني مهارة التيسير من الأساس حتى قياس الأثر." />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {curriculum.map((m) => (
            <article
              key={m.n}
              className="flex gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="font-display text-2xl font-bold text-gold">{m.n}</span>
              <div>
                <h3 className="font-display font-bold text-primary-deep">{m.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{m.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle title="رحلة الحصول على الاعتماد" />
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {journey.map((s, i) => (
            <li key={s.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display font-bold text-primary-deep">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-3xl bg-gold-soft p-8">
        <h2 className="font-display text-xl font-bold text-accent-foreground">ماذا تعني شهادة الميسّر؟</h2>
        <p className="mt-3 leading-8 text-accent-foreground/85">
          الشهادة تعني أنك أتممت برنامج التأهيل، ودرست منهجية تيسير الحقائب القرآنية، واجتزت متطلبات
          التقييم المعتمدة للبرنامج. وتُصدر إلكترونيًا برقم فريد ورمز تحقق QR، ويمكن التحقق منها عبر المنصة.
        </p>
        <p className="mt-3 rounded-2xl border border-gold/40 bg-background/60 p-4 text-sm leading-7 text-muted-foreground">
          مهم: الشهادة تثبت اجتياز برنامج التأهيل وفق متطلباته، ولا تعني تلقائيًا ترخيصًا حكوميًا لممارسة
          التدريب أو التدريس إذا كان ذلك يتطلب ترخيصًا مستقلًا.
        </p>
        <Link to="/verify" className="mt-4 inline-block text-sm text-primary underline">
          التحقق من شهادة
        </Link>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            للمدارس — بيئة تعلم قرآني مستدامة
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            بدل الاعتماد على شخص واحد لتقديم البرامج، تبني المدرسة فريقًا من الميسّرين الداخليين القادرين
            على تشغيل الحقائب القرآنية داخل المدرسة.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
            {schoolsBenefits.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="text-gold">•</span>
                {x}
              </li>
            ))}
          </ul>
          <Link
            to="/schools"
            className="mt-5 inline-block rounded-xl border border-primary px-5 py-2.5 text-sm font-medium text-primary"
          >
            برامج المدارس
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            عضوية الميسّر — {data["price_facilitator_membership"]} ريال سنويًا
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
            {membershipBenefits.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="text-gold">•</span>
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/store"
              className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              اشترك الآن
            </Link>
            <Link
              to="/facilitators/apply"
              className="inline-block rounded-xl border border-primary px-5 py-2.5 text-sm font-medium text-primary"
            >
              ابدأ مسار التأهيل
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle title="لمن يناسب الاعتماد؟" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {audience.map((a) => (
            <article key={a.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display font-bold text-primary-deep">{a.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-hero px-6 py-10 text-primary-foreground md:px-10">
        <h2 className="font-display text-2xl font-bold">من «متلقي الحقيبة» إلى «ميسّر الحقيبة»</h2>
        <p className="mt-3 max-w-2xl leading-8 text-primary-foreground/85">
          هناك فرق كبير بين أن تحصل على حقيبة قرآنية، وبين أن تكون قادرًا على تيسيرها باحتراف. المحتوى
          موجود، والمنهجية موجودة، والآن أنت تتعلم كيف تقود التجربة.
        </p>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep">شبكة ميسّري الحقائب القرآنية</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
            {network.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="text-gold">•</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep">اعتمادك بداية… وليس نهاية</h2>
          <ol className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground">
            {levels.map((l, i) => (
              <li key={l} className="flex items-center gap-3">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-gold-soft text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                {l}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-bold text-primary-deep">ابدأ رحلة الاعتماد</h2>
        <p className="mt-3 leading-8 text-muted-foreground">
          هل أنت مستعد لتكون ميسّرًا للحقائب القرآنية في مدرستك؟ سجّل الآن في برنامج تأهيل واعتماد ميسّر
          الحقائب القرآنية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/facilitators/apply">ابدأ برنامج الاعتماد</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/methodology">تعرّف على متطلبات الاعتماد</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/schools">للمدارس والمؤسسات</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">تأهيل • تطبيق • تقييم • اعتماد • أثر</p>
      </section>
    </div>
  );
}
