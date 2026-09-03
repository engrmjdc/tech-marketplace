create policy "Clients can create their own profile"
on public.client_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Clients can update their own profile"
on public.client_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Clients can read their own profile"
on public.client_profiles
for select
to authenticated
using (auth.uid() = user_id);