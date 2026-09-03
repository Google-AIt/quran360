import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  amIAdmin, getAdminOverview, getAdminSettings, updateSetting,
  setFacilitatorAppStatus, markOrderPaid, listUsers, grantRole,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Settings2, ClipboardCheck, Banknote, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم المدير — القرآن خطوة بخطوة" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const fmt = new Intl.NumberFormat("ar-SA");

function Stat({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function AdminPage() {
  const qc = useQueryClient();
  const checkAdmin = useServerFn(amIAdmin);
  const overviewFn = useServerFn(getAdminOverview);
  const settingsFn = useServerFn(getAdminSettings);
  const usersFn = useServerFn(listUsers);
  const saveSetting = useServerFn(updateSetting);
  const appStatus = useServerFn(setFacilitatorAppStatus);
  const confirmPaid = useServerFn(markOrderPaid);
  const giveRole = useServerFn(grantRole);

  const adminQ = useQuery({ queryKey: ["am-admin"], queryFn: () => checkAdmin(), retry: false });

  const overviewQ = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn(),
    enabled: adminQ.data?.isAdmin === true,
  });
  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => settingsFn(),
    enabled: adminQ.data?.isAdmin === true,
  });
  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => usersFn(),
    enabled: adminQ.data?.isAdmin === true,
  });

  if (adminQ.isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">جارٍ التحقق من الصلاحية…</div>;
  }
  if (!adminQ.data?.isAdmin) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">غير مصرّح</h1>
        <p className="mt-2 text-muted-foreground">
          هذه الصفحة مخصصة لمدير المنصة. سجّل الدخول بحساب المدير ثم عد هنا.
        </p>
        <Button asChild className="mt-6">
          <Link to="/account">الذهاب إلى حسابي</Link>
        </Button>
      </div>
    );
  }

  const o = overviewQ.data;
  const settings = settingsQ.data ?? [];
  const users = usersQ.data ?? [];
  const [editing, setEditing] = useState<Record<string, string>>({});

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
      <p className="mt-1 text-muted-foreground">إدارة المنصة: المؤشرات، الأسعار، الطلبات، طلبات الميسّرين، والمستخدمون.</p>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">المؤشرات</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="facilitators">طلبات الميسّرين</TabsTrigger>
          <TabsTrigger value="settings">الأسعار والإعدادات</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="q360">Q360</TabsTrigger>
        </TabsList>

        <TabsContent value="q360">
          <Q360Admin />
        </TabsContent>



        {/* ===== المؤشرات ===== */}
        <TabsContent value="overview">
          {overviewQ.isLoading ? (
            <p className="py-10 text-center text-muted-foreground">جارٍ التحميل…</p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="المستخدمون" value={fmt.format(o?.users ?? 0)} icon={<Users className="h-5 w-5" />} />
              <Stat label="التسجيلات في الدورات" value={fmt.format(o?.enrollments ?? 0)} icon={<ClipboardCheck className="h-5 w-5" />} />
              <Stat label="الشهادات الصادرة" value={fmt.format(o?.certificates ?? 0)} icon={<ShieldCheck className="h-5 w-5" />} />
              <Stat label="المدارس" value={fmt.format(o?.schools ?? 0)} icon={<LayoutDashboard className="h-5 w-5" />} />
              <Stat label="الطلبات" value={fmt.format(o?.orders ?? 0)} icon={<Banknote className="h-5 w-5" />} />
              <Stat label="تقييمات Q360" value={fmt.format(o?.assessments ?? 0)} icon={<ClipboardCheck className="h-5 w-5" />} />
              <Stat label="طلبات الميسّرين" value={fmt.format(o?.facilitatorApps ?? 0)} icon={<Users className="h-5 w-5" />} />
              <Stat label="الإيرادات المؤكدة (ر.س)" value={fmt.format(o?.revenue ?? 0)} icon={<Banknote className="h-5 w-5" />} />
            </div>
          )}
        </TabsContent>

        {/* ===== الطلبات المعلّقة ===== */}
        <TabsContent value="orders">
          <div className="mt-6 space-y-3">
            {(o?.pendingOrders ?? []).length === 0 && (
              <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">لا توجد طلبات بانتظار الدفع.</p>
            )}
            {(o?.pendingOrders ?? []).map((order: any) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <p className="font-semibold">{order.profiles?.full_name ?? "مستخدم"}</p>
                  <p className="text-sm text-muted-foreground">
                    {fmt.format(Number(order.total))} ر.س — {new Date(order.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">بانتظار الدفع</Badge>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await confirmPaid({ data: { orderId: order.id } });
                        toast.success("تم تأكيد الدفع");
                        qc.invalidateQueries({ queryKey: ["admin-overview"] });
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    تأكيد الدفع (تحويل بنكي)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ===== طلبات الميسّرين ===== */}
        <TabsContent value="facilitators">
          <div className="mt-6 space-y-3">
            {(o?.pendingApps ?? []).length === 0 && (
              <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">لا توجد طلبات معلّقة.</p>
            )}
            {(o?.pendingApps ?? []).map((app: any) => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <p className="font-semibold">{app.profiles?.full_name ?? "متقدّم"}</p>
                  <p className="text-sm text-muted-foreground">{app.city} — {new Date(app.created_at).toLocaleDateString("ar-SA")}</p>
                </div>
                <div className="flex gap-2">
                  {(["accepted", "rejected"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === "accepted" ? "default" : "destructive"}
                      onClick={async () => {
                        try {
                          await appStatus({ data: { id: app.id, status: s } });
                          toast.success(s === "accepted" ? "تم قبول الطلب" : "تم رفض الطلب");
                          qc.invalidateQueries({ queryKey: ["admin-overview"] });
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      {s === "accepted" ? "قبول" : "رفض"}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ===== الأسعار والإعدادات ===== */}
        <TabsContent value="settings">
          <div className="mt-6 space-y-3">
            {settingsQ.isLoading && <p className="py-10 text-center text-muted-foreground">جارٍ التحميل…</p>}
            {settings.map((s: any) => {
              const current = editing[s.key] ?? (typeof s.value === "string" ? s.value : JSON.stringify(s.value));
              return (
                <div key={s.key} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
                  <div className="min-w-48">
                    <p className="font-semibold">{s.label ?? s.key}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{s.key}</p>
                  </div>
                  <Input
                    className="max-w-40"
                    value={current}
                    onChange={(e) => setEditing((prev) => ({ ...prev, [s.key]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={editing[s.key] === undefined}
                    onClick={async () => {
                      try {
                        await saveSetting({ data: { key: s.key, value: editing[s.key] ?? "" } });
                        toast.success("تم حفظ الإعداد");
                        setEditing((prev) => {
                          const { [s.key]: _drop, ...rest } = prev;
                          return rest;
                        });
                        qc.invalidateQueries({ queryKey: ["admin-settings"] });
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    <Settings2 className="ml-1 h-4 w-4" /> حفظ
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== المستخدمون ===== */}
        <TabsContent value="users">
          <div className="mt-6 space-y-3">
            {usersQ.isLoading && <p className="py-10 text-center text-muted-foreground">جارٍ التحميل…</p>}
            {users.map((u: any) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
                <div>
                  <p className="font-semibold">{u.full_name ?? "بدون اسم"}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{u.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(u.roles as string[]).map((r) => (
                    <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                      {r === "admin" ? "مدير" : r === "facilitator" ? "ميسّر" : r === "school" ? "مدرسة" : "متدرب"}
                    </Badge>
                  ))}
                  {!u.roles.includes("facilitator") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await giveRole({ data: { userId: u.id, role: "facilitator" } });
                          toast.success("تم منح دور ميسّر");
                          qc.invalidateQueries({ queryKey: ["admin-users"] });
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      منح ميسّر
                    </Button>
                  )}
                  {!u.roles.includes("school") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await giveRole({ data: { userId: u.id, role: "school" } });
                          toast.success("تم منح دور مدرسة");
                          qc.invalidateQueries({ queryKey: ["admin-users"] });
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      منح مدرسة
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
