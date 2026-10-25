-- Kiss Kiss Food – database schema (already applied to the "kiss kiss" Supabase project).
-- Kept here as the reference of what exists in the database.

-- Admins: emails allowed into /admin
create table public.admin_emails (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;

-- Helper kept out of the public API schema
create schema if not exists private;
grant usage on schema private to anon, authenticated;
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_emails a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create policy "Admins read admin list" on public.admin_emails
  for select to authenticated using ((select private.is_admin()));

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

-- Products (site + future WhatsApp bot)
create table public.products (
  key          text primary key check (key ~ '^[a-z0-9-]{2,40}$'),
  sort         int not null default 100,
  visible      boolean not null default true,
  available    boolean not null default false,
  name         jsonb not null,
  description  jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);
alter table public.products enable row level security;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create policy "Anyone reads visible products" on public.products for select to anon, authenticated using (visible or (select private.is_admin()));
create policy "Admins insert products" on public.products for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update products" on public.products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete products" on public.products for delete to authenticated using ((select private.is_admin()));

-- Restaurant signature menu
create table public.menu_items (
  key          text primary key check (key ~ '^[a-z0-9-]{2,40}$'),
  sort         int not null default 100,
  visible      boolean not null default true,
  name         text not null,
  description  jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);
alter table public.menu_items enable row level security;
create trigger menu_items_touch before update on public.menu_items for each row execute function public.touch_updated_at();
create policy "Anyone reads visible menu" on public.menu_items for select to anon, authenticated using (visible or (select private.is_admin()));
create policy "Admins insert menu" on public.menu_items for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update menu" on public.menu_items for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete menu" on public.menu_items for delete to authenticated using ((select private.is_admin()));

-- Requests from the website form
create table public.leads (
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
alter table public.leads enable row level security;
create index leads_created_at_idx on public.leads (created_at desc);
create policy "Website adds requests" on public.leads for insert to anon, authenticated with check (status = 'new');
create policy "Admins read requests" on public.leads for select to authenticated using ((select private.is_admin()));
create policy "Admins update requests" on public.leads for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete requests" on public.leads for delete to authenticated using ((select private.is_admin()));

-- WhatsApp bot storage (written by the server with the secret key)
create table public.wa_contacts (
  wa_id            text primary key,
  name             text,
  locale           text check (locale in ('de', 'fr', 'en')),
  marketing_opt_in boolean not null default false,
  first_seen       timestamptz not null default now(),
  last_seen        timestamptz not null default now()
);
create table public.wa_messages (
  id          text primary key,
  wa_id       text not null references public.wa_contacts (wa_id) on delete cascade,
  direction   text not null check (direction in ('in', 'out')),
  type        text not null,
  body        text,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index wa_messages_contact_idx on public.wa_messages (wa_id, created_at desc);
alter table public.wa_contacts enable row level security;
alter table public.wa_messages enable row level security;
create policy "Admins read contacts" on public.wa_contacts for select to authenticated using ((select private.is_admin()));
create policy "Admins read messages" on public.wa_messages for select to authenticated using ((select private.is_admin()));
