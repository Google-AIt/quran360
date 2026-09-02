import quranWalks from "@/assets/blog/quran-walks.jpg";
import saadiDirection from "@/assets/blog/saadi-direction.jpg";
import quranRules from "@/assets/blog/quran-rules.jpg";
import quranReflection from "@/assets/blog/quran-reflection.jpg";

export const officialBlogSources: Record<
  string,
  { image: string; sourceUrl: string; sourceLabel: string }
> = {
  "quran-walks": {
    image: quranWalks,
    sourceUrl: "https://quranstepbystep.com/%d9%82%d8%b1%d8%a2%d9%86%d8%a7-%d9%8a%d9%85%d8%b4%d9%8a/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "saadi-direction": {
    image: saadiDirection,
    sourceUrl:
      "https://quranstepbystep.com/%d8%aa%d9%81%d8%b3%d9%8a%d8%b1-%d8%a7%d9%84%d8%b3%d8%b9%d8%af%d9%8a-%d9%84%d8%a2%d9%8a%d8%a9-%d9%88%d9%84%d9%83%d9%84-%d9%88%d8%ac%d9%87%d8%a9-%d9%87%d9%88-%d9%85%d9%88%d9%84%d9%8a%d9%87%d8%a7/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "quran-rules": {
    image: quranRules,
    sourceUrl: "https://quranstepbystep.com/%d9%82%d9%88%d8%a7%d8%b9%d8%af-%d9%81%d9%87%d9%85-%d8%a7%d9%84%d9%82%d8%b1%d8%a2%d9%86-%d8%a7%d9%84%d9%83%d8%b1%d9%8a%d9%85/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "quran-reflection": {
    image: quranReflection,
    sourceUrl: "https://quranstepbystep.com/%d8%aa%d8%af%d8%a8%d8%b1-%d8%a7%d9%84%d9%82%d8%b1%d8%a2%d9%86-%d8%a7%d9%84%d9%83%d8%b1%d9%8a%d9%85/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
};

export function officialBlogSource(slug: string) {
  return officialBlogSources[slug];
}
