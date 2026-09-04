alter table public.reviews enable row level security;

create policy "Authenticated users can read reviews"
on public.reviews
for select
to authenticated
using (true);

create policy "Contract participants can create reviews"
on public.reviews
for insert
to authenticated
with check (
  exists (
    select 1
    from public.contracts c
    join public.client_profiles cp
      on cp.id = c.client_id
    join public.freelancer_profiles fp
      on fp.id = c.freelancer_id
    where c.id = contract_id
      and c.status = 'completed'
      and (
        (
          reviewer_role = 'client'
          and reviewer_id = cp.user_id
          and reviewee_id = fp.user_id
          and cp.user_id = auth.uid()
        )
        or
        (
          reviewer_role = 'freelancer'
          and reviewer_id = fp.user_id
          and reviewee_id = cp.user_id
          and fp.user_id = auth.uid()
        )
      )
  )
);