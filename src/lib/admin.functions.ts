import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** يتحقق من أن المستخدم الحالي يملك دور مدير، ويرمي خطأً إلا. */
async function requireAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("غير مصرّح — هذه الصفحة للمدير فقط");
}

/** يفحص هل المستخدم الحالي مدير (لإظهار رابط الإدارة في الواجهة). */
export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: Boolean(data) };
  });

/** مؤشرات المنصة العامة للوحة المدير. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const count = async (table: string) => {
      const { count } = await (sb as any).from(table).select("id", { count: "exact", head: true });
      return (count ?? 0) as number;
    };
    const [
      users, courses, enrollments, certificates, orders,
      schools, facilitatorApps, assessments,
    ] = await Promise.all([
      count("profiles"), count("courses"), count("enrollments"), count("certificates"),
      count("orders"), count("schools"), count("facilitator_applications"), count("q360_assessments"),
    ]);
    const { data: revenueRows } = await sb
      .from("payments")
      .select("amount")
      .eq("status", "paid");
    const revenue = (revenueRows ?? []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
    const { data: pendingOrders } = await sb
      .from("orders")
      .select("id, total, status, created_at, profiles(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);
    const { data: pendingApps } = await sb
      .from("facilitator_applications")
      .select("id, city, status, created_at, profiles(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);
    return {
      users, courses, enrollments, certificates, orders, schools, facilitatorApps, assessments,
      revenue, pendingOrders: pendingOrders ?? [], pendingApps: pendingApps ?? [],
    };
  });

/** يجلب إعدادات الأسعار والمنصة لتعديلها. */
export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data } = await context.supabase.from("settings").select("key, value, label").order("key");
    return data ?? [];
  });

/** يحدّث قيمة إعداد (سعر/نص) بعد التحقق من صلاحية المدير. */
export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { key: string; value: string }) => {
    if (!d?.key || typeof d.key !== "string" || d.key.length > 60) throw new Error("مفتاح غير صالح");
    return { key: d.key, value: String(d.value ?? "").slice(0, 500) };
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    // العمود jsonb: نحاول تحليل القيمة كـJSON (أرقام/نصوص مقتبسة)، وإلا نخزنها كنص.
    let value: unknown = data.value;
    try {
      value = JSON.parse(data.value);
    } catch {
      /* تبقى نصًا */
    }
    const { error } = await context.supabase
      .from("settings")
      .update({ value: value as never })
      .eq("key", data.key);
    if (error) throw new Error("تعذّر حفظ الإعداد");
    return { ok: true };
  });

/** يغيّر حالة طلب ميسّر (قبول/إكمال/رفض). */
export const setFacilitatorAppStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) => {
    if (!["accepted", "completed", "rejected", "pending"].includes(d?.status)) throw new Error("حالة غير صالحة");
    return d;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("facilitator_applications")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("تعذّر تحديث الطلب");
    return { ok: true };
  });

/** يؤكد دفع طلب يدويًا (التحويل البنكي) فيفعّل الطلب. */
export const markOrderPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const { error: e1 } = await sb.from("orders").update({ status: "paid" }).eq("id", data.orderId);
    const { error: e2 } = await sb.from("payments").update({ status: "paid" }).eq("order_id", data.orderId);
    if (e1 || e2) throw new Error("تعذّر تأكيد الدفع");
    return { ok: true };
  });

/** قائمة المستخدمين مع أدوارهم لإدارتها. */
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    const roleMap: Record<string, string[]> = {};
    (roles ?? []).forEach((r: any) => {
      roleMap[r.user_id] = [...(roleMap[r.user_id] ?? []), r.role];
    });
    return (profiles ?? []).map((p: any) => ({ ...p, roles: roleMap[p.id] ?? ["trainee"] }));
  });

/** يمنح دورًا لمستخدم (لا يمنح دور admin من الواجهة أبدًا). */
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: string }) => {
    if (!["facilitator", "school", "trainee"].includes(d?.role)) throw new Error("دور غير مسموح من الواجهة");
    return d;
  })
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("user_roles")
      .upsert(
        { user_id: data.userId, role: data.role as "facilitator" | "school" | "trainee" },
        { onConflict: "user_id,role" },
      );
    if (error) throw new Error("تعذّر منح الدور");
    return { ok: true };
  });
