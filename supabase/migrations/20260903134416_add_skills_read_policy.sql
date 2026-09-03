create policy "Skills are publicly readable"
on public.skills
for select
to anon, authenticated
using (true);