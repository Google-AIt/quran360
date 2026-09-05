import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2,
  ArrowLeft,
  Video,
  Users,
  Route as RouteIcon,
  ClipboardList,
  FlaskConical,
  Award,
  BarChart3,
  LineChart,
  Target,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/schools")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "برنامج المدارس | التربية القرآنية للمدارس" },
      {
        name: "description",
        content:
          "منهجية تطبيقية تحوّل التعلم القرآني من محتوى يُقدّم للطلاب إلى تجربة تُشاهد وتُناقش وتُطبّق ويُقاس أثرها داخل المدرسة.",
      },
      { property: "og:title", content: "برنامج المدارس — القرآن خطوة بخطوة" },
      {
        property: "og:description",
        content:
          "لا نشتري مجموعة دورات فقط، بل نحصل على نظام لتطبيق التربية القرآنية داخل المدرسة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

/* ============ محتوى البرنامج ============ */

const programGoal = {
  title: "الهدف من البرنامج",
  body: "أن تصبح التربية القرآنية جزءًا من الحياة اليومية للمدرسة، وليس نشاطًا منفصلًا أو دورة مؤقتة.",
  pillars: [
    { icon: Video, label: "دورات فيديو أونلاين" },
    { icon: Users, label: "ميسّرون مؤهلون" },
    { icon: ClipboardList, label: "أنشطة وتطبيقات" },
    { icon: RouteIcon, label: "متابعة" },
    { icon: BarChart3, label: "قياس" },
    { icon: LineChart, label: "تحسين مستمر" },
  ],
};

const stages = [
  {
    n: "01",
    title: "الاستعداد والتخطيط",
    body: "نبدأ بتحديد احتياج المدرسة وأهدافها في التربية القرآنية.",
    items: [
      "تحديد الفئة المستهدفة.",
      "تحديد الأهداف التعليمية والتربوية.",
      "اختيار الدورات المناسبة.",
      "تحديد الجدول الزمني للتطبيق.",
      "تحديد المعلمين والميسّرين.",
      "تحديد مؤشرات النجاح.",
    ],
    result: "خطة تطبيق قرآنية واضحة للمدرسة.",
  },
  {
    n: "02",
    title: "تأهيل الميسّرين والمعلمين",
    body: "لا نكتفي بإعطاء المدرسة روابط للدورات، بل نجهّز ميسّرين من داخل المدرسة يستطيعون قيادة تجربة التعلم ومتابعة الطلاب.",
    items: [
      "كيفية استخدام الدورات.",
      "إدارة جلسات النقاش.",
      "طرح الأسئلة.",
      "ربط المحتوى بحياة الطالب.",
      "إدارة الأنشطة.",
      "متابعة التطبيق.",
      "قياس التعلم والأثر.",
    ],
    result: "فريق داخلي قادر على تشغيل البرنامج واستدامته.",
  },
  {
    n: "03",
    title: "اختيار المسارات والدورات",
    body: "بدل تقديم محتوى عشوائي، يتم اختيار مسار تعليمي مناسب لكل فئة عمرية واحتياج. ويحصل الطالب على دورات فيديو، محتوى منظم، أنشطة وأسئلة، اختبارات، متابعة للتقدم، وشهادة عند استيفاء متطلبات الدورة. وهنا تختلف المنهجية عن النموذج التقليدي؛ فالمادة التعليمية الأساسية لدينا هي الدورات الرقمية المصورة، بينما يكون دور المدرسة والميسّر هو تحويل المشاهدة إلى تعلم وتطبيق.",
    items: [],
    result: "مسار تعليمي مصمّم لكل فئة عمرية.",
  },
  {
    n: "04",
    title: "تقديم الدورات والتعلم",
    body: "يشاهد الطالب الدروس وفق الخطة المحددة من المدرسة. ثم لا تنتهي العملية عند انتهاء الفيديو، بل ينتقل الطالب في رحلة: شاهد ← فهم ← ناقش ← طبّق ← قيّم. ويقوم الميسّر بدور حلقة الوصل بين المحتوى الرقمي وحياة الطالب.",
    items: [],
    result: "تعلم فعّال يتجاوز المشاهدة إلى التطبيق.",
  },
  {
    n: "05",
    title: "التطبيق والممارسة",
    body: "هنا تتحول التربية القرآنية من معرفة إلى سلوك. يُطلب من الطالب تطبيق ما تعلمه من خلال مواقف حياتية وأنشطة فردية وجماعية وتحديات تطبيقية وتأملات وأسئلة ومواقف داخل المدرسة والأسرة ومشاريع أو مهام مرتبطة بالموضوع.",
    items: [],
    result:
      'الهدف ليس أن يقول الطالب: "أنهيت الدورة"، بل أن يستطيع أن يقول: "تعلمت شيئًا من القرآن وبدأت أطبقه في حياتي."',
  },
  {
    n: "06",
    title: "التقييم والشهادة",
    body: "يتم تقييم رحلة الطالب من خلال مجموعة من المؤشرات: إكمال الدروس، التفاعل مع المحتوى، اجتياز الاختبارات، تنفيذ التطبيقات، المشاركة في الأنشطة، وتحقيق مخرجات التعلم. وبعد استيفاء متطلبات الدورة يحصل الطالب على شهادة إتمام إلكترونية يمكن إصدارها تلقائيًا من المنصة. أما الميسّر فيمكن أن يحصل على شهادة ميسّر الحقائب القرآنية بعد إكمال برنامج التأهيل واجتياز متطلبات الاعتماد.",
    items: [],
    result: "تقييم منظم وشهادات موثّقة للطلاب والميسّرين.",
  },
  {
    n: "07",
    title: "قياس الأثر والتحسين المستمر",
    body: "لا نتوقف عند عدد الطلاب الذين شاهدوا الدورات، بل نسأل: ماذا تعلموا؟ ماذا طبقوا؟ ما الذي تغير؟ ما الذي يحتاج إلى تحسين؟ وتتم متابعة مؤشرات البرنامج لمساعدة المدرسة على تطوير تجربتها عامًا بعد عام.",
    items: [],
    result: "تحسين مستمر مبني على بيانات وأثر حقيقي.",
  },
];

const journeyModel = [
  { who: "المدرسة", what: "تخطط" },
  { who: "الميسّر", what: "يُهيّئ ويقود" },
  { who: "الطالب", what: "يشاهد ويتعلم" },
  { who: "الميسّر", what: "يناقش ويوجّه" },
  { who: "الطالب", what: "يطبّق" },
  { who: "المنصة", what: "تقيس" },
  { who: "المدرسة", what: "تراجع وتحسّن" },
  { who: "الأثر", what: "تربية قرآنية أكثر استدامة" },
];

const onlineBenefits = [
  { icon: RouteIcon, title: "المرونة", desc: "يمكن للطالب التعلم في الوقت والمكان المناسبين." },
  { icon: LineChart, title: "الاستمرارية", desc: "المحتوى متاح للطلاب وفق خطة المدرسة." },
  { icon: BarChart3, title: "التوسع", desc: "يمكن تطبيق البرنامج على أعداد أكبر من الطلاب." },
  {
    icon: CheckCircle2,
    title: "توحيد التجربة",
    desc: "جميع الطلاب يحصلون على المحتوى الأساسي نفسه.",
  },
  {
    icon: ClipboardList,
    title: "سهولة المتابعة",
    desc: "يمكن للمدرسة متابعة التقدم والاختبارات والإنجاز.",
  },
  {
    icon: Users,
    title: "تقليل الاعتماد على المدرب الخارجي",
    desc: "الميسّر الداخلي يقود التطبيق، بينما توفر المنصة المحتوى.",
  },
];

const facilitatorRoles = [
  { icon: Video, label: "توجيه الطالب للمحتوى" },
  { icon: Users, label: "إدارة النقاش" },
  { icon: Target, label: "طرح الأسئلة" },
  { icon: ClipboardList, label: "إدارة الأنشطة" },
  { icon: RouteIcon, label: "ربط القرآن بالحياة" },
  { icon: ClipboardList, label: "متابعة التطبيق" },
  { icon: BarChart3, label: "متابعة النتائج" },
  { icon: LineChart, label: "تشجيع السلوك الإيجابي" },
];

const studentJourney = ["المشاهدة", "الفهم", "التأمل", "التطبيق", "الممارسة", "الأثر"];

const schoolOutputs = [
  { icon: Video, title: "المحتوى", desc: "دورات قرآنية مصورة أونلاين." },
  { icon: Users, title: "الميسّرون", desc: "تأهيل أعضاء من المدرسة لتيسير البرامج." },
  { icon: RouteIcon, title: "المسارات", desc: "اختيار وتنظيم الدورات حسب الفئة والهدف." },
  { icon: ClipboardList, title: "الأنشطة", desc: "تطبيقات تساعد على تحويل التعلم إلى ممارسة." },
  { icon: FlaskConical, title: "التقييم", desc: "اختبارات وقياس للتعلم." },
  { icon: Award, title: "الشهادات", desc: "شهادات إلكترونية وفق متطلبات البرنامج." },
  { icon: BarChart3, title: "لوحة متابعة", desc: "متابعة تقدم الطلاب والإنجاز." },
  { icon: LineChart, title: "قياس الأثر", desc: "مؤشرات تساعد المدرسة على معرفة النتائج والتحسين." },
];

const successModel = [
  { stage: "المشاهدة", question: "هل شاهد الطالب المحتوى؟" },
  { stage: "التعلم", question: "هل فهم المفاهيم؟" },
  { stage: "التقييم", question: "هل اجتاز الاختبار؟" },
  { stage: "التطبيق", question: "هل نفّذ النشاط؟" },
  { stage: "الممارسة", question: "هل بدأ يوظف ما تعلمه؟" },
  { stage: "الأثر", question: "ما الذي تغير؟" },
];

const closingPhases = [
  "دورات رقمية تصل إلى الطالب.",
  "ميسّر يقود التجربة.",
  "مدرسة توفر البيئة.",
  "طالب يطبّق ما تعلم.",
  "منصة تقيس التقدم.",
  "ومنهجية تتطور باستمرار.",
];

function Page() {
  const { data } = useSuspenseQuery(q);
  const minTeachers = Number(data["school_min_teachers"] ?? 20);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      {/* ===== Hero ===== */}
      <PageHero
        eyebrow="برنامج المدارس"
        title="من دورة قرآنية إلى منهجية تطبيقية داخل المدرسة"
        description="نساعد المدرسة على تحويل التعلم القرآني من محتوى يُقدّم للطلاب إلى تجربة تعليمية مستمرة تُشاهد، وتُناقش، وتُطبّق، ويُقاس أثرها."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HeroStat value="7" label="مراحل للتطبيق" />
          <HeroStat value={String(minTeachers)} label="معلمًا كحد أدنى" />
          <HeroStat value="Q360" label="قياس أثر للمدرسة" />
        </div>
      </PageHero>

      {/* ===== Intro ===== */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-base leading-9 text-muted-foreground md:text-lg">
          برنامج <span className="font-bold text-primary-deep">التربية القرآنية للمدارس</span> هو
          منهجية تطبيقية تمكّن المدرسة من استخدام{" "}
          <span className="font-bold text-primary-deep">الدورات القرآنية المصورة عبر الإنترنت</span>{" "}
          كأداة تعليمية منظمة، مع تأهيل المعلمين والميسّرين، ومتابعة تعلم الطلاب، وقياس الأثر. فالمدرسة
          لا تشتري مجموعة دورات فقط؛ بل تحصل على{" "}
          <span className="font-bold text-primary-deep">نظام لتطبيق التربية القرآنية داخل المدرسة</span>.
        </p>
      </section>

      {/* ===== الهدف من البرنامج ===== */}
      <section className="mt-16">
        <SectionTitle
          title={programGoal.title}
          subtitle="أن تصبح التربية القرآنية جزءًا من الحياة اليومية للمدرسة، وليس نشاطًا منفصلًا أو دورة مؤقتة."
          align="center"
        />
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-9 text-muted-foreground">
          ويتحقق ذلك من خلال منظومة تجمع بين عناصر متكاملة:
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {programGoal.pillars.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="font-display font-bold text-primary-deep">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== كيف نطبّق المنهجية — 7 مراحل ===== */}
      <section className="mt-20">
        <SectionTitle
          title="كيف نطبّق المنهجية في المدرسة؟"
          subtitle="سبع مراحل لتطبيق التربية القرآنية، من التخطيط إلى قياس الأثر والتحسين المستمر."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {stages.map((s) => (
            <article
              key={s.n}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl font-bold text-gold/80">{s.n}</span>
                <h3 className="font-display text-xl font-bold text-primary-deep">{s.title}</h3>
              </div>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">{s.body}</p>
              {s.items.length > 0 && (
                <ul className="mt-5 grid gap-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 rounded-2xl bg-primary/5 px-4 py-3">
                <p className="text-xs font-bold text-primary-deep">
                  النتيجة: <span className="font-normal text-muted-foreground">{s.result}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== نموذج الرحلة ===== */}
      <section className="mt-20">
        <SectionTitle
          title="نموذج الرحلة"
          subtitle="دورة متكاملة تربط المدرسة والميسّر والطالب والمنصة والأثر."
          align="center"
        />
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {journeyModel.map((j, i) => (
            <div
              key={j.who}
              className="rounded-2xl border border-border bg-card px-5 py-5 text-center shadow-sm"
            >
              <span className="font-display text-sm font-bold text-primary-deep">{j.who}</span>
              <p className="mt-1 text-sm text-muted-foreground">{j.what}</p>
              {i < journeyModel.length - 1 && (
                <span className="mt-3 block text-gold" aria-hidden>
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== لماذا الدورات المصورة أونلاين؟ ===== */}
      <section className="mt-20">
        <SectionTitle
          title="لماذا الدورات المصورة أونلاين؟"
          subtitle="بدل أن تعتمد المدرسة على حضور مدرب جديد لكل برنامج، توفر المنصة محتوى تعليميًا رقميًا جاهزًا يمكن للطلاب الوصول إليه وفق الجدول المدرسي."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {onlineBenefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary-deep">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== دور الميسّر / دور الطالب ===== */}
      <section className="mt-20 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Users className="size-6" />
            </span>
            <h2 className="font-display text-xl font-bold text-primary-deep">دور الميسّر</h2>
          </div>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            الميسّر ليس مدرّس الفيديو. دوره أن يجعل الفيديو{" "}
            <span className="font-bold text-primary-deep">بداية للتعلم وليس نهايته</span>.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {facilitatorRoles.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 shrink-0 text-primary" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <GraduationCap className="size-6" />
            </span>
            <h2 className="font-display text-xl font-bold text-primary-deep">دور الطالب</h2>
          </div>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            الطالب هو محور التجربة. ولا يقاس نجاحه بمجرد حضور الدورة، بل بقدرته على الانتقال من المشاهدة
            إلى الأثر.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {studentJourney.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-primary-deep">
                  {step}
                </span>
                {i < studentJourney.length - 1 && (
                  <span className="text-gold" aria-hidden>
                    ↓
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ماذا تحصل عليه المدرسة ===== */}
      <section className="mt-20">
        <SectionTitle
          title="ماذا تحصل عليه المدرسة؟"
          subtitle="عند تطبيق البرنامج تحصل المدرسة على منظومة متكاملة تشمل ثمانية عناصر."
          align="center"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {schoolOutputs.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-primary-deep">{title}</h3>
              <p className="mt-2 text-xs leading-7 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ما الذي يميز المنهجية ===== */}
      <section className="mt-20 rounded-3xl bg-hero p-8 text-primary-foreground shadow-soft md:p-12">
        <h2 className="font-display text-2xl font-bold md:text-3xl">
          ما الذي يميز منهجية التربية القرآنية؟
        </h2>
        <p className="mt-3 text-sm leading-8 text-primary-foreground/80">
          ليست مكتبة دورات، وليست مجرد منصة فيديو، وليست حصة إضافية.
        </p>
        <p className="mt-6 font-display text-xl font-bold text-gold">
          إنها «منهجية تطبيق» تجمع بين:
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            "المحتوى القرآني",
            "التعلم الرقمي",
            "الميسّر",
            "التطبيق",
            "التقييم",
            "القياس",
            "التحسين",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-5 py-2 text-sm font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ===== نموذج النجاح ===== */}
      <section className="mt-20">
        <SectionTitle
          title="نموذج النجاح في المدرسة"
          subtitle="يمكن للمدرسة أن تتابع رحلة كل طالب عبر ست مؤشرات واضحة."
          align="center"
        />
        <div className="mt-10 overflow-hidden rounded-3xl border border-border shadow-sm">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="px-6 py-4 font-display text-sm font-bold">المرحلة</th>
                <th className="px-6 py-4 font-display text-sm font-bold">السؤال</th>
              </tr>
            </thead>
            <tbody>
              {successModel.map((row, i) => (
                <tr
                  key={row.stage}
                  className={i % 2 === 0 ? "bg-card" : "bg-background"}
                >
                  <td className="px-6 py-4 font-display font-bold text-primary-deep">{row.stage}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== النتيجة التي نطمح إليها ===== */}
      <section className="mt-20">
        <SectionTitle
          title="النتيجة التي نطمح إليها"
          subtitle="نريد أن ننتقل بالمدرسة من امتلاك الدورات إلى امتلاك منهجية مطبقة."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground line-through opacity-70">
              «لدينا دورات قرآنية»
            </p>
            <p className="mt-3 font-display text-lg font-bold text-primary-deep">
              ← «لدينا منهجية قرآنية مطبقة داخل المدرسة.»
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground line-through opacity-70">
              «الطلاب شاهدوا الدورات»
            </p>
            <p className="mt-3 font-display text-lg font-bold text-primary-deep">
              ← «الطلاب تعلموا وطبقوا وقسنا أثر تعلمهم.»
            </p>
          </div>
        </div>
      </section>

      {/* ===== ختام ===== */}
      <section className="mt-20 text-center">
        <h2 className="font-display text-2xl font-bold text-primary-deep md:text-3xl">
          التربية القرآنية... عندما تتحول إلى ممارسة
        </h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {closingPhases.map((p) => (
            <p key={p} className="rounded-2xl border border-border bg-card px-5 py-3 text-sm text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
        <p className="mt-8 font-display text-lg font-bold text-gold">
          هذه هي التربية القرآنية التطبيقية للمدارس.
        </p>
        <p className="mt-3 font-display text-base font-bold text-primary-deep">
          شاهد ← تعلّم ← ناقش ← طبّق ← قِس ← طوّر
        </p>
      </section>

      {/* ===== CTAs ===== */}
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/schools/dashboard">
            <Building2 /> لوحة تحكم المدرسة
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">
            اطلب تسجيل مدرستك <ArrowLeft />
          </Link>
        </Button>
      </div>
    </div>
  );
}
