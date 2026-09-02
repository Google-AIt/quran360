import quranWalks from "@/assets/blog/quran-walks.jpg";
import saadiDirection from "@/assets/blog/saadi-direction.jpg";
import quranRules from "@/assets/blog/quran-rules.jpg";
import quranReflection from "@/assets/blog/quran-reflection.jpg";

type OfficialBlogSource = {
  image: string;
  imageUrl: string;
  sourceUrl: string;
  sourceLabel: string;
};

export const officialBlogSources: Record<string, OfficialBlogSource> = {
  "quran-walks": {
    image: quranWalks,
    imageUrl: "https://quranstepbystep.com/wp-content/uploads/2023/12/30d52aac-eda4-49e5-9a8d-2e6f2a34db43.jpg",
    sourceUrl: "https://quranstepbystep.com/%d9%82%d8%b1%d8%a2%d9%86%d8%a7-%d9%8a%d9%85%d8%b4%d9%8a/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "saadi-direction": {
    image: saadiDirection,
    imageUrl: "https://quranstepbystep.com/wp-content/uploads/2020/08/9772a491-3084-4b82-b89c-eac2f04259f3.jpg",
    sourceUrl:
      "https://quranstepbystep.com/%d8%aa%d9%81%d8%b3%d9%8a%d8%b1-%d8%a7%d9%84%d8%b3%d8%b9%d8%af%d9%8a-%d9%84%d8%a2%d9%8a%d8%a9-%d9%88%d9%84%d9%83%d9%84-%d9%88%d8%ac%d9%87%d8%a9-%d9%87%d9%88-%d9%85%d9%88%d9%84%d9%8a%d9%87%d8%a7/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "quran-rules": {
    image: quranRules,
    imageUrl: "https://quranstepbystep.com/wp-content/uploads/2020/08/bbdcb700-4bbe-497d-9a51-366bd28685e4.jpg",
    sourceUrl: "https://quranstepbystep.com/%d9%82%d9%88%d8%a7%d8%b9%d8%af-%d9%81%d9%87%d9%85-%d8%a7%d9%84%d9%82%d8%b1%d8%a2%d9%86-%d8%a7%d9%84%d9%83%d8%b1%d9%8a%d9%85/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
  "quran-reflection": {
    image: quranReflection,
    imageUrl: "https://quranstepbystep.com/wp-content/uploads/2020/08/%D8%AA%D8%AF%D8%A8%D8%B1-%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85.jpg",
    sourceUrl: "https://quranstepbystep.com/%d8%aa%d8%af%d8%a8%d8%b1-%d8%a7%d9%84%d9%82%d8%b1%d8%a2%d9%86-%d8%a7%d9%84%d9%83%d8%b1%d9%8a%d9%85/",
    sourceLabel: "منقول من الموقع الرسمي",
  },
};

export function officialBlogSource(slug: string) {
  return officialBlogSources[slug];
}
