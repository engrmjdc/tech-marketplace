create or replace function public.prevent_self_contract()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    client_user_id uuid;
    freelancer_user_id uuid;
begin
    select user_id
    into client_user_id
    from public.client_profiles
    where id = new.client_id;

    select user_id
    into freelancer_user_id
    from public.freelancer_profiles
    where id = new.freelancer_id;

    if client_user_id is null then
        raise exception 'Client profile not found.';
    end if;

    if freelancer_user_id is null then
        raise exception 'Freelancer profile not found.';
    end if;

    if client_user_id = freelancer_user_id then
        raise exception 'A user cannot create a contract with themselves.';
    end if;

    return new;
end;
$$;

create trigger prevent_self_contract_trigger
before insert or update of client_id, freelancer_id
on public.contracts
for each row
execute function public.prevent_self_contract();