-- Row Level Security for Eleven 11

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table homepage_banners enable row level security;
alter table homepage_top_styles enable row level security;
alter table orders enable row level security;

-- ============================================================
-- Public read access: categories, products, product_images,
-- product_variants, homepage_banners, homepage_top_styles
-- (storefront runs unauthenticated on the anon key)
-- ============================================================
create policy "public_read_categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "public_read_products"
  on products for select
  to anon, authenticated
  using (true);

create policy "public_read_product_images"
  on product_images for select
  to anon, authenticated
  using (true);

create policy "public_read_product_variants"
  on product_variants for select
  to anon, authenticated
  using (true);

create policy "public_read_homepage_banners"
  on homepage_banners for select
  to anon, authenticated
  using (true);

create policy "public_read_homepage_top_styles"
  on homepage_top_styles for select
  to anon, authenticated
  using (true);

-- ============================================================
-- orders: no anon access at all.
-- - No INSERT policy for anon/authenticated: the only insert
--   path is the server route (Prompt 7) using the service role
--   key, which bypasses RLS entirely.
-- - Authenticated (admin, via Supabase Auth login) can read
--   orders to manage them from /admin.
-- - No UPDATE/DELETE policy for anon/authenticated: status
--   updates (confirmed/fulfilled) also go through the service
--   role from admin server routes.
-- ============================================================
create policy "authenticated_read_orders"
  on orders for select
  to authenticated
  using (true);
