import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getBags, getProducts } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

const q = queryOptions({
  queryKey: ["store"],
  queryFn: async () => ({ products: await getProducts(), bags: await getBags() }),
});

export const Route = createFileRoute("/store")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المتجر | حقائب ودورات وعضويات القرآن خطوة بخطوة" },
      { name: "description", content: "متجر المنصة: الدورات الإلكترونية، عضوية المتدرب والميسّر، تأهيل الميسّرين، Q360، وبرامج المدارس." },
      { property: "og:title", content: "متجر القرآن خطوة بخطوة" },
      { property: "og:description", content: "اشترِ الدورات والعضويات وخدمة قياس الأثر Q360." },
    ],
  }),
  component: Page,
});

const period: Record<string, string> = { one_time: "دفعة واحدة", yearly: "سنويًا" };

function Page() {
  const { data } = useSuspenseQuery(q);
  const { products, bags } = data;
  const { add, count } = useCart();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">المتجر</h1>
      <p className="mt-4 max-w-3xl leading-9 text-muted-foreground">
        جميع الأسعار بالريال السعودي وقابلة للتعديل من لوحة الإدارة. الدفع يتم عبر بوابات الدفع السعودية.
      </p>
      <Link to="/cart" className="mt-6 inline-flex rounded-xl border border-border px-5 py-2.5 text-sm font-medium">
        عرض السلة{count > 0 ? ` (${count})` : ""}
      </Link>
      <h2 className="mt-12 font-display text-2xl font-bold text-primary-deep">الحقائب القرآنية</h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        كل حقيبة مبنية على آية أو موضوع قرآني، وترتبط بدورة إلكترونية داخل الأكاديمية.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bags.map((b) => (
          <Link
            key={b.id}
            to="/bags/$slug"
            params={{ slug: b.slug }}
            className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-soft"
          >
            {bagImage(b.slug) && (
              <img
                src={bagImage(b.slug)}
                alt={`غلاف حقيبة ${b.title}`}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
            )}
            <div className="p-5">
              <h3 className="font-display text-base font-bold text-primary-deep">{b.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{b.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-bold text-primary-deep">الدورات والعضويات والخدمات</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            {productImage(p.slug) && (
              <img
                src={productImage(p.slug)}
                alt={p.title}
                loading="lazy"
                width={1024}
                height={640}
                className="aspect-[16/10] w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col p-6">
            <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{p.category}</span>
            <h2 className="mt-3 font-display text-lg font-bold text-primary-deep">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{p.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-display text-xl font-bold text-primary">
                {p.price} ريال <span className="text-xs font-normal text-muted-foreground">{period[p.billing_period]}</span>
              </span>
              <button
                onClick={() => {
                  add({
                    productId: p.id,
                    slug: p.slug,
                    title: p.title,
                    price: Number(p.price),
                    billing_period: p.billing_period,
                  });
                  toast.success("تمت الإضافة إلى السلة");
                }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                أضف للسلة
              </button>
            </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
