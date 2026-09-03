create policy "Clients can read applications for their own jobs"
on public.applications
for select
to authenticated
using (
  exists (
    select 1
    from public.jobs j
    join public.client_profiles cp
      on cp.id = j.client_id
    where j.id = job_id
      and cp.user_id = auth.uid()
  )
);