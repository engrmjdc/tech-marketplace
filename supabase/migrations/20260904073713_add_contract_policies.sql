alter table public.contracts enable row level security;

create policy "Clients can read their own contracts"
on public.contracts
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

create policy "Freelancers can read their own contracts"
on public.contracts
for select
to authenticated
using (
  exists (
    select 1
    from public.freelancer_profiles fp
    where fp.id = freelancer_id
      and fp.user_id = auth.uid()
  )
);