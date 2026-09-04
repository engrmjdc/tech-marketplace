create table public.reviews (
    id uuid primary key default gen_random_uuid(),

    contract_id uuid not null
        references public.contracts(id) on delete cascade,

    reviewer_id uuid not null
        references public.profiles(id) on delete cascade,

    reviewee_id uuid not null
        references public.profiles(id) on delete cascade,

    reviewer_role text not null
        check (
            reviewer_role in (
                'client',
                'freelancer'
            )
        ),

    rating integer not null
        check (
            rating >= 1
            and rating <= 5
        ),

    comment text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        reviewer_id <> reviewee_id
    ),

    unique (
        contract_id,
        reviewer_id
    )
);