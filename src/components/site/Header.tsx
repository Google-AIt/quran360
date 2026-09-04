import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, UserRound, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import logoDark from "@/assets/logo/quran-step-logo-dark.png";

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

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <header dir="rtl" className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div dir="ltr" className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3">

        {/* أقصى اليسار: الشعار */}
        <Link
          to="/"
          className="flex shrink-0 items-center"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoDark}
            alt="القرآن خطوة بخطوة"
            width={188}
            height={49}
            className="h-auto w-28 object-contain sm:w-40 xl:w-48"
          />
          <span className="sr-only">القرآن خطوة بخطوة</span>
        </Link>

        <nav dir="rtl" className="hidden min-w-0 flex-1 items-center justify-center gap-1 2xl:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary-deep" }}
              className="rounded-lg px-2.5 py-2 text-sm whitespace-nowrap text-foreground/80 transition-colors hover:bg-secondary hover:text-primary-deep"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1 2xl:hidden" />

        <div dir="rtl" className="flex shrink-0 items-center gap-2 border-s border-border/70 ps-2 sm:ps-3">
          <Link
            to="/cart"
            aria-label="سلة المشتريات"
            className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground/80 hover:bg-secondary"
          >
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -end-1.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/account"
            aria-label="حسابي"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:px-4"
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline">حسابي</span>
          </Link>
        </div>

        {/* أقصى اليمين: زر القائمة منفرداً */}
        <button
          type="button"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
          aria-controls="site-navigation-menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/80 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-[65px] z-[-1] bg-foreground/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            id="site-navigation-menu"
            dir="rtl"
            aria-label="التنقل الرئيسي"
            className="absolute inset-x-0 top-full z-10 border-b border-border bg-card text-right shadow-xl"
          >
            <div className="mx-auto grid max-h-[calc(100vh-65px)] max-w-7xl grid-cols-1 gap-1 overflow-y-auto px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "bg-secondary text-primary-deep" }}
                  className="rounded-lg px-4 py-3 text-right text-sm font-medium text-foreground/85 transition-colors hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
      </header>
    </>
  );
}


