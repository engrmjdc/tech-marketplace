create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        default_role
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            ''
        ),
        case
            when new.raw_user_meta_data ->> 'default_role' = 'client'
                then 'client'
            else 'freelancer'
        end
    );

    return new;
end;
$$;