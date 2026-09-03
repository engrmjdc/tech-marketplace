create policy "Authenticated users can read freelancer skills"
on public.freelancer_skills
for select
to authenticated
using (true);