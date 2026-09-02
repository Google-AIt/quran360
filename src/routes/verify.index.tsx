import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/verify/")({
  head: () => ({
    meta: [
      { title: "التحقق من الشهادات | القرآن خطوة بخطوة" },
      { name: "description", content: "تحقق من صحة شهادات المتدربين والميسّرين في منصة القرآن خطوة بخطوة عبر الرقم الفريد للشهادة." },
      { property: "og:title", content: "التحقق من الشهادات — القرآن خطوة بخطوة" },
      { property: "og:description", content: "أدخل رقم الشهادة للتأكد من صحتها وتاريخ إصدارها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <h1 className="font-display text-3xl font-bold text-primary-deep">التحقق من الشهادات</h1>
      <p className="mt-3 leading-8 text-muted-foreground">
        كل شهادة تصدرها المنصة تحمل رقمًا فريدًا ورمز QR. أدخل الرقم للتأكد من صحتها.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const n = value.trim().toUpperCase();
          if (n) void navigate({ to: "/verify/$number", params: { number: n } });
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="QSBS-C2026-XXXXXX"
          className="w-full rounded-xl border border-input bg-background px-4 py-3 font-mono"
        />
        <button className="shrink-0 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">تحقق</button>
      </form>
    </div>
  );
}
