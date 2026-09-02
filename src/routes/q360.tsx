import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, UsersRound } from "lucide-react";
import { getSettings } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { PageHero, SectionTitle, HeroStat } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

export const Route = createFileRoute("/q360")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "Q360 — قياس الأثر القرآني" },
      { name: "description", content: "نظام تقييم شامل يقيس أثر التدريب والتطبيق على سلوك المتدرب قبل التدريب وبعده وبعد شهر من التطبيق." },
      { property: "og:title", content: "Q360 — قياس الأثر القرآني" },
      { property: "og:description", content: "تعلّم. طبّق. قيّم. تغيّر." },
    ],
  }),
  component: Page,
});

const phases = ["Q360 قبلي", "التدريب", "التطبيق", "تقييم بعد التدريب", "تطبيق لمدة شهر", "Q360 بعد شهر"];
const raters = ["المتدرب", "الأسرة", "الزملاء", "المدير/المشرف", "الأشخاص الذين يعمل معهم أو تحت إشرافه"];
const scale = ["1 = لا يظهر", "2 = نادرًا", "3 = أحيانًا", "4 = غالبًا", "5 = باستمرار"];

function Page() {
  const { data } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero eyebrow="تعلّم. طبّق. قيّم. تغيّر." title="Q360 — قياس الأثر القرآني" description={`نظام تقييم شامل يقيس أثر التدريب والتطبيق على سلوك المتدرب من خلال التقييم الذاتي وتقييم الأشخاص المحيطين به، قبل التدريب وبعده وبعد مرور شهر على التطبيق. السعر ${data["price_q360"]} ريال.`} actions={<Button asChild variant="secondary"><Link to="/store">شراء خدمة Q360 <ArrowLeft /></Link></Button>}>
        <div className="grid gap-3 sm:grid-cols-3"><HeroStat value="360°" label="رؤية متكاملة للسلوك" /><HeroStat value="5" label="أنواع من المقيمين" /><HeroStat value="3" label="نقاط قياس زمنية" /></div>
      </PageHero>

      <div className="mt-10 flex flex-wrap gap-2">
        {phases.map((p, i) => (
          <span key={p} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-primary-deep">{i + 1}. {p}</span>
        ))}
      </div>

      <section className="mt-16">
        <SectionTitle title="قياسٌ يرى التغيير" subtitle="تقييم متعدد الزوايا يساعد المتدرب والجهة على فهم ما تغيّر وما يحتاج إلى دعم." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-primary-deep"><UsersRound className="ml-2 inline size-5 text-gold" />أنواع المقيمين</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {raters.map((r) => <li key={r} className="flex gap-2"><span className="text-gold">•</span>{r}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">مقياس الإجابة</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
            {scale.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold text-primary-deep">نموذج سؤال سلوكي</h2>
          <p className="mt-3 leading-8 text-muted-foreground">«يبادر إلى إنجاز الأعمال النافعة دون انتظار أن يُطلب منه ذلك.»</p>
        </section>
        </div>
      </section>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["قبل التدريب", "القياس القبلي"], ["بعد التدريب", "القياس البعدي"], ["بعد شهر", "قياس الاستدامة"]].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-secondary/70 p-6 text-center">
            <h3 className="font-display font-bold text-primary-deep">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 rounded-2xl border border-gold bg-gold-soft p-6 leading-8 text-accent-foreground">
        Q360 ليس درجة دينية ولا حكمًا على الشخص، وإنما أداة لقياس التغير السلوكي والأثر التدريبي.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/q360/assess/$bagSlug"
          params={{ bagSlug: "fastabiqu-alkhayrat" }}
          className="rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground"
        >
          ابدأ تقييم Q360 التجريبي
        </Link>
        <Link to="/store" className="rounded-xl border border-border px-8 py-3 font-medium text-primary-deep">
          اشترِ خدمة Q360
        </Link>
      </div>

    </div>
  );
}
