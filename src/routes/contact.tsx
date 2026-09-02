import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | القرآن خطوة بخطوة" },
      { name: "description", content: "تواصل مع فريق منصة القرآن خطوة بخطوة للاستفسار عن الحقائب والدورات وبرامج المدارس." },
      { property: "og:title", content: "تواصل معنا" },
      { property: "og:description", content: "نسعد بخدمة الأفراد والمدارس والجهات." },
    ],
  }),
  component: Page,
});

const schema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صحيح").max(255),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا").max(1000),
});

function Page() {
  const [errors, setErrors] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">تواصل معنا</h1>
      <p className="mt-4 leading-9 text-muted-foreground">نسعد باستقبال استفسارات الأفراد والمدارس والجهات التعليمية.</p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const parsed = schema.safeParse({
            name: String(fd.get("name") ?? ""),
            email: String(fd.get("email") ?? ""),
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
        <input name="name" placeholder="الاسم" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
        <input name="email" placeholder="البريد الإلكتروني" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
        <textarea name="message" rows={6} placeholder="رسالتك" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
        {errors.length > 0 && (
          <ul className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        {sent && <p className="rounded-xl bg-secondary p-4 text-sm text-primary-deep">تم استلام رسالتك، وسنتواصل معك قريبًا بإذن الله.</p>}
        <button className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground">إرسال</button>
      </form>
    </div>
  );
}
