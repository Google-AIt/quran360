import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Trash2, ShoppingBag, Loader2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات | القرآن خطوة بخطوة" },
      { name: "description", content: "راجع طلبك من الدورات والعضويات وبرامج قياس الأثر ثم أكمل الدفع بالريال السعودي." },
      { property: "og:title", content: "سلة المشتريات | القرآن خطوة بخطوة" },
      { property: "og:description", content: "إتمام طلب الدورات والعضويات وخدمات المنصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const period: Record<string, string> = { one_time: "دفعة واحدة", yearly: "سنويًا" };

type Placed = { orderId: string; total: number; reference: string; provider: string };

function Page() {
  const { items, total, setQty, remove, clear } = useCart();
  const submit = useServerFn(createOrder);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  async function checkout() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("سجّل الدخول أولًا لإتمام الطلب");
        setLoading(false);
        return;
      }
      const res = await submit({ data: { items: items.map((i) => ({ productId: i.productId, qty: i.qty })) } });
      setPlaced({ orderId: res.orderId, total: res.total, reference: res.reference, provider: res.provider });
      clear();
      toast.success("تم إنشاء طلبك بنجاح");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر إتمام الطلب");
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <BadgeCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold text-primary-deep">تم تسجيل طلبك</h1>
          <p className="mt-3 leading-8 text-muted-foreground">
            رقم المرجع: <span className="font-mono font-bold text-foreground">{placed.reference}</span>
            <br />
            الإجمالي: <span className="font-bold text-foreground">{placed.total} ريال سعودي</span>
          </p>
          <div className="mt-6 rounded-xl bg-secondary p-5 text-right text-sm leading-8 text-secondary-foreground">
            {placed.provider === "manual" ? (
              <>
                <p className="font-bold">طريقة السداد الحالية: التحويل البنكي</p>
                <p>
                  حوّل قيمة الطلب ثم أرسل إشعار التحويل عبر صفحة «تواصل معنا» مرفقًا برقم المرجع، وسيتم تفعيل اشتراكك
                  خلال يوم عمل واحد. ستظهر حالة الطلب في صفحة «حسابي».
                </p>
              </>
            ) : (
              <p>سيتم تحويلك إلى بوابة الدفع لإتمام العملية، وحالة الطلب تظهر في صفحة «حسابي».</p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/account" className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
              متابعة الطلب في حسابي
            </Link>
            <Link to="/store" className="rounded-xl border border-border px-6 py-3 text-sm font-medium">
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">سلة المشتريات</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">سلتك فارغة حاليًا.</p>
          <Link to="/store" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            تصفّح المتجر
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="grid gap-4">
            {items.map((i) => (
              <li key={i.productId} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="min-w-48 flex-1">
                  <h2 className="font-display text-lg font-bold text-primary-deep">{i.title}</h2>
                  <p className="text-xs text-muted-foreground">{period[i.billing_period] ?? i.billing_period}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="إنقاص"
                    onClick={() => setQty(i.productId, i.qty - 1)}
                    className="size-9 rounded-lg border border-border"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold">{i.qty}</span>
                  <button
                    aria-label="زيادة"
                    onClick={() => setQty(i.productId, i.qty + 1)}
                    className="size-9 rounded-lg border border-border"
                  >
                    +
                  </button>
                </div>
                <span className="font-display text-lg font-bold text-primary">{i.price * i.qty} ريال</span>
                <button aria-label="حذف" onClick={() => remove(i.productId)} className="rounded-lg p-2 text-destructive">
                  <Trash2 className="size-5" />
                </button>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-primary-deep">ملخص الطلب</h2>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>الإجمالي</span>
              <span className="font-display text-xl font-bold text-primary">{total} ريال</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">الأسعار بالريال السعودي وتُعتمد نهائيًا من الخادم.</p>
            <button
              onClick={checkout}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              إتمام الطلب
            </button>
            <button onClick={clear} className="mt-3 w-full rounded-xl border border-border px-6 py-2.5 text-sm">
              تفريغ السلة
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
