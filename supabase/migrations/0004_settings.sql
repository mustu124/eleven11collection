-- ============================================================
-- settings (admin-controlled key/value store)
-- Currently used for: whatsapp_number — lets the admin change the
-- checkout/contact WhatsApp number without a redeploy.
-- ============================================================
create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

-- Public read access (storefront runs unauthenticated on the anon key) —
-- writes always go through admin Server Actions using the service role
-- key, which bypasses RLS entirely, same pattern as homepage_banners/offers.
create policy "public_read_settings"
  on settings for select
  to anon, authenticated
  using (true);

insert into settings (key, value) values ('whatsapp_number', '8295358180');
