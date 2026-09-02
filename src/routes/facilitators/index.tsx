import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/public.functions";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/facilitators/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "الميسّرون | تأهيل واعتماد ميسّر الحقائب القرآنية" },
      { name: "description", content: "برنامج تأهيل واعتماد الميسّرين: فهم المنهجية، تطبيق الحقائب، مهارات التيسير، وقياس الأثر." },
      { property: "og:title", content: "الميسّرون — القرآن خطوة بخطوة" },
      { property: "og:description", content: "الميسّر قائد تطبيق لا ناقل محتوى." },
    ],
  }),
  component: Page,
});

const qualification = ["فهم المنهجية", "تطبيق الحقائب", "مهارات التيسير", "إدارة الأنشطة", "إدارة التطبيق", "متابعة المتدربين", "قياس الأثر"];
const benefits = ["الوصول إلى المنصة", "المواد التعليمية", "أدلة الميسّر", "الأدوات التدريبية", "المحتوى", "التحديثات"];

function Page() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">الميسّرون</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
        الميسّر هو الشخص الذي يقود المتدرب في تطبيق المنهجية والحقائب، وليس مجرد ناقل للمحتوى.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {["تأهيل الميسّر", "حقيبة الميسّر", "عضوية الميسّر", "اعتماد الميسّر"].map((t) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-6 text-center">
            <h2 className="font-display font-bold text-primary-deep">{t}</h2>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">محاور التأهيل</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {qualification.map((x) => <li key={x} className="flex gap-2"><span className="text-gold">•</span>{x}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">
            عضوية الميسّر — {data["price_facilitator_membership"]} ريال سنويًا
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {benefits.map((x) => <li key={x} className="flex gap-2"><span className="text-gold">•</span>{x}</li>)}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/store" className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
              اشترك الآن
            </Link>
            <Link to="/facilitators/apply" className="inline-block rounded-xl border border-primary px-5 py-2.5 text-sm font-medium text-primary">
              ابدأ مسار التأهيل
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-10 rounded-3xl bg-gold-soft p-8">
        <h2 className="font-display text-xl font-bold text-accent-foreground">الشهادة</h2>
        <p className="mt-2 leading-8 text-accent-foreground/80">شهادة تأهيل واعتماد ميسّر الحقائب القرآنية، برقم فريد ورمز تحقق QR.</p>
        <Link to="/verify" className="mt-4 inline-block text-sm text-primary underline">
          التحقق من شهادة
        </Link>
      </div>
    </div>
  );
}
