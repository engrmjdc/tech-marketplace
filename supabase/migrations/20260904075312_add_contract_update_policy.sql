create policy "Clients can update their own contracts"
on public.contracts
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