create table public.contracts (
    id uuid primary key default gen_random_uuid(),

    application_id uuid not null unique
        references public.applications(id) on delete restrict,

    job_id uuid not null
        references public.jobs(id) on delete restrict,

    client_id uuid not null
        references public.client_profiles(id) on delete restrict,

    freelancer_id uuid not null
        references public.freelancer_profiles(id) on delete restrict,

    contract_type text not null
        check (
            contract_type in (
                'fixed',
                'hourly'
            )
        ),

    agreed_rate numeric(12,2)
        check (agreed_rate >= 0),

    estimated_duration text,

    status text not null default 'active'
        check (
            status in (
                'active',
                'completed',
                'cancelled',
                'disputed'
            )
        ),

    started_at timestamptz not null default now(),
    completed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        completed_at is null
        or completed_at >= started_at
    )
);