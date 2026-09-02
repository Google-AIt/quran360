import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { verifyCertificate } from "@/lib/certificates.functions";

const certQuery = (number: string) =>
  queryOptions({ queryKey: ["certificate", number], queryFn: () => verifyCertificate({ data: { number } }) });

export const Route = createFileRoute("/verify/$number")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(certQuery(params.number)),
  head: ({ params }) => ({
    meta: [
      { title: `التحقق من الشهادة ${params.number} | القرآن خطوة بخطوة` },
      { name: "description", content: "صفحة التحقق الرسمية من شهادات منصة القرآن خطوة بخطوة عبر الرقم الفريد ورمز QR." },
      { property: "og:title", content: "التحقق من الشهادة — القرآن خطوة بخطوة" },
      { property: "og:description", content: "تأكد من صحة الشهادة ورقمها وتاريخ إصدارها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => <div className="p-16 text-center text-muted-foreground">تعذّر التحقق، حاول لاحقًا.</div>,
  notFoundComponent: () => <div className="p-16 text-center text-muted-foreground">الشهادة غير موجودة.</div>,
  component: Page,
});

const kindLabel: Record<string, string> = {
  course: "شهادة إتمام دورة تطبيقية",
  facilitator: "شهادة تأهيل واعتماد ميسّر",
  bag: "شهادة إتمام حقيبة قرآنية",
};

function Page() {
  const { number } = Route.useParams();
  const { data } = useSuspenseQuery(certQuery(number));

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-primary-deep">شهادة غير صالحة</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          لا توجد شهادة بالرقم <span className="font-mono">{number}</span> في سجلات المنصة.
        </p>
        <Link to="/verify" className="mt-6 inline-block text-primary underline">
          تحقق من رقم آخر
        </Link>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : `https://quranstepbystep.com/verify/${number}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl border-2 border-gold/60 bg-card p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-medium text-primary">شهادة موثّقة ✓</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-primary-deep">{kindLabel[data.kind] ?? "شهادة"}</h1>
        <p className="ayah mt-6 text-xl text-primary">{data.program_title}</p>
        <p className="mt-6 text-sm text-muted-foreground">مُنحت إلى</p>
        <p className="font-display text-2xl font-bold text-primary-deep">{data.recipient_name}</p>

        <dl className="mx-auto mt-8 grid max-w-md gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-secondary/70 p-4">
            <dt className="text-muted-foreground">رقم الشهادة</dt>
            <dd className="mt-1 font-mono text-primary-deep">{data.certificate_number}</dd>
          </div>
          <div className="rounded-xl bg-secondary/70 p-4">
            <dt className="text-muted-foreground">تاريخ الإصدار</dt>
            <dd className="mt-1 text-primary-deep">
              {new Date(data.issued_at).toLocaleDateString("ar-SA-u-ca-islamic")}
            </dd>
          </div>
        </dl>

        <div className="mt-8 inline-block rounded-2xl bg-background p-4">
          <QRCodeSVG value={url} size={132} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">امسح الرمز للتحقق من الشهادة مباشرة</p>
      </div>
    </div>
  );
}
