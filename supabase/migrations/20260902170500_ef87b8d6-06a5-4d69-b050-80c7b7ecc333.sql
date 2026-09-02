INSERT INTO public.quran_bags (slug, title, verse, verse_reference, concept, mental_image, principle, outcome, summary, sort_order, evidences, activities, applications, challenges, assessment) VALUES
('wahadayn-alnajdayn','وهديناه النجدين','﴿وَهَدَيْنَاهُ النَّجْدَيْنِ﴾','البلد: 10','الاختيار بين الطريقين','طريقان واضحان أمام الإنسان، يختار بينهما بوعي ومسؤولية.','الإنسان مهدى إلى طريق الخير والشر، ومسؤول عن اختياره وما يترتب عليه.','وعي بالاختيار واتخاذ قرار أقرب إلى الهدى','حقيبة تدريبية تساعد على فهم معنى الهداية والاختيار، وتحويله إلى قرارات واعية وخطوات عملية في الحياة.',10,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb),
('kull-nafs-bima-kasabat-raheena','كل نفس بما كسبت رهينة','﴿كُلُّ نَفْسٍ بِمَا كَسَبَتْ رَهِينَةٌ﴾','المدثر: 38','المسؤولية الشخصية','كل إنسان يحمل نتيجة كسبه، وتتحول اختياراته اليومية إلى أثر يلازمه.','لا يُنسب أثر العمل إلا إلى صاحبه، والمسؤولية تبدأ من القرار الشخصي.','تحمل المسؤولية عن الاختيارات والأعمال','حقيبة تدريبية تربط بين الكسب اليومي والنتيجة، وتدرّب على الانتقال من الأعذار إلى المسؤولية والفعل.',11,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb),
('thumma-atba-sababan','ثم أتبع سببا','﴿ثُمَّ أَتْبَعَ سَبَبًا﴾','الكهف: 85','الأخذ بالأسباب','غاية واضحة يتبعها سبب مناسب، ثم متابعة عملية حتى بلوغ المقصود.','النتائج تحتاج إلى أسباب معروفة وخطوات متتابعة، لا إلى التمني وحده.','تحويل المقصد إلى خطة وأسباب قابلة للتنفيذ','حقيبة تدريبية تساعد على تحديد المقصد، واختيار الأسباب المناسبة، ومتابعة الخطوات حتى تتحول النية إلى إنجاز.',12,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  verse = EXCLUDED.verse,
  verse_reference = EXCLUDED.verse_reference,
  concept = EXCLUDED.concept,
  mental_image = EXCLUDED.mental_image,
  principle = EXCLUDED.principle,
  outcome = EXCLUDED.outcome,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();