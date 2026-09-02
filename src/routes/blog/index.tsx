import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpenText } from "lucide-react";
import { getPosts } from "@/lib/public.functions";
import { PageHero, SectionTitle } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["posts"], queryFn: () => getPosts() });

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المدونة | مقالات التربية القرآنية والتطبيق" },
      { name: "description", content: "مقالات في التربية القرآنية، التصورات الذهنية، الخطوات العملية، والسلوك القرآني." },
      { property: "og:title", content: "مدونة القرآن خطوة بخطوة" },
      { property: "og:description", content: "مقالات وتجارب ودراسات في تطبيق القرآن." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: posts } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero eyebrow="معرفة تُطبّق" title="مدونة القرآن خطوة بخطوة" description="أفكار وتجارب وأدوات تساعدك على تحويل المعنى القرآني إلى سلوك يومي." />
      <div className="mt-16"><SectionTitle title="أحدث المقالات" subtitle="اقرأ، تأمل، ثم اختر خطوة صغيرة قابلة للتنفيذ." /></div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"><BookOpenText className="size-3" />{p.category}</span>
            <h2 className="mt-4 font-display text-lg font-bold text-primary-deep">{p.title}</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">{p.excerpt}</p><p className="mt-4 text-xs text-muted-foreground">{p.author} <ArrowLeft className="mr-1 inline size-3 transition-transform group-hover:-translate-x-1" /></p>
          </Link>
        ))}
      </div>
    </div>
  );
}
