import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UserRound, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import logoAsset from "@/assets/logo/quran-step-logo.png.asset.json";

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
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logoAsset.url}
            alt="القرآن خطوة بخطوة"
            width={188}
            height={49}
            className="h-auto w-40 object-contain sm:w-48"
          />
          <span className="sr-only">القرآن خطوة بخطوة</span>
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
            to="/cart"
            aria-label="سلة المشتريات"
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground/80 hover:bg-secondary"
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -left-1.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
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
