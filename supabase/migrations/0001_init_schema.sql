-- Eleven 11 initial schema
create extension if not exists "pgcrypto";

-- ============================================================
-- categories
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create index idx_categories_slug on categories (slug);

-- ============================================================
-- products
-- ============================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  mrp numeric(10, 2) check (mrp >= 0),
  stock int not null default 0 check (stock >= 0),
  material text,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  badge_text text,
  created_at timestamptz not null default now()
);

create index idx_products_category_id on products (category_id);
create index idx_products_slug on products (slug);

-- ============================================================
-- product_images (multiple per product)
-- ============================================================
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);

create index idx_product_images_product_id on product_images (product_id);

-- ============================================================
-- product_variants (size, color, metal tone)
-- ============================================================
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  variant_name text not null,
  price_override numeric(10, 2) check (price_override >= 0),
  stock int not null default 0 check (stock >= 0)
);

create index idx_product_variants_product_id on product_variants (product_id);

-- ============================================================
-- homepage_banners (admin-controlled)
-- ============================================================
create table homepage_banners (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  image_url text not null,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create index idx_homepage_banners_section on homepage_banners (section);

-- ============================================================
-- homepage_top_styles (product picks per tab)
-- ============================================================
create table homepage_top_styles (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  tab text not null,
  sort_order int not null default 0
);

create index idx_homepage_top_styles_product_id on homepage_top_styles (product_id);

-- ============================================================
-- orders (created at checkout, pushed to WhatsApp)
-- ============================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  pincode text not null,
  cart_items jsonb not null,
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled')),
  created_at timestamptz not null default now()
);
