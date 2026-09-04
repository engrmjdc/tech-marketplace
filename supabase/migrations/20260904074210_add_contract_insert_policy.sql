create policy "Clients can create contracts for their own jobs"
on public.contracts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.jobs j
    join public.client_profiles cp
      on cp.id = j.client_id
    where j.id = job_id
      and cp.id = client_id
      and cp.user_id = auth.uid()
  )
);
