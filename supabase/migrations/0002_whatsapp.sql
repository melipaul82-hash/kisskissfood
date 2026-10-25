-- Kiss Kiss Food – WhatsApp bot storage (phase 1: receive and keep messages).
-- Run once in the Kiss Kiss Food Supabase project, after 0001_leads.sql.
-- Only the server (service role key, stored in Vercel) reads or writes these tables.

create table if not exists public.wa_contacts (
  wa_id        text primary key,                 -- customer's WhatsApp number, digits only
  name         text,
  locale       text check (locale in ('de', 'fr', 'en')),
  marketing_opt_in boolean not null default false,  -- explicit consent for promotional messages
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now()
);

create table if not exists public.wa_messages (
  id           text primary key,                 -- WhatsApp message id (wamid…), makes retries harmless
  wa_id        text not null references public.wa_contacts (wa_id) on delete cascade,
  direction    text not null check (direction in ('in', 'out')),
  type         text not null,
  body         text,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists wa_messages_contact_idx on public.wa_messages (wa_id, created_at desc);

alter table public.wa_contacts enable row level security;
alter table public.wa_messages enable row level security;
-- No policies on purpose: the public key cannot read customers' conversations.
