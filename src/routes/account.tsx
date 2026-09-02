import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "حسابي | القرآن خطوة بخطوة" },
      { name: "description", content: "بوابة المستخدم: دوراتي، حقائبي، نسبة الإنجاز، الشهادات، نتائج Q360 والاشتراكات." },
      { property: "og:title", content: "حسابي — القرآن خطوة بخطوة" },
      { property: "og:description", content: "لوحة المتدرب والميسّر والمدرسة." },
    ],
  }),
  component: Page,
});

function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [stats, setStats] = useState({ courses: 0, percent: 0, certificates: 0, q360: 0 });
  const [myCourses, setMyCourses] = useState<{ id: string; slug: string; title: string; progress: number }[]>([]);
  const [myCerts, setMyCerts] = useState<
    { id: string; certificate_number: string; program_title: string; issued_at: string }[]
  >([]);

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
      setRoles([]);
      setMyCourses([]);
      setMyCerts([]);
      setStats({ courses: 0, percent: 0, certificates: 0, q360: 0 });
      return;
    }
    const uid = session.user.id;
    void (async () => {
      const [{ data: r }, { data: enr }, { data: certRows }, { count: q }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("enrollments").select("progress, courses(id, slug, title)").eq("user_id", uid),
        supabase
          .from("certificates")
          .select("id, certificate_number, program_title, issued_at")
          .eq("user_id", uid)
          .order("issued_at", { ascending: false }),
        supabase.from("q360_assessments").select("id", { count: "exact", head: true }).eq("user_id", uid),
      ]);
      const certs = (certRows ?? []).length;
      setMyCerts(certRows ?? []);
      setRoles((r ?? []).map((x) => x.role as string));
      const rows = (enr ?? []).flatMap((e) => {
        const c = e.courses as unknown as { id: string; slug: string; title: string } | null;
        return c ? [{ ...c, progress: e.progress ?? 0 }] : [];
      });
      setMyCourses(rows);
      setStats({
        courses: rows.length,
        percent: rows.length ? Math.round(rows.reduce((s, x) => s + x.progress, 0) / rows.length) : 0,
        certificates: certs ?? 0,
        q360: q ?? 0,
      });
    })();
  }, [session]);


  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/account", data: { full_name: fullName } },
      });
      if (err) setError(err.message);
      else setNotice("تم إنشاء الحساب. تحقق من بريدك الإلكتروني إن طُلب منك التأكيد.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("بيانات الدخول غير صحيحة.");
    }
  }

  async function google() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/account" });
    if (result.error) setError("تعذّر تسجيل الدخول عبر Google.");
  }

  if (!ready) return <div className="p-16 text-center text-muted-foreground">جارٍ التحميل…</div>;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl font-bold text-primary-deep">
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">ادخل إلى منصة التدريب على تطبيق القرآن.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input name="full_name" placeholder="الاسم الكامل" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
          )}
          <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
          <input name="password" type="password" required minLength={6} placeholder="كلمة المرور" className="w-full rounded-xl border border-input bg-background px-4 py-3" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}
          <button className="w-full rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
            {mode === "signin" ? "دخول" : "إنشاء الحساب"}
          </button>
        </form>
        <button onClick={google} className="mt-3 w-full rounded-xl border border-border px-6 py-3 font-medium text-primary-deep">
          المتابعة عبر Google
        </button>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm text-muted-foreground underline"
        >
          {mode === "signin" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    trainee: "متدرب",
    facilitator: "ميسّر",
    school: "مدرسة",
    admin: "مدير النظام",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-deep">حسابي</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.user.email} · {roles.map((r) => roleLabel[r] ?? r).join("، ") || "متدرب"}
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          className="rounded-xl border border-border px-5 py-2.5 text-sm"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["دوراتي", String(stats.courses)],
          ["نسبة الإنجاز", `${stats.percent}%`],
          ["الشهادات", String(stats.certificates)],
          ["تقييمات Q360", String(stats.q360)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-6">
            <div className="font-display text-3xl font-bold text-primary">{v}</div>
            <div className="mt-1 text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      {myCourses.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold text-primary-deep">دوراتي</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {myCourses.map((c) => (
              <Link
                key={c.id}
                to="/courses/$slug"
                params={{ slug: c.slug }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-primary-deep">{c.title}</span>
                  <span className="text-sm text-primary">{c.progress}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 rounded-2xl bg-secondary/70 p-6 leading-8 text-muted-foreground">
        ابدأ رحلتك: استكشف <Link to="/bags" className="text-primary underline">الحقائب القرآنية</Link> ثم سجّل في{" "}
        <Link to="/academy" className="text-primary underline">الأكاديمية</Link> وقس أثرك عبر{" "}
        <Link to="/q360" className="text-primary underline">Q360</Link>.
      </div>

    </div>
  );
}
