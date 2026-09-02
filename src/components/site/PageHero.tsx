import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** محتوى إضافي أسفل الوصف (أزرار، مؤشرات...) */
  actions?: ReactNode;
};

/** ترويسة موحّدة للصفحات الداخلية بهوية إسلامية راقية. */
export function PageHero({ eyebrow, title, description, children, actions }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-hero px-6 py-14 text-primary-foreground shadow-soft md:px-12 md:py-20">
      <div className="relative max-w-3xl">
        {eyebrow && (
          <span className="inline-flex rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 text-base leading-9 text-primary-foreground/85 md:text-lg">{description}</p>
        )}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children && <div className="relative mt-10">{children}</div>}
    </section>
  );
}

/** عنوان قسم موحّد داخل الصفحات. */
export function SectionTitle({
  title,
  subtitle,
  align = "start",
}: {
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <span aria-hidden className={`mb-3 block h-1 w-12 rounded-full bg-gold ${align === "center" ? "mx-auto" : ""}`} />
      <h2 className="font-display text-2xl font-bold text-primary-deep md:text-3xl">{title}</h2>
      {subtitle && (
        <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground md:text-base">{subtitle}</p>
      )}
    </div>
  );
}

/** بطاقة إحصائية صغيرة. */
export function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-4 text-center backdrop-blur-sm">
      <div className="font-display text-xl font-bold md:text-2xl">{value}</div>
      <div className="mt-1 text-xs text-primary-foreground/75">{label}</div>
    </div>
  );
}
