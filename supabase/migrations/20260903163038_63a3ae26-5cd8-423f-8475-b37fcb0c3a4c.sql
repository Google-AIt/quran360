CREATE OR REPLACE FUNCTION public.has_course_access(_user uuid, _course uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select coalesce(
    public.has_role(_user, 'admin')
    or exists (
      select 1
      from public.orders o
      cross join lateral jsonb_array_elements(o.items) it
      join public.products p on p.id = nullif(it->>'product_id','')::uuid
      where o.user_id = _user
        and o.status in ('paid','completed')
        and p.category in ('course','membership','facilitator','school')
    )
    or exists (
      select 1
      from public.orders o
      cross join lateral jsonb_array_elements(o.items) it
      join public.products p on p.id = nullif(it->>'product_id','')::uuid
      join public.courses c on c.id = _course
      join public.quran_bags b on b.id = c.bag_id
      where o.user_id = _user
        and o.status in ('paid','completed')
        and p.category = 'bag'
        and p.slug = 'bag-' || b.slug
    )
    or exists (select 1 from public.courses c where c.id = _course and c.price = 0)
  , false);
$function$;