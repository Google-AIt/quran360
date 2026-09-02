import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | القرآن خطوة بخطوة" },
      { name: "description", content: "تواصل مع فريق منصة القرآن خطوة بخطوة: دعم فني، تسجيل مدرسة، طلب شراكة، الانضمام كميسّر، والأسئلة الشائعة." },
      { property: "og:title", content: "تواصل معنا" },
      { property: "og:description", content: "نسعد بخدمة الأفراد والمدارس والجهات: استفسارات، شراكات، وتسجيل المدارس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const topics = [
  { value: "general", label: "تواصل عام" },
  { value: "support", label: "الدعم الفني" },
  { value: "school", label: "طلب تسجيل مدرسة" },
  { value: "partnership", label: "طلب شراكة" },
  { value: "facilitator", label: "الانضمام كميسّر" },
  { value: "inquiry", label: "استفسار آخر" },
] as const;

const faqs: [string, string][] = [
  [
    "ما الفرق بين الحقيبة القرآنية والدورة الإلكترونية؟",
    "الحقيبة هي المحتوى التدريبي الكامل المبني على آية أو موضوع قرآني (المفهوم، التصور الذهني، الخطوات العملية، النتائج، الأنشطة، التحديات، التقييم، Q360). أما الدورة الإلكترونية فهي التنفيذ الرقمي للحقيبة داخل الأكاديمية عبر خمسة فيديوهات تدريبية.",
  ],
  [
    "كم عدد الحقائب القرآنية؟",
    "تستهدف المنصة 12 حقيبة قرآنية، وتُضاف أسماء الحقائب تباعًا بعد اعتمادها.",
  ],
  [
    "ما أسعار الاشتراك؟",
    "الدورة الواحدة 300 ريال، وعضوية المتدرب 500 ريال سنويًا وتشمل جميع دورات الأكاديمية، وعضوية الميسّر 2,400 ريال سنويًا، وQ360 بـ50 ريال. وفي برنامج المدارس: 2,400 ريال سنويًا للمعلم و240 ريال سنويًا للطالب.",
  ],
  [
    "كيف تشترك المدرسة في البرنامج؟",
    "نموذج المدرسة يقوم على تطبيق 5 حقائب قرآنية بحد أدنى 20 معلمًا. يمكن تقدير الاشتراك السنوي من صفحة المدارس، ثم إرسال طلب تسجيل مدرسة من هذا النموذج.",
  ],
  [
    "ما هو Q360 وهل يمكن شراؤه بشكل مستقل؟",
    "Q360 نظام لقياس الأثر السلوكي عبر تقييم المتدرب نفسه والأسرة والزملاء والمدير/المشرف، بأسئلة سلوكية قابلة للملاحظة على مقياس من 1 إلى 5. ونعم، يمكن شراؤه وتفعيله كخدمة مستقلة بسعر 50 ريال.",
  ],
  [
    "كيف أصبح ميسّرًا معتمدًا؟",
    "عبر مسار تأهيل الميسّر الذي يشمل المنهجية التطبيقية ومهارات التيسير وتقديم الحقائب وإدارة الأنشطة ومتابعة المتدربين وقياس الأثر، وينتهي بشهادة تأهيل واعتماد ميسّر الحقائب القرآنية.",
  ],
  [
    "هل أحصل على شهادة عند إتمام الدورة؟",
    "نعم، تُصدر شهادة إتمام بعد إكمال دروس الدورة، ولكل شهادة رقم ورمز QR يمكن التحقق منه من صفحة التحقق في المنصة.",
  ],
];

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255),
  topic: z.string().trim().min(1, "يرجى اختيار نوع الطلب"),
  organization: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا").max(1000),
});

function Page() {
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState<string>("general");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const needsOrg = topic === "school" || topic === "partnership";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">تواصل معنا</h1>
      <p className="mt-4 leading-9 text-muted-foreground">
        نسعد باستقبال استفسارات الأفراد والمدارس والجهات التعليمية، وطلبات الشراكة والانضمام إلى فريق الميسّرين.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const parsed = schema.safeParse({
            name: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
            topic: String(fd.get("topic") ?? ""),
            organization: String(fd.get("organization") ?? ""),
            message: String(fd.get("message") ?? ""),
          });
          if (!parsed.success) {
            setErrors(parsed.error.issues.map((i) => i.message));
            setSent(false);
            return;
          }
          setErrors([]);
          setSent(true);
        }}
      >
        <div className="grid gap-2">
          <span className="text-sm font-medium text-primary-deep">نوع الطلب</span>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value)}
                className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                  topic === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="topic" value={topic} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="الاسم" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
          <input name="email" placeholder="البريد الإلكتروني" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
        </div>
        {needsOrg && (
          <input
            name="organization"
            placeholder={topic === "school" ? "اسم المدرسة والمدينة" : "اسم الجهة"}
            className="w-full rounded-xl border border-input bg-background px-4 py-3"
          />
        )}
        <textarea name="message" rows={6} placeholder="رسالتك" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
        {errors.length > 0 && (
          <ul className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        {sent && <p className="rounded-xl bg-secondary p-4 text-sm text-primary-deep">تم استلام رسالتك، وسنتواصل معك قريبًا بإذن الله.</p>}
        <button className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground">إرسال</button>
      </form>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-primary-deep">الأسئلة الشائعة</h2>
        <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right font-display text-base font-bold text-primary-deep hover:bg-secondary/60"
              >
                {q}
                <span className="text-muted-foreground">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && <p className="px-5 pb-5 text-sm leading-8 text-muted-foreground">{a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
