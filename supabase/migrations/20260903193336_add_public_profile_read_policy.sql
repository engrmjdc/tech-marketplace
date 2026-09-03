create policy "Authenticated users can read public profiles"
on public.profiles
for select
to authenticated
using (true);