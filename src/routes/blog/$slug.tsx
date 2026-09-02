import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPost } from "@/lib/public.functions";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "المقال غير متاح" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.seo_title ?? loaderData.title;
    const d = loaderData.seo_description ?? loaderData.excerpt ?? "";
    return {
      meta: [
        { title: `${t} | القرآن خطوة بخطوة` },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
      ],
    };
  },
  errorComponent: () => <div className="p-16 text-center">تعذّر تحميل المقال.</div>,
  notFoundComponent: () => <div className="p-16 text-center">المقال غير موجود.</div>,
  component: Page,
});

function Page() {
  const post = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{post.category}</span>
      <h1 className="mt-4 font-display text-3xl font-bold text-primary-deep">{post.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{post.author}</p>
      <p className="mt-8 whitespace-pre-line text-lg leading-9 text-foreground/85">{post.content}</p>
    </article>
  );
}
