create policy "Freelancers can create their own applications"
on public.applications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.freelancer_profiles fp
    where fp.id = freelancer_id
      and fp.user_id = auth.uid()
  )
);

create policy "Freelancers can read their own applications"
on public.applications
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

create policy "Freelancers can update their own applications"
on public.applications
for update
to authenticated
using (
  exists (
    select 1
    from public.freelancer_profiles fp
    where fp.id = freelancer_id
      and fp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.freelancer_profiles fp
    where fp.id = freelancer_id
      and fp.user_id = auth.uid()
  )
);