import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, ExternalLink } from "lucide-react";
import { getPost } from "@/lib/public.functions";
import { officialBlogSource } from "@/lib/blog-images";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "المقال غير متاح | القرآن خطوة بخطوة" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const t = loaderData.seo_title ?? loaderData.title;
    const d = loaderData.seo_description ?? loaderData.excerpt ?? "";
    const source = officialBlogSource(loaderData.slug);
    return {
      meta: [
        { title: `${t} | القرآن خطوة بخطوة` },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(source?.imageUrl
          ? [
              { property: "og:image", content: source.imageUrl },
              { name: "twitter:image", content: source.imageUrl },
            ]
          : []),
      ],
    };
  },
  errorComponent: () => <div className="p-16 text-center">تعذّر تحميل المقال.</div>,
  notFoundComponent: () => <div className="p-16 text-center">المقال غير موجود.</div>,
  component: Page,
});

function Page() {
  const post = Route.useLoaderData();
  const source = officialBlogSource(post.slug);
  return (
    <article className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Link to="/blog" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
          <ArrowRight className="size-4" />
          المدونة
        </Link>
        <span aria-hidden>·</span>
        <span>{post.category}</span>
      </div>

      <header className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {source ? (
          <div className="relative aspect-[16/7] overflow-hidden bg-secondary">
            <img src={source.image} alt={post.title} className="h-full w-full object-cover" />
            {source.sourceLabel ? (
              <span className="absolute right-5 top-5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                {source.sourceLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="p-6 md:p-10">
          <h1 className="font-display text-3xl font-bold leading-tight text-primary-deep md:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{post.author}</span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" />
              {new Intl.DateTimeFormat("ar-EG", { dateStyle: "long" }).format(new Date(post.published_at))}
            </span>
          </div>
          {post.excerpt ? <p className="mt-6 text-lg leading-9 text-muted-foreground">{post.excerpt}</p> : null}
        </div>
      </header>

      <div className="mt-10 whitespace-pre-line text-lg leading-[2.2] text-foreground/90">{post.content}</div>

      {source ? (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">نُقل هذا المقال من أرشيف الموقع الرسمي للقرآن خطوة بخطوة.</p>
          <Button asChild variant="outline">
            <a href={source.sourceUrl} target="_blank" rel="noreferrer">
              المصدر الرسمي <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      ) : null}
    </article>
  );
}
