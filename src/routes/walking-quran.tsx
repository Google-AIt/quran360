import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/site/PageHero";
import { getStories } from "@/lib/public.functions";

const q = queryOptions({ queryKey: ["stories"], queryFn: () => getStories() });

export const Route = createFileRoute("/walking-quran")({
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  head: () => ({
    meta: [
      { title: "قرآنًا يمشي على الأرض | قصص وتحولات" },
      { name: "description", content: "قصص المتدربين وتجارب المدارس والميسّرين والتحولات السلوكية والمبادرات." },
      { property: "og:title", content: "قرآنًا يمشي على الأرض" },
      { property: "og:description", content: "أن يتحول القرآن من نص يُقرأ إلى منهج يُعاش." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: stories } = useSuspenseQuery(q);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <PageHero eyebrow="قصص الأثر" title="قرآنًا يمشي على الأرض" description="أن يتحول القرآن من نص يُقرأ إلى منهج يُعاش، حتى يكون قرآنًا يمشي على الأرض.">
        <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-4 text-sm leading-7 text-primary-foreground/80">كل قصة هنا تروي انتقالًا من الفهم إلى ممارسة يمكن رؤيتها وقياس أثرها.</div>
      </PageHero>
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {stories.map((s) => (
          <article key={s.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-primary-deep">{s.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.story}</p>
            <p className="mt-4 text-xs text-muted-foreground">{s.person_name} — {s.person_role} · {s.bag_title}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
