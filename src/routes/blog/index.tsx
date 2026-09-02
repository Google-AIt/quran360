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
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-primary-deep">المدونة</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="rounded-2xl border border-border bg-card p-6 hover:shadow-soft">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{p.category}</span>
            <h2 className="mt-3 font-display text-lg font-bold text-primary-deep">{p.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{p.excerpt}</p>
            <p className="mt-3 text-xs text-muted-foreground">{p.author}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
