create policy "Clients can create their own jobs"
on public.jobs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = client_id
      and cp.user_id = auth.uid()
  )
);

create policy "Clients can read their own jobs"
on public.jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = client_id
      and cp.user_id = auth.uid()
  )
);

create policy "Clients can update their own jobs"
on public.jobs
for update
to authenticated
using (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = client_id
      and cp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.client_profiles cp
    where cp.id = client_id
      and cp.user_id = auth.uid()
  )
);