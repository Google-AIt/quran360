import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Calculator, CheckCircle2 } from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/schools")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "برنامج المدارس | التربية القرآنية للمدارس" },
      { name: "description", content: "برنامج متكامل لبناء الثقافة والسلوك القرآني في البيئة المدرسية: تأهيل المعلمين، خمس حقائب، وقياس أثر Q360." },
      { property: "og:title", content: "برنامج المدارس — القرآن خطوة بخطوة" },
      { property: "og:description", content: "لا نقدم للمدرسة حقائب قرآنية فقط، بل نبني معها بيئة تربوية." },
    ],
  }),
  component: Page,
});

const benefits = [
  "استثمار حصص النشاط في التدريب القرآني.",
  "نشر السلوك القرآني في البيئة المدرسية.",
  "تبني المعلمين للتربية القرآنية.",
  "بناء لغة تربوية مشتركة داخل المدرسة.",
  "تحويل القيم القرآنية إلى ممارسات عملية.",
  "تعزيز دور المعلم في صناعة السلوك.",
  "رفع تفاعل الطلاب.",
  "نقل أثر التدريب من الفصل إلى المدرسة والأسرة.",
  "إشراك الأسرة في تعزيز السلوك القرآني.",
  "قياس الأثر والتغير السلوكي.",
  "اكتشاف نقاط القوة وفرص التحسين.",
  "بناء ثقافة مدرسية قائمة على القرآن.",
  "رفع جودة الأنشطة والبرامج الطلابية.",
  "بناء فريق داخلي من الميسّرين.",
  "استدامة التربية القرآنية.",
  "تعزيز هوية المدرسة ورسالتها التربوية.",
  "توفير نظام متكامل للتدريب والمتابعة.",
  "توثيق أثر المدرسة ونتائجها.",
];

const journey = ["التسجيل", "اختيار البرنامج", "تأهيل المعلمين", "تطبيق 5 حقائب", "تدريب الطلاب", "التطبيق العملي", "إشراك الأسرة", "Q360", "قياس الأثر", "تقرير المدرسة"];

function Page() {
  const { data } = useSuspenseQuery(q);
  const minTeachers = Number(data["school_min_teachers"] ?? 20);
  const teacherPrice = Number(data["price_school_teacher"] ?? 2400);
  const studentPrice = Number(data["price_school_student"] ?? 240);
  const [teachers, setTeachers] = useState(minTeachers);
  const [students, setStudents] = useState(1000);
  const total = teachers * teacherPrice + students * studentPrice;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero eyebrow="برنامج المدارس" title="ابنِ بيئة تربوية يمشي فيها القرآن" description="لا نقدم للمدرسة حقائب قرآنية فقط، بل نبني معها بيئة تربوية يتحول فيها القرآن من معرفة تُدرّس إلى سلوك يُمارس.">
        <div className="grid gap-3 sm:grid-cols-3"><HeroStat value="5" label="حقائب قرآنية سنويًا" /><HeroStat value={String(minTeachers)} label="معلمًا كحد أدنى" /><HeroStat value="Q360" label="تقرير أثر للمدرسة" /></div>
      </PageHero>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["تطبيق 5 حقائب قرآنية", "برنامج سنوي متكامل"], [`الحد الأدنى ${minTeachers} معلمًا`, "لبدء البرنامج"], ["تقرير أثر للمدرسة", "بناءً على نتائج Q360"]].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display font-bold text-primary-deep">{t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <SectionTitle title="حاسبة اشتراك المدرسة" subtitle="قدّر التكلفة السنوية وفق عدد المعلمين والطلاب في مدرستك." />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-sm">
            عدد المعلمين (الحد الأدنى {minTeachers})
            <input type="number" min={minTeachers} value={teachers}
              onChange={(e) => setTeachers(Math.max(minTeachers, Number(e.target.value) || minTeachers))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3" />
            <span className="mt-1 block text-xs text-muted-foreground">{teacherPrice} ريال سنويًا لكل معلم</span>
          </label>
          <label className="text-sm">
            عدد الطلاب
            <input type="number" min={0} value={students}
              onChange={(e) => setStudents(Math.max(0, Number(e.target.value) || 0))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3" />
            <span className="mt-1 block text-xs text-muted-foreground">{studentPrice} ريال سنويًا لكل طالب</span>
          </label>
        </div>
        <div className="mt-6 rounded-2xl bg-hero p-6 text-primary-foreground">
          <p className="text-sm text-primary-foreground/80">
            {teachers} × {teacherPrice} + {students} × {studentPrice}
          </p>
          <p className="mt-1 font-display text-3xl font-bold">{total.toLocaleString("ar-EG")} ريال سنويًا</p>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle title="منافع البرنامج للمدرسة" subtitle="نظام واحد يربط التدريب اليومي بالثقافة المدرسية ونتائج قابلة للقياس." />
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {benefits.map((b, i) => (
            <li key={b} className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-7">
              <span className="font-display text-primary">{i + 1}</span>
              <span className="text-muted-foreground">{b}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <SectionTitle title="رحلة المدرسة" subtitle="من التسجيل إلى التقرير، بخطوات واضحة وفريق داخلي قادر على الاستمرار." />
        <div className="mt-5 flex flex-wrap gap-2">
          {journey.map((j, i) => (
            <span key={j} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-primary-deep">{i + 1}. {j}</span>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg"><Link to="/schools/dashboard"><Building2 /> لوحة تحكم المدرسة</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/contact">اطلب تسجيل مدرستك</Link></Button>
      </div>

    </div>
  );
}
