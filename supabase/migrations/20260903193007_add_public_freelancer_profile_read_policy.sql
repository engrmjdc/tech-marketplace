create policy "Authenticated users can read freelancer profiles"
on public.freelancer_profiles
for select
to authenticated
using (true);