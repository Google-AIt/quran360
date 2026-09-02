import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpenText, CalendarDays } from "lucide-react";
import { getPosts } from "@/lib/public.functions";
import { officialBlogSource } from "@/lib/blog-images";
import { PageHero, SectionTitle } from "@/components/site/PageHero";

const q = queryOptions({ queryKey: ["posts"], queryFn: () => getPosts() });

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "المدونة | مقالات التربية القرآنية والتطبيق" },
      {
        name: "description",
        content: "مقالات في التربية القرآنية، التصورات الذهنية، الخطوات العملية، والسلوك القرآني.",
      },
      { property: "og:title", content: "مدونة القرآن خطوة بخطوة" },
      { property: "og:description", content: "مقالات وتجارب ودراسات في تطبيق القرآن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: posts } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero
        eyebrow="من أرشيف القرآن خطوة بخطوة"
        title="المدونة"
        description="مقالات مختارة تربط تدبّر القرآن بفهم أعمق وخطوة عملية قابلة للعيش، من أرشيف الموقع الرسمي إلى مساحة معرفية واحدة."
      />
      <div className="mt-16">
        <SectionTitle
          title="مقالات مختارة"
          subtitle="اقرأ، تأمل، ثم اختر خطوة صغيرة قابلة للتنفيذ."
        />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((p) => {
          const source = officialBlogSource(p.slug);
          return (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              {source ? (
                <div className="relative aspect-[16/8] overflow-hidden bg-secondary">
                  <img
                    src={source.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                    {source.sourceLabel}
                  </span>
                </div>
              ) : null}
              <div className="p-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  <BookOpenText className="size-3" />
                  {p.category}
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-primary-deep">{p.title}</h2>
                <p className="mt-2 text-sm leading-8 text-muted-foreground">{p.excerpt}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {new Intl.DateTimeFormat("ar-EG", { dateStyle: "long" }).format(new Date(p.published_at))}
                  </span>
                  <span>{p.author}</span>
                  <span className="mr-auto inline-flex items-center gap-1">
                    اقرأ المقال
                    <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
