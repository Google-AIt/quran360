import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getBag } from "@/lib/public.functions";
import { bagImage } from "@/lib/bag-images";
import { lessonPoster, lessonStage } from "@/lib/lesson-media";
import { BagObjectives } from "@/components/site/BagObjectives";
import { contentForBag } from "@/lib/bag-content";
import { objectivesForBag } from "@/lib/bag-objectives";

export const Route = createFileRoute("/bags/$slug")({
  loader: async ({ params }) => {
    const data = await getBag({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "الحقيبة غير متاحة" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.bag.title} | حقيبة قرآنية`;
    const d = loaderData.bag.summary ?? "حقيبة قرآنية تدريبية مبنية على المنهجية التطبيقية.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  errorComponent: () => <div className="p-16 text-center">تعذّر تحميل الحقيبة.</div>,
  notFoundComponent: () => <div className="p-16 text-center">الحقيبة غير موجودة.</div>,
  component: Page,
});

function List({ title, items }: { title: string; items: unknown }) {
  const arr = Array.isArray(items) ? (items as string[]) : [];
  if (!arr.length) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold text-primary-deep">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
        {arr.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-gold">•</span>
            {x}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Page() {
  const { bag, steps, course, lessons, questions } = Route.useLoaderData();
  const content = contentForBag(bag.slug);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        <div className="rounded-3xl bg-hero p-8 text-primary-foreground shadow-soft md:p-12">
          <p className="text-sm font-medium text-gold">حقيبة قرآنية تطبيقية</p>
          <p className="ayah mt-4 text-2xl text-gold">{bag.verse}</p>
          <p className="mt-1 text-sm text-primary-foreground/70">{bag.verse_reference}</p>
          <h1 className="mt-5 font-display text-4xl font-bold">{bag.title}</h1>
          {bag.summary && (
            <p className="mt-4 max-w-3xl leading-9 text-primary-foreground/85">{bag.summary}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-primary-foreground/80">
            <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
              منهجية عملية
            </span>
            <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
              دروس وتطبيقات
            </span>
            <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
              قياس أثر Q360
            </span>
          </div>
        </div>
        {bagImage(bag.slug) && (
          <img
            src={bagImage(bag.slug)}
            alt={`غلاف حقيبة ${bag.title}`}
            width={1200}
            height={900}
            className="h-full min-h-72 w-full rounded-3xl border border-border object-cover shadow-sm"
          />
        )}
      </div>

      <BagObjectives className="mt-10" />

      {content && (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">وصف تدريبي مساعد</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-primary-deep">
                محتوى حقيبة {bag.title}
              </h2>
              <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
                {content.description}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              {content.focus}
            </span>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {content.packageItems.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-2xl border border-border bg-background p-4 text-sm leading-7 text-foreground/80"
              >
                <span aria-hidden className="text-primary">
                  ✦
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ["المفهوم / التصور الذهني", bag.mental_image ?? bag.concept],
          ["المبدأ أو القانون", bag.principle],
          ["النتيجة", bag.outcome],
        ].map(([t, v]) =>
          v ? (
            <div key={t} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-sm font-bold text-muted-foreground">{t}</h2>
              <p className="mt-2 leading-8 text-primary-deep">{v}</p>
            </div>
          ) : null,
        )}
      </div>

      {lessons.length > 0 && (
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">مسار التعلّم</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-primary-deep">
                دروس الحقيبة
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                شاهد، طبّق، ثم انتقل إلى الخطوة التالية.
              </p>
            </div>
            <span className="rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              {lessons.length} دروس تطبيقية
            </span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {lessons.map((lesson) => {
              const stage = lessonStage(lesson.lesson_number);
              return (
                <article
                  key={lesson.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <div className="relative">
                    <img
                      src={lessonPoster(lesson.lesson_number)}
                      alt={`صورة درس ${lesson.lesson_number}: ${lesson.title}`}
                      loading="lazy"
                      width={1024}
                      height={576}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                      الدرس {lesson.lesson_number}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-primary-deep">
                        {lesson.title}
                      </h3>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.duration_minutes} دقيقة
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-primary">{stage.label}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {lesson.description ?? stage.caption}
                    </p>
                    <Link
                      to={course ? "/courses/$slug" : "/store"}
                      {...(course ? { params: { slug: course.slug } } : {})}
                      className="mt-4 inline-block text-sm font-medium text-primary"
                    >
                      {lesson.video_url ? "شاهد الفيديو ←" : "عرض الدرس ←"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-primary-deep">الخطوات العملية</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            حوّل المعنى إلى ممارسات صغيرة واضحة قابلة للمتابعة.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {steps.map((s) => (
              <div key={s.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-primary-foreground">
                  {s.step_number}
                </div>
                <div>
                  <h3 className="font-display font-bold text-primary-deep">{s.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <List title="الأدلة القرآنية والنبوية" items={bag.evidences} />
        <List title="الأنشطة" items={bag.activities} />
        <List title="التطبيقات" items={bag.applications} />
        <List title="التحديات" items={bag.challenges} />
        <List title="التقييم" items={bag.assessment} />
        {questions.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold text-primary-deep">
              مؤشرات Q360 السلوكية
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
              {questions.map((qq) => (
                <li key={qq.id} className="flex gap-2">
                  <span className="text-gold">•</span>
                  {qq.text}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link to="/q360" className="text-sm font-medium text-primary">
                تفاصيل Q360
              </Link>
              <Link
                to="/q360/assess/$bagSlug"
                params={{ bagSlug: bag.slug }}
                className="text-sm font-medium text-primary"
              >
                ابدأ تقييم الأثر ←
              </Link>
            </div>
          </section>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {course && (
          <Link
            to="/courses/$slug"
            params={{ slug: course.slug }}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            الدورة المرتبطة: {course.title} — {course.price} ريال
          </Link>
        )}
        <Link
          to="/store"
          className="rounded-xl border border-border px-6 py-3 font-medium text-primary-deep"
        >
          شراء من المتجر
        </Link>
      </div>
    </div>
  );
}
