-- ============================================================
-- offers (admin-controlled) — Offer Zone
-- ============================================================
create table offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  link_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_offers_sort_order on offers (sort_order);

alter table offers enable row level security;

-- Public read access (storefront runs unauthenticated on the anon key) —
-- writes always go through admin Server Actions using the service role
-- key, which bypasses RLS entirely, same pattern as homepage_banners.
create policy "public_read_offers"
  on offers for select
  to anon, authenticated
  using (true);
