create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);