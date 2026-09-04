import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header dir="rtl" className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">

        {/* أقصى اليمين: زر القائمة منفرداً */}
        <button
          aria-label="القائمة"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="order-1 inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/80 hover:bg-secondary"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <div className="order-2 flex shrink-0 items-center gap-2 border-e border-border/70 pe-3">
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

        <nav className="order-3 hidden min-w-0 flex-1 items-center justify-start gap-1 xl:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary-deep" }}
              className="rounded-lg px-3 py-2 text-sm whitespace-nowrap text-foreground/80 transition-colors hover:bg-secondary hover:text-primary-deep"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* أقصى اليسار: الشعار */}
        <Link
          to="/"
          className="order-4 ms-auto flex shrink-0 items-center gap-3 xl:ms-0"
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
      </div>
      </header>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav
            dir="rtl"
            className="fixed inset-y-0 right-0 z-[70] flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-s border-border bg-card px-4 py-4 text-right shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-deep">القائمة</span>
              <button
                aria-label="إغلاق القائمة"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border"
              >
                <X className="size-5" />
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-right text-sm text-foreground/85 hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-right text-sm text-foreground/85 hover:bg-secondary"
            >
              سلة المشتريات
            </Link>
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              حسابي
            </Link>
          </nav>
        </>
      )}
    </>
  );
}


