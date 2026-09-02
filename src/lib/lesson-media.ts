import l1 from "@/assets/lessons/lesson-1.jpg.asset.json";
import l2 from "@/assets/lessons/lesson-2.jpg.asset.json";
import l3 from "@/assets/lessons/lesson-3.jpg.asset.json";
import l4 from "@/assets/lessons/lesson-4.jpg.asset.json";
import l5 from "@/assets/lessons/lesson-5.jpg.asset.json";

const posters = [l1.url, l2.url, l3.url, l4.url, l5.url];

export type LessonStage = { label: string; caption: string };

/** مراحل المنهجية التطبيقية بترتيب دروس الحقيبة. */
export const lessonStages: LessonStage[] = [
  {
    label: "الإضاءة القرآنية",
    caption: "فيديو يشرح الآية ومعناها ويصحّح المفهوم قبل أي تطبيق.",
  },
  {
    label: "التصور الذهني",
    caption: "فيديو يبني الصورة الذهنية للمهارة كما رسمتها الآية.",
  },
  {
    label: "الخطوات العملية",
    caption: "فيديو يحوّل المفهوم إلى خطوات محددة قابلة للتنفيذ.",
  },
  {
    label: "التطبيق والتحدي",
    caption: "فيديو يرافق التدريب العملي والتحدي اليومي للخطوة.",
  },
  {
    label: "قياس الأثر",
    caption: "فيديو يشرح كيف تقيس تغيّر سلوكك بعد التطبيق عبر Q360.",
  },
];

export function lessonPoster(lessonNumber: number): string {
  const poster = posters[(Math.max(1, lessonNumber) - 1) % posters.length];
  return poster ?? posters[0] ?? l1.url;
}

export function lessonStage(lessonNumber: number): LessonStage {
  const stage = lessonStages[(Math.max(1, lessonNumber) - 1) % lessonStages.length];
  return stage ?? lessonStages[0] ?? { label: "التطبيق القرآني", caption: "فيديو تطبيقي يحوّل الآية إلى سلوك." };
}
