REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "bags public read" ON public.quran_bags;
CREATE POLICY "bags anon read" ON public.quran_bags FOR SELECT TO anon USING (is_published);
CREATE POLICY "bags auth read" ON public.quran_bags FOR SELECT TO authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));

DROP POLICY "courses public read" ON public.courses;
CREATE POLICY "courses anon read" ON public.courses FOR SELECT TO anon USING (is_published);
CREATE POLICY "courses auth read" ON public.courses FOR SELECT TO authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));

DROP POLICY "products public read" ON public.products;
CREATE POLICY "products anon read" ON public.products FOR SELECT TO anon USING (is_active);
CREATE POLICY "products auth read" ON public.products FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY "posts public read" ON public.blog_posts;
CREATE POLICY "posts anon read" ON public.blog_posts FOR SELECT TO anon USING (is_published);
CREATE POLICY "posts auth read" ON public.blog_posts FOR SELECT TO authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));

DROP POLICY "stories public read" ON public.impact_stories;
CREATE POLICY "stories anon read" ON public.impact_stories FOR SELECT TO anon USING (is_published);
CREATE POLICY "stories auth read" ON public.impact_stories FOR SELECT TO authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));