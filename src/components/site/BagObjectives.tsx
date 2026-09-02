/**
 * محتوى رسمي منقول من صفحات الحقائب في الموقع الرسمي quranstepbystep.com
 * "أهداف الحقائب القرآنية" + عبارة الطموح، يُعرض في صفحات الحقائب والدورات والمتجر.
 */
export const bagObjectives = [
  {
    key: "cognitive",
    label: "هدف معرفي",
    text: "تصحيح المفاهيم القرآنية وتثبيتها في أذهان الناس",
  },
  {
    key: "skill",
    label: "هدف مهاري",
    text: "ربط المتدرب بالمهارة المحددة في الآية الكريمة",
  },
  {
    key: "behavior",
    label: "هدف سلوكي",
    text: "تدريب المتدرب على خطوات عملية لتطبيق الآية وتحقيق أعلى مراتب الامتثال والتطبيق",
  },
] as const;

export const bagsAspiration =
  "تطمح الحقائب القرآنية إلى التغيير بالقرآن الكريم، من خلال ربط المفاهيم القرآنية بالواقع العملي المباشر للناس، بدءًا بتأصيل التصورات القرآنية وتصحيحها، انتهاءً بأعلى درجات الاقتداء وهي أن يكون الناس في سلوكهم قرآنًا يمشي على الأرض، قدوةً بنبيهم عليه أفضل الصلاة والتسليم.";

/** بطاقة كاملة تعرض أهداف الحقائب القرآنية الثلاثة مع عبارة الطموح. */
export function BagObjectives({
  title = "أهداف الحقيبة",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8 ${className}`}
    >
      <h2 className="font-display text-2xl font-bold text-primary-deep">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">أهداف الحقائب القرآنية</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {bagObjectives.map((o) => (
          <div key={o.key} className="rounded-2xl border border-border bg-background p-5">
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
              {o.label}
            </span>
            <p className="mt-3 text-sm leading-7 text-foreground/80">{o.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-border pt-5 text-sm leading-8 font-medium text-primary-deep">
        {bagsAspiration}
      </p>
    </section>
  );
}

/** صف مختصر من الأهداف الثلاثة يُعرض داخل بطاقات المنتجات والحقائب. */
export function ObjectiveChips({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="أهداف الحقائب القرآنية">
      {bagObjectives.map((o) => (
        <li
          key={o.key}
          title={o.text}
          className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] text-secondary-foreground"
        >
          {o.label}
        </li>
      ))}
    </ul>
  );
}
