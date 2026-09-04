import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle } from "@/components/site/PageHero";
import {
  methodologyFoundations,
  mentalConcept,
  practicalSteps,
  methodologyResults,
  methodologySourceUrl,
} from "@/lib/methodology-content";
import foundation1 from "@/assets/methodology/foundation-1.jpg";
import foundation2 from "@/assets/methodology/foundation-2.jpg";
import changeModel from "@/assets/methodology/change-model.png";
import mentalConceptImg from "@/assets/methodology/mental-concept.png";
import practicalStepsImg from "@/assets/methodology/practical-steps.png";
import resultsImg from "@/assets/methodology/results.png";

const foundationImages = [foundation1, foundation2];

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/methodology")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المنهجية التطبيقية للقرآن الكريم | القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "المنهجية التطبيقية: التصور الذهني الصحيح، الخطوات العملية، النتائج، التطبيق، وقياس الأثر.",
      },
      { property: "og:title", content: "المنهجية التطبيقية للقرآن الكريم" },
      { property: "og:description", content: "منهجية تنقل القرآن من المعرفة إلى السلوك المقاس." },
    ],
  }),
  component: Page,
});

const stages = [
  [
    "التصور الذهني الصحيح",
    "استخراج المفهوم والصورة الذهنية الصحيحة من الآية، باعتبارها المبدأ أو القانون الذي يقوم عليه الموضوع.",
  ],
  ["الخطوات العملية", "تحويل التصور الذهني إلى خطوات عملية واضحة قابلة للتدريب والممارسة."],
  ["النتائج", "تحديد النتائج العملية التي تظهر عند تطبيق الخطوات."],
  ["التطبيق", "ممارسة الخطوات في مواقف الحياة الواقعية."],
  ["قياس الأثر", "قياس مدى انتقال المعرفة إلى سلوك وتغير فعلي."],
];

function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="منهجية القرآن خطوة بخطوة"
        title="المنهجية التطبيقية للقرآن الكريم"
        description="منهجية تنقل القرآن الكريم من المعرفة والفهم إلى التدريب، ثم التطبيق، ثم السلوك، ثم قياس الأثر."
        actions={
          <Button asChild variant="secondary">
            <Link to="/bags">
              استكشف الحقائب <ArrowLeft />
            </Link>
          </Button>
        }
      />

      <section className="mt-14">
        <SectionTitle
          title="تعرّف على المنهجية في فيديو"
          subtitle="شرح مختصر لفكرة المنهجية التطبيقية وكيف تنتقل بالقرآن من الفهم إلى السلوك."
        />
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-border bg-card p-2 shadow-lg md:p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] bg-primary-deep">
            <iframe
              className="absolute inset-0 size-full"
              src="https://www.youtube-nocookie.com/embed/-feJn4g0Zfk?rel=0"
              title="المنهجية التطبيقية للقرآن الكريم"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>


      <section className="mt-16">
        <SectionTitle
          title="كيف تتحول الآية إلى أثر؟"
          subtitle="خمس محطات متتابعة تجعل التطبيق واضحًا وقابلًا للممارسة والقياس."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {stages.map(([t, d], i) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary font-display text-primary-foreground">
                {i + 1}
              </div>
              <h2 className="font-display text-base font-bold text-primary-deep">{t}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="على ماذا بُنيت المنهجية التطبيقية؟"
          subtitle="بُنيت المنهجية التطبيقية في الحقائب القرآنية على أمرين أساسيين."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {methodologyFoundations.map((f, i) => (
            <div
              key={f.title}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <img
                src={foundationImages[i]}
                alt={f.title}
                loading="lazy"
                className="w-full bg-white object-contain"
              />
              <div className="p-6">
                <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary-deep">
                  {f.order}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-primary-deep">{f.title}</h3>
                <p className="mt-2 text-sm leading-8 text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="نموذج التغيير"
          subtitle="النموذج الذي تقوم عليه المنهجية التطبيقية في الحقائب القرآنية."
        />
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-sm md:p-8">
          <img
            src={changeModel}
            alt="نموذج التغيير في المنهجية التطبيقية"
            loading="lazy"
            className="mx-auto w-full max-w-3xl object-contain"
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="التصور الذهني"
          subtitle="نموذج تطبيقي من حقيبة «فاستبقوا الخيرات»."
        />
        <div className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <img
            src={mentalConceptImg}
            alt="التصور الذهني الخاص بحقيبة فاستبقوا الخيرات"
            loading="lazy"
            className="mx-auto w-full max-w-2xl rounded-2xl bg-white object-contain"
          />
          <p className="leading-9 text-muted-foreground">{mentalConcept.definition}</p>
          <p className="leading-9 text-muted-foreground">{mentalConcept.example}</p>
          <div className="grid gap-6 pt-2 md:grid-cols-2">
            <ListBlock title="البعد التدريبي للتصور الذهني" items={mentalConcept.training} />
            <ListBlock title="ربط التصور الذهني بالإيمان والمعتقد" items={mentalConcept.faith} />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle
          title="الخطوات العملية"
          subtitle="الخطوات العملية لحقيبة «فاستبقوا الخيرات»."
        />
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-sm md:p-6">
          <img
            src={practicalStepsImg}
            alt="الخطوات العملية لحقيبة فاستبقوا الخيرات"
            loading="lazy"
            className="mx-auto w-full max-w-4xl object-contain"
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {practicalSteps.steps.map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-gold/20 font-display text-sm font-bold text-primary-deep">
                {i + 1}
              </div>
              <h3 className="font-display text-base font-bold text-primary-deep">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-8">
          <ListBlock title="البعد التدريبي للخطوات العملية" items={practicalSteps.training} />
          <ListBlock title="ربط الخطوات العملية بالامتثال والتصديق" items={practicalSteps.faith} />
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle title="النتائج" subtitle="النتائج المتوقعة عند تطبيق الخطوات العملية." />
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-sm md:p-6">
          <img
            src={resultsImg}
            alt="نتائج حقيبة فاستبقوا الخيرات"
            loading="lazy"
            className="mx-auto w-full max-w-2xl object-contain"
          />
        </div>
        <div className="mt-6 grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm md:grid-cols-3 md:p-8">
          <ListBlock title="النتائج" items={methodologyResults.results} />
          <ListBlock title="البعد التدريبي للنتائج" items={methodologyResults.training} />
          <ListBlock title="ربط النتائج بالجزاء والعاقبة" items={methodologyResults.faith} />
        </div>
      </section>

      <div className="mt-14 rounded-3xl bg-secondary/70 p-8">
        <h2 className="font-display text-2xl font-bold text-primary-deep">أساس كل ما نقدّمه</h2>
        <p className="mt-3 leading-8 text-muted-foreground">
          جميع الحقائب القرآنية والدورات الإلكترونية وبرامج المدارس وتأهيل الميسّرين مبنية على هذه
          المنهجية، ويُقاس أثرها من خلال نظام Q360.
        </p>
        <a
          href={methodologySourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          المصدر: صفحة المنهجية التطبيقية في الموقع الرسمي
        </a>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-display text-base font-bold text-primary-deep">{title}</h3>
      <ol className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
        {items.map((t, i) => (
          <li key={t} className="flex gap-2">
            <span className="font-display text-gold">{i + 1}.</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

