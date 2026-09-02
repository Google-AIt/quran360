import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-xl font-bold">القرآن خطوة بخطوة</h3>
          <p className="mt-3 max-w-md text-sm leading-7 text-primary-foreground/75">
            تعلّم وتدرّب خطوة بخطوة على تطبيق القرآن، لتكون قرآنًا يمشي على الأرض. منظومة متكاملة للتدريب على
            تطبيق القرآن وبناء السلوك القرآني وقياس أثره.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-gold">المنصة</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/methodology">المنهجية التطبيقية</Link></li>
            <li><Link to="/bags">الحقائب القرآنية</Link></li>
            <li><Link to="/academy">الأكاديمية</Link></li>
            <li><Link to="/facilitators">الميسّرون</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-gold">روابط</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/schools">المدارس</Link></li>
            <li><Link to="/q360">Q360 قياس الأثر</Link></li>
            <li><Link to="/store">المتجر</Link></li>
            <li><Link to="/walking-quran">قرآنًا يمشي على الأرض</Link></li>
            <li><Link to="/contact">تواصل معنا</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} القرآن خطوة بخطوة — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
