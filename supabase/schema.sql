create extension if not exists pgcrypto;
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), service text not null check (char_length(service) between 1 and 40),
  title text not null check (char_length(title) between 1 and 80), body text not null check (char_length(body) between 30 and 1200),
  rating smallint not null check (rating between 1 and 5), status text not null default 'pending' check (status in ('pending','published','rejected')),
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "published reviews are public" on public.reviews for select using (status = 'published');
create policy "anonymous reviews enter moderation" on public.reviews for insert with check (status = 'pending');
create index if not exists reviews_published_created_idx on public.reviews(status, created_at desc);
