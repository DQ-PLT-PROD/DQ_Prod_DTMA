-- Newsletter subscriptions table to capture email signups from the site
create table if not exists public.newsletter_subscriptions (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    source text default 'footer',
    created_at timestamptz default timezone('utc', now())
);

-- Prevent duplicates (case-insensitive)
create unique index if not exists newsletter_subscriptions_email_key on public.newsletter_subscriptions (lower(email));

alter table public.newsletter_subscriptions enable row level security;

-- Allow anonymous inserts (public newsletter signups)
create policy "Allow anonymous email signups"
    on public.newsletter_subscriptions
    for insert
    to anon
    with check (true);

-- Allow service role to read/write (for dashboards or exports)
create policy "Service role full access to newsletter subscriptions"
    on public.newsletter_subscriptions
    for all
    to service_role
    using (true)
    with check (true);
