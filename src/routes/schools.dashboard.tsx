import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/schools/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "لوحة تحكم المدرسة | القرآن خطوة بخطوة" },
      {
        name: "description",
        content:
          "لوحة المدرسة: تسجيل المدرسة، إدارة المعلمين والطلاب، متابعة الحقائب المفعّلة، ومؤشرات الأثر وتقدير الفاتورة السنوية.",
      },
      { property: "og:title", content: "لوحة تحكم المدرسة — القرآن خطوة بخطوة" },
      { property: "og:description", content: "إدارة المعلمين والطلاب والحقائب المفعّلة وتقدير الاشتراك السنوي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type School = {
  id: string;
  name: string;
  city: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  teachers_count: number;
  students_count: number;
  active_bags: unknown;
  status: string;
};

type Member = {
  id: string;
  full_name: string;
  member_type: string;
  grade: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "قيد المراجعة",
  active: "مفعّلة",
  suspended: "موقوفة",
};

function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [school, setSchool] = useState<School | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [bags, setBags] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [prices, setPrices] = useState({ teacher: 2400, student: 240 });
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
    void (async () => {
      const [{ data: b }, { data: s }] = await Promise.all([
        supabase.from("quran_bags").select("id, title, slug").eq("is_published", true).order("sort_order"),
        supabase.from("settings").select("key, value").in("key", ["price_school_teacher", "price_school_student"]),
      ]);
      setBags(b ?? []);
      const map = Object.fromEntries((s ?? []).map((r) => [r.key, Number(r.value)]));
      setPrices({
        teacher: Number(map["price_school_teacher"] ?? 2400),
        student: Number(map["price_school_student"] ?? 240),
      });
    })();
  }, []);

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase.from("schools").select("*").eq("owner_id", uid).maybeSingle();
    setSchool((data as School | null) ?? null);
    if (data) {
      const { data: m } = await supabase
        .from("school_members")
        .select("id, full_name, member_type, grade")
        .eq("school_id", data.id)
        .order("created_at", { ascending: false });
      setMembers((m as Member[]) ?? []);
    } else {
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setSchool(null);
      setMembers([]);
      return;
    }
    void load(session.user.id);
  }, [session, load]);

  const activeBags: string[] = Array.isArray(school?.active_bags) ? (school!.active_bags as string[]) : [];
  const teachers = members.filter((m) => m.member_type === "teacher");
  const students = members.filter((m) => m.member_type === "student");
  const invoice = teachers.length * prices.teacher + students.length * prices.student;

  async function registerSchool(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const { error: err } = await supabase.from("schools").insert({
      owner_id: session.user.id,
      name: String(f.get("name") ?? ""),
      city: String(f.get("city") ?? ""),
      contact_email: String(f.get("email") ?? ""),
      contact_phone: String(f.get("phone") ?? ""),
    });
    setBusy(false);
    if (err) setError(err.message);
    else await load(session.user.id);
  }

  async function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!school || !session) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("school_members").insert({
      school_id: school.id,
      full_name: String(f.get("full_name") ?? ""),
      member_type: String(f.get("member_type") ?? "student"),
      grade: String(f.get("grade") ?? "") || null,
    });
    if (!err) {
      const t = String(f.get("member_type")) === "teacher";
      await supabase
        .from("schools")
        .update(
          t
            ? { teachers_count: teachers.length + 1 }
            : { students_count: students.length + 1 },
        )
        .eq("id", school.id);
      form.reset();
      await load(session.user.id);
    } else setError(err.message);
    setBusy(false);
  }

  async function removeMember(id: string) {
    if (!session) return;
    await supabase.from("school_members").delete().eq("id", id);
    await load(session.user.id);
  }

  async function toggleBag(slug: string) {
    if (!school || !session) return;
    const next = activeBags.includes(slug) ? activeBags.filter((s) => s !== slug) : [...activeBags, slug];
    await supabase.from("schools").update({ active_bags: next }).eq("id", school.id);
    await load(session.user.id);
  }

  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-24 text-center text-muted-foreground">جارِ التحميل…</div>;

  if (!session)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-4 text-3xl font-bold">لوحة تحكم المدرسة</h1>
        <p className="mb-8 text-muted-foreground">سجّل الدخول للوصول إلى لوحة مدرستك وإدارة المعلمين والطلاب.</p>
        <Link to="/account" className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground">
          تسجيل الدخول
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">لوحة تحكم المدرسة</h1>
      <p className="mb-8 text-muted-foreground">إدارة المعلمين والطلاب والحقائب المفعّلة ومؤشرات الأثر.</p>

      {error && <p className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

      {!school ? (
        <form onSubmit={registerSchool} className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
          <h2 className="text-xl font-semibold sm:col-span-2">تسجيل مدرسة جديدة</h2>
          <input name="name" required placeholder="اسم المدرسة" className="rounded-xl border border-border bg-background px-4 py-3" />
          <input name="city" placeholder="المدينة" className="rounded-xl border border-border bg-background px-4 py-3" />
          <input name="email" type="email" placeholder="البريد الإلكتروني للتواصل" className="rounded-xl border border-border bg-background px-4 py-3" />
          <input name="phone" placeholder="رقم الجوال" className="rounded-xl border border-border bg-background px-4 py-3" />
          <button disabled={busy} className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground sm:col-span-2">
            {busy ? "جارِ الحفظ…" : "تسجيل المدرسة"}
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-4">
            {[
              { l: "المعلمون", v: teachers.length },
              { l: "الطلاب", v: students.length },
              { l: "الحقائب المفعّلة", v: activeBags.length },
              { l: "الاشتراك السنوي التقديري", v: `${invoice.toLocaleString("ar-EG")} ر.س` },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-card p-5 text-center">
                <div className="text-2xl font-bold text-primary">{s.v}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">{school.name}</h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                {statusLabel[school.status] ?? school.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {school.city ?? "—"} · {school.contact_email ?? "—"} · {school.contact_phone ?? "—"}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">الحقائب المفعّلة في المدرسة</h2>
            <div className="flex flex-wrap gap-2">
              {bags.map((b) => {
                const on = activeBags.includes(b.slug);
                return (
                  <button
                    key={b.id}
                    onClick={() => void toggleBag(b.slug)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
                    }`}
                  >
                    {b.title}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">إضافة معلم / طالب</h2>
            <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-4">
              <input name="full_name" required placeholder="الاسم الكامل" className="rounded-xl border border-border bg-background px-4 py-3" />
              <select name="member_type" className="rounded-xl border border-border bg-background px-4 py-3">
                <option value="student">طالب</option>
                <option value="teacher">معلم</option>
              </select>
              <input name="grade" placeholder="الصف / التخصص" className="rounded-xl border border-border bg-background px-4 py-3" />
              <button disabled={busy} className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
                إضافة
              </button>
            </form>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="p-2">الاسم</th>
                    <th className="p-2">الفئة</th>
                    <th className="p-2">الصف</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="p-2">{m.full_name}</td>
                      <td className="p-2">{m.member_type === "teacher" ? "معلم" : "طالب"}</td>
                      <td className="p-2">{m.grade ?? "—"}</td>
                      <td className="p-2">
                        <button onClick={() => void removeMember(m.id)} className="text-destructive hover:underline">
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        لا يوجد أعضاء بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-xl font-semibold">تقدير الفاتورة السنوية</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-border pb-2">
                <span>تأهيل المعلمين ({teachers.length} × {prices.teacher.toLocaleString("ar-EG")} ر.س)</span>
                <span>{(teachers.length * prices.teacher).toLocaleString("ar-EG")} ر.س</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span>اشتراك الطلاب ({students.length} × {prices.student.toLocaleString("ar-EG")} ر.س)</span>
                <span>{(students.length * prices.student).toLocaleString("ar-EG")} ر.س</span>
              </li>
              <li className="flex justify-between pt-1 text-lg font-bold text-primary">
                <span>الإجمالي</span>
                <span>{invoice.toLocaleString("ar-EG")} ر.س</span>
              </li>
            </ul>
            <Link to="/contact" className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
              طلب عرض سعر رسمي
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}
