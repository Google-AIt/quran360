import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import h1 from "@/assets/hero/hero-1.jpg.asset.json";
import h2 from "@/assets/hero/hero-2.jpg.asset.json";
import h3 from "@/assets/hero/hero-3.jpg.asset.json";

type Slide = {
  image: string;
  alt: string;
  badge: string;
  title: string;
  text: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
};

const slides: Slide[] = [
  {
    image: h1.url,
    alt: "مصحف مفتوح على حامل خشبي في إضاءة ذهبية",
    badge: "منظومة متكاملة للتدريب على تطبيق القرآن",
    title: "القرآن خطوة بخطوة",
    text: "تعلّم وتدرّب خطوة بخطوة على تطبيق القرآن، لتكون قرآنًا يمشي على الأرض.",
    primary: { label: "ابدأ التدريب", to: "/academy" },
    secondary: { label: "استكشف الحقائب", to: "/bags" },
  },
  {
    image: h2.url,
    alt: "جلسة تدريبية قرآنية داخل قاعة بطراز إسلامي",
    badge: "حقائب قرآنية تطبيقية",
    title: "من الآية إلى سلوك يُقاس",
    text: "حقائب مبنية على المنهجية التطبيقية: فهم الآية، تصور المهارة، خطوات عملية، ثم قياس الأثر.",
    primary: { label: "الحقائب القرآنية", to: "/bags" },
    secondary: { label: "المنهجية", to: "/methodology" },
  },
  {
    image: h3.url,
    alt: "زخرفة نجمة إسلامية ذهبية مضيئة",
    badge: "Q360 لقياس الأثر",
    title: "قياس أثر القرآن في السلوك",
    text: "أداة تقييم شاملة تُظهر انتقال المعرفة القرآنية إلى تغيّر حقيقي في السلوك.",
    primary: { label: "تعرّف على Q360", to: "/q360" },
    secondary: { label: "زيارة المتجر", to: "/store" },
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-primary-deep text-primary-foreground">
      {slides.map((slide, i) => (
        <img
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          width={1920}
          height={1088}
          {...(i === 0 ? {} : { loading: "lazy" as const })}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-l from-primary-deep/95 via-primary-deep/80 to-primary-deep/40" />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 md:min-h-[640px] md:py-28">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={`max-w-2xl transition-all duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none absolute opacity-0 translate-y-3"
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs backdrop-blur">
              <Sparkles className="size-3.5 text-gold" />
              {slide.badge}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.25] md:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-5 text-lg leading-9 text-primary-foreground/85">{slide.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={slide.primary.to}
                className="inline-flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 font-medium text-accent-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                {slide.primary.label} <ArrowLeft className="size-4" />
              </Link>
              <Link
                to={slide.secondary.to}
                className="inline-flex items-center gap-2 rounded-2xl border border-primary-foreground/35 px-6 py-3 font-medium backdrop-blur hover:bg-primary-foreground/10"
              >
                {slide.secondary.label}
              </Link>
            </div>
          </div>
        ))}

        <div className="relative mt-12 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`الشريحة ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-10 bg-gold" : "w-4 bg-primary-foreground/35 hover:bg-primary-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
