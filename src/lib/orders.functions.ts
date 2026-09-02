import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type LineInput = { productId: string; qty: number };

/**
 * طبقة تجريد لبوابات الدفع السعودية (ميسر/هايبر باي/باي تابس).
 * ما دام لم تُضَف مفاتيح البوابة، يعمل النظام بوضع "التحويل البنكي/الدفع اليدوي"
 * وتبقى الطلبات بحالة "بانتظار الدفع" حتى يؤكدها المدير.
 */
function activeProvider(): "moyasar" | "hyperpay" | "paytabs" | "manual" {
  if (process.env["MOYASAR_SECRET_KEY"]) return "moyasar";
  if (process.env["HYPERPAY_ACCESS_TOKEN"]) return "hyperpay";
  if (process.env["PAYTABS_SERVER_KEY"]) return "paytabs";
  return "manual";
}

/** ينشئ طلبًا بأسعار مأخوذة من قاعدة البيانات (لا يُوثق بأسعار المتصفح) ويسجل عملية دفع معلّقة. */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { items: LineInput[] }) => {
    if (!Array.isArray(d?.items) || d.items.length === 0) throw new Error("السلة فارغة");
    if (d.items.length > 20) throw new Error("عدد العناصر كبير");
    return {
      items: d.items.map((i) => ({
        productId: String(i.productId),
        qty: Math.min(50, Math.max(1, Math.floor(Number(i.qty) || 1))),
      })),
    };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error } = await sb
      .from("products")
      .select("id, slug, title, price, billing_period, is_active")
      .in("id", ids)
      .eq("is_active", true);
    if (error) throw new Error("تعذّر جلب المنتجات");
    if (!products || products.length === 0) throw new Error("لا توجد منتجات صالحة في السلة");

    const lines = data.items.flatMap((i) => {
      const p = products.find((x) => x.id === i.productId);
      if (!p) return [];
      return [
        {
          product_id: p.id,
          slug: p.slug,
          title: p.title,
          billing_period: p.billing_period,
          unit_price: Number(p.price),
          qty: i.qty,
          subtotal: Number(p.price) * i.qty,
        },
      ];
    });
    if (lines.length === 0) throw new Error("لا توجد منتجات صالحة في السلة");

    const total = lines.reduce((s, l) => s + l.subtotal, 0);
    const provider = activeProvider();

    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        user_id: context.userId,
        total,
        currency: "SAR",
        status: "pending",
        items: lines,
      })
      .select("id, total, currency, status, created_at")
      .single();
    if (orderErr || !order) throw new Error("تعذّر إنشاء الطلب");

    const reference = `QSBS-${new Date().getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;
    await sb.from("payments").insert({
      user_id: context.userId,
      order_id: order.id,
      amount: total,
      provider,
      status: "pending",
      reference,
    });

    return { orderId: order.id, total, currency: order.currency, provider, reference, lines };
  });

/** طلبات المستخدم الحالي مع حالة الدفع. */
export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: orders } = await sb
      .from("orders")
      .select("id, total, currency, status, items, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const { data: payments } = await sb.from("payments").select("order_id, provider, status, reference");
    return (orders ?? []).map((o) => ({
      ...o,
      payment: (payments ?? []).find((p) => p.order_id === o.id) ?? null,
    }));
  });
