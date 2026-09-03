import { bagImage } from "@/lib/bag-images";
import courseSingle from "@/assets/products/course-single.jpg.asset.json";
import traineeMembership from "@/assets/products/trainee-membership.jpg.asset.json";
import facilitatorMembership from "@/assets/products/facilitator-membership.jpg.asset.json";
import facilitatorQualification from "@/assets/products/facilitator-qualification.jpg.asset.json";
import facilitatorBag from "@/assets/products/facilitator-bag.jpg.asset.json";
import q360 from "@/assets/products/q360.jpg.asset.json";
import schoolStudent from "@/assets/products/school-student.jpg.asset.json";
import schoolTeacher from "@/assets/products/school-teacher.jpg.asset.json";

export const productImages: Record<string, string> = {
  "course-single": courseSingle.url,
  "trainee-membership": traineeMembership.url,
  "facilitator-membership": facilitatorMembership.url,
  "facilitator-qualification": facilitatorQualification.url,
  "facilitator-bag": facilitatorBag.url,
  q360: q360.url,
  "school-student": schoolStudent.url,
  "school-teacher": schoolTeacher.url,
};

export function productImage(slug: string): string | undefined {
  if (productImages[slug]) return productImages[slug];
  if (slug.startsWith("bag-")) return bagImage(slug.slice(4));
  return undefined;
}
