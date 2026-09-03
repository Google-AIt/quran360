/** فئات المقيمين في Q360 — مشتركة بين الواجهة والخادم. */
export const RELATIONS = [
  { key: "self", label: "أنا / التقييم الذاتي", group: "self" },
  { key: "father", label: "الأب", group: "family" },
  { key: "mother", label: "الأم", group: "family" },
  { key: "sibling", label: "الأخ / الأخت", group: "family" },
  { key: "teacher", label: "المعلم", group: "education" },
  { key: "manager", label: "المدير المباشر", group: "work" },
  { key: "colleague", label: "الزميل", group: "work" },
  { key: "subordinate", label: "المرؤوس", group: "work" },
  { key: "team", label: "عضو فريق", group: "work" },
  { key: "leader", label: "قائد / مشرف", group: "work" },
  { key: "friend", label: "الصديق", group: "social" },
  { key: "partner", label: "شريك", group: "social" },
  { key: "beneficiary", label: "مستفيد / عميل", group: "social" },
  { key: "other", label: "آخر", group: "other" },
] as const;

export const RELATION_KEYS = RELATIONS.map((r) => r.key) as readonly string[];

export function relationLabel(key: string) {
  return RELATIONS.find((r) => r.key === key)?.label ?? key;
}

export const GROUP_LABELS: Record<string, string> = {
  self: "التقييم الذاتي",
  family: "الأسرة",
  education: "المعلمون",
  work: "بيئة العمل / الفريق",
  social: "الأصدقاء والمحيط",
  other: "أخرى",
};

export function relationGroup(key: string) {
  return RELATIONS.find((r) => r.key === key)?.group ?? "other";
}

export const SCALE = [
  { value: 1, label: "أبداً" },
  { value: 2, label: "نادراً" },
  { value: 3, label: "أحياناً" },
  { value: 4, label: "غالباً" },
  { value: 5, label: "دائماً" },
] as const;

export const PHASE_LABEL: Record<string, string> = {
  pre: "القياس القبلي",
  post: "القياس البعدي",
  followup: "قياس المتابعة",
};
