create policy "Freelancers can create their own profile"
on public.freelancer_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Freelancers can update their own profile"
on public.freelancer_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Freelancers can read their own profile"
on public.freelancer_profiles
for select
to authenticated
using (auth.uid() = user_id);