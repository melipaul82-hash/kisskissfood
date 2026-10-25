-- Kiss Kiss Food – requests sent from the website form (stockists and general questions).
-- Run once in the Kiss Kiss Food Supabase project: SQL Editor → New query → paste → Run.

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in ('reseller', 'contact')),
  locale      text not null default 'de' check (locale in ('de', 'fr', 'en')),
  shop_name   text check (char_length(shop_name) <= 160),
  name        text not null check (char_length(name) between 1 and 160),
  city        text check (char_length(city) <= 120),
  email       text not null check (char_length(email) <= 254 and email like '%_@_%._%'),
  phone       text check (char_length(phone) <= 40),
  volume      text check (char_length(volume) <= 120),
  message     text check (char_length(message) <= 4000),
  consent     boolean not null check (consent),
  status      text not null default 'new' check (status in ('new', 'in_progress', 'done'))
);

comment on table public.leads is 'Requests from kisskissfood.site (stockists and contact). Read them in Table Editor.';

alter table public.leads enable row level security;

-- Visitors may only add a request. Nobody can read, change or delete through the public key.
drop policy if exists "Website can insert leads" on public.leads;
create policy "Website can insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (status = 'new');

create index if not exists leads_created_at_idx on public.leads (created_at desc);
