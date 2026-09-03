-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
    id uuid primary key
        references auth.users(id) on delete cascade,

    username text unique,
    full_name text not null,
    avatar_url text,

    default_role text not null default 'freelancer'
        check (default_role in ('freelancer', 'client')),

    bio text,
    location text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- FREELANCER PROFILES
-- ============================================================

create table public.freelancer_profiles (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null unique
        references public.profiles(id) on delete cascade,

    title text not null,

    hourly_rate numeric(10,2)
        check (hourly_rate >= 0),

    experience_years numeric(4,1)
        check (experience_years >= 0),

    availability text
        check (
            availability in (
                'available',
                'part_time',
                'unavailable'
            )
        ),

    github_url text,
    linkedin_url text,
    portfolio_url text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT PROFILES
-- ============================================================

create table public.client_profiles (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null unique
        references public.profiles(id) on delete cascade,

    company_name text,
    company_description text,
    website_url text,
    industry text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- SKILLS
-- ============================================================

create table public.skills (
    id uuid primary key default gen_random_uuid(),

    name text not null unique,
    category text not null,

    created_at timestamptz not null default now()
);

-- ============================================================
-- FREELANCER SKILLS
-- ============================================================

create table public.freelancer_skills (
    freelancer_id uuid not null
        references public.freelancer_profiles(id) on delete cascade,

    skill_id uuid not null
        references public.skills(id) on delete cascade,

    created_at timestamptz not null default now(),

    primary key (freelancer_id, skill_id)
);

-- ============================================================
-- JOBS
-- ============================================================

create table public.jobs (
    id uuid primary key default gen_random_uuid(),

    client_id uuid not null
        references public.client_profiles(id) on delete restrict,

    title text not null,
    description text not null,

    category text not null,

    experience_level text not null
        check (
            experience_level in (
                'entry',
                'intermediate',
                'expert'
            )
        ),

    budget_type text not null
        check (
            budget_type in (
                'fixed',
                'hourly'
            )
        ),

    budget_min numeric(12,2)
        check (budget_min >= 0),

    budget_max numeric(12,2)
        check (budget_max >= 0),

    status text not null default 'open'
        check (
            status in (
                'draft',
                'open',
                'paused',
                'closed',
                'cancelled'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    check (
        budget_max is null
        or budget_min is null
        or budget_max >= budget_min
    )
);

-- ============================================================
-- APPLICATIONS
-- ============================================================

create table public.applications (
    id uuid primary key default gen_random_uuid(),

    job_id uuid not null
        references public.jobs(id) on delete cascade,

    freelancer_id uuid not null
        references public.freelancer_profiles(id) on delete restrict,

    cover_letter text not null,

    proposed_rate numeric(12,2)
        check (proposed_rate >= 0),

    estimated_duration text,

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'shortlisted',
                'rejected',
                'accepted',
                'withdrawn'
            )
        ),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (job_id, freelancer_id)
);