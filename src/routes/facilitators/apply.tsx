import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/facilitators/apply")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "التقديم على مسار تأهيل الميسّر | القرآن خطوة بخطوة" },
      { name: "description", content: "قدّم طلبك للانضمام إلى مسار تأهيل واعتماد ميسّر الحقائب القرآنية وتابع مراحل تأهيلك خطوة بخطوة." },
      { property: "og:title", content: "مسار تأهيل الميسّر — القرآن خطوة بخطوة" },
      { property: "og:description", content: "ست مراحل من الفهم إلى الاعتماد وشهادة موثّقة برمز QR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const stages = [
  { t: "فهم المنهجية", d: "استيعاب رحلة المعرفة إلى الأثر ومراحلها الخمس." },
  { t: "تطبيق الحقائب", d: "إتمام حقيبتين قرآنيتين تطبيقيًا مع الأنشطة والتحديات." },
  { t: "مهارات التيسير", d: "إدارة الحوار، الأسئلة التطبيقية، وبناء التحديات." },
  { t: "إدارة الأنشطة والتطبيق", d: "تصميم جلسة تطبيقية كاملة وتنفيذها." },
  { t: "متابعة المتدربين وقياس الأثر", d: "استخدام Q360 قبل/بعد/تتبعي وتحليل نسبة التغير." },
  { t: "الاعتماد", d: "تقييم نهائي ثم إصدار شهادة تأهيل واعتماد برقم فريد ورمز QR." },
];

type App = {
  id: string;
  full_name: string;
  city: string | null;
  phone: string | null;
  experience: string | null;
  motivation: string | null;
  stage: number;
  status: string;
};

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  accepted: "مقبول — قيد التأهيل",
  completed: "مكتمل ومعتمد",
  rejected: "غير مقبول حاليًا",
};

function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [app, setApp] = useState<App | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setApp(null);
      return;
    }
    void supabase
      .from("facilitator_applications")
      .select("id, full_name, city, phone, experience, motivation, stage, status")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setApp(data as App | null));
  }, [session]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const { data, error: err } = await supabase
      .from("facilitator_applications")
      .insert({
        user_id: session.user.id,
        full_name: String(fd.get("full_name") ?? "").trim(),
        city: String(fd.get("city") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        experience: String(fd.get("experience") ?? "").trim() || null,
        motivation: String(fd.get("motivation") ?? "").trim() || null,
      })
      .select("id, full_name, city, phone, experience, motivation, stage, status")
      .maybeSingle();
    if (err) setError("تعذّر إرسال الطلب، حاول مرة أخرى.");
    else setApp(data as App);
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <nav className="text-sm text-muted-foreground">
        <Link to="/facilitators" className="hover:text-primary">
          الميسّرون
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary-deep">مسار التأهيل</span>
      </nav>

      <h1 className="mt-6 font-display text-4xl font-bold text-primary-deep">مسار تأهيل واعتماد الميسّر</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
        ستة مراحل متدرجة تنقلك من فهم المنهجية إلى قيادة التطبيق واعتمادك ميسّرًا للحقائب القرآنية.
      </p>

      <ol className="mt-10 grid gap-4 md:grid-cols-2">
        {stages.map((s, i) => {
          const reached = app ? app.stage > i : false;
          const current = app ? app.stage === i + 1 : false;
          return (
            <li
              key={s.t}
              className={`rounded-2xl border p-6 ${current ? "border-primary bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-8 items-center justify-center rounded-full font-display text-sm ${
                    reached ? "bg-primary text-primary-foreground" : "bg-secondary text-primary-deep"
                  }`}
                >
                  {reached ? "✓" : i + 1}
                </span>
                <h2 className="font-display font-bold text-primary-deep">{s.t}</h2>
              </div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.d}</p>
            </li>
          );
        })}
      </ol>

      <section className="mt-12">
        {!ready ? (
          <p className="text-muted-foreground">جارٍ التحميل…</p>
        ) : !session ? (
          <div className="rounded-2xl bg-secondary/70 p-6">
            <p className="leading-8 text-muted-foreground">سجّل الدخول أولًا لتقديم طلب الالتحاق بمسار التأهيل.</p>
            <Link
              to="/account"
              className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              تسجيل الدخول
            </Link>
          </div>
        ) : app ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold text-primary-deep">حالة طلبك</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              الاسم: {app.full_name} · الحالة:{" "}
              <span className="text-primary">{statusLabel[app.status] ?? app.status}</span> · المرحلة الحالية:{" "}
              {app.stage} من {stages.length}
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(((app.stage - 1) / stages.length) * 100)}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              عند إكمال المراحل تُصدر شهادة تأهيل واعتماد ميسّر برقم فريد ورمز QR قابل للتحقق عبر{" "}
              <Link to="/verify" className="text-primary underline">
                صفحة التحقق
              </Link>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold text-primary-deep">طلب الالتحاق</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input name="full_name" required placeholder="الاسم الكامل" className="rounded-xl border border-input bg-background px-4 py-3" />
              <input name="city" placeholder="المدينة" className="rounded-xl border border-input bg-background px-4 py-3" />
              <input name="phone" placeholder="رقم الجوال" className="rounded-xl border border-input bg-background px-4 py-3" />
              <input name="experience" placeholder="خبرتك في التدريب/التعليم" className="rounded-xl border border-input bg-background px-4 py-3" />
            </div>
            <textarea
              name="motivation"
              rows={4}
              placeholder="لماذا ترغب في أن تكون ميسّرًا للحقائب القرآنية؟"
              className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3"
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <button
              disabled={busy}
              className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              إرسال الطلب
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
