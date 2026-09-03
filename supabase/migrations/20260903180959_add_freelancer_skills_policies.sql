create policy "Freelancers can read their own skills"
on public.freelancer_skills
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

create policy "Freelancers can add their own skills"
on public.freelancer_skills
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

create policy "Freelancers can delete their own skills"
on public.freelancer_skills
for delete
to authenticated
using (
  exists (
    select 1
    from public.freelancer_profiles fp
    where fp.id = freelancer_id
      and fp.user_id = auth.uid()
  )
);