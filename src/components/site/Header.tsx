import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserRound } from "lucide-react";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/methodology", label: "المنهجية التطبيقية" },
  { to: "/bags", label: "الحقائب القرآنية" },
  { to: "/academy", label: "الأكاديمية" },
  { to: "/facilitators", label: "الميسّرون" },
  { to: "/schools", label: "المدارس" },
  { to: "/store", label: "المتجر" },
  { to: "/blog", label: "المدونة" },
  { to: "/impact", label: "الأثر" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-hero text-primary-foreground font-display text-lg">
            ق
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-primary-deep">القرآن خطوة بخطوة</span>
            <span className="block text-[11px] text-muted-foreground">منظومة التدريب على تطبيق القرآن</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary-deep" }}
              className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-primary-deep"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/account"
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            <UserRound className="size-4" />
            حسابي
          </Link>
          <button
            aria-label="القائمة"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-border bg-card px-4 py-3 xl:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-foreground/85 hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            حسابي
          </Link>
        </nav>
      )}
    </header>
  );
}
