// Seeds placeholder homepage content (banners, sample products, top styles)
// so the homepage sections have real rows to render/test against before the
// admin panel (and real product photography) exist.
//
// Safe to re-run: it's idempotent by slug/section for anything that has a
// natural unique key, and wipes+reinserts the demo banners/top-styles rows
// it owns (tagged via the "__DEMO__" marker in badge_text / a dedicated
// demo flag isn't in the schema, so we track inserted ids in-memory and
// just re-seed banners/top_styles fully each run).
//
// Usage: node --env-file=.env.local scripts/seed-demo-content.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function placeholder(text, w = 800, h = 1000) {
  // /png suffix forces a real raster image — placehold.co defaults to SVG,
  // which next/image's optimizer rejects unless dangerouslyAllowSVG is set.
  // Background is a visibly distinct tan (not the page's F7F3EC ivory) so
  // placeholder art doesn't camouflage itself against the page background.
  return `https://placehold.co/${w}x${h}/E4D4BC/8A6A3F/png?text=${encodeURIComponent(text)}`;
}

const { data: categories, error: catError } = await admin
  .from("categories")
  .select("id, slug");
if (catError) throw catError;
const categoryId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

const PRODUCTS = [
  { slug: "gold-drop-earrings", name: "Gold Drop Earrings", category: "earrings", price: 1499, mrp: 1999, material: "9KT Gold", is_bestseller: true, description: "Delicate drop earrings with a soft sparkle, finished in 9KT gold for everyday wear.", stock: 20 },
  { slug: "gold-hoop-earrings", name: "Gold Hoop Earrings", category: "earrings", price: 2199, mrp: null, material: "9KT Gold", description: "Classic hoops in warm 9KT gold — a wardrobe staple.", stock: 15 },
  { slug: "pearl-stud-earrings", name: "Pearl Stud Earrings", category: "earrings", price: 899, mrp: 1199, material: "Silver", description: "Freshwater pearl studs set in sterling silver.", stock: 25, imageCount: 1 },
  { slug: "silver-drop-earrings", name: "Silver Drop Earrings", category: "earrings", price: 1699, mrp: null, material: "Silver", description: "Understated silver drops with a hint of sparkle for evening wear.", stock: 4 },
  { slug: "statement-ear-cuff", name: "Statement Ear Cuff", category: "ear-cuffs", price: 999, mrp: null, material: "Gold Plated", is_new_arrival: true, stock: 18 },
  { slug: "classic-gold-kada", name: "Classic Gold Kada", category: "bracelet-kadas", price: 2999, mrp: 3499, material: "9KT Gold", badge_text: "Only 5 left", stock: 5 },
  { slug: "rose-gold-bracelet", name: "Rose Gold Bracelet", category: "bracelets", price: 1799, mrp: null, material: "Rose Gold Plated", stock: 22 },
  {
    slug: "solitaire-ring",
    name: "Solitaire Ring",
    category: "rings",
    price: 4999,
    mrp: 5999,
    material: "9KT Gold",
    is_bestseller: true,
    description: "A timeless solitaire, hand-set and finished in 9KT gold.",
    stock: 23,
    variants: [
      { name: "Size 6", stock: 3 },
      { name: "Size 7", stock: 0 },
      { name: "Size 8", stock: 12, price_override: 5499 },
    ],
  },
  { slug: "stackable-band-ring", name: "Stackable Band Ring", category: "rings", price: 1299, mrp: null, material: "Silver", is_new_arrival: true, stock: 30 },
  { slug: "vintage-gold-ring", name: "Vintage Gold Ring", category: "rings", price: 3799, mrp: 4299, material: "9KT Gold", description: "A vintage-inspired band with delicate detailing.", stock: 0 },
  { slug: "heart-pendant", name: "Heart Pendant", category: "pendants", price: 1599, mrp: 1899, material: "9KT Gold", stock: 3 },
  { slug: "layered-pendant-chain", name: "Layered Pendant Chain", category: "pendants", price: 2199, mrp: null, material: "Gold Plated", stock: 17 },
  { slug: "enamel-bangle-set", name: "Enamel Bangle Set", category: "enamel-bangles", price: 2499, mrp: 2999, material: "Enamel", badge_text: "Flat 500 Off", stock: 14 },
];

console.log("Upserting demo products...");
const productIds = {};
let variantCount = 0;
for (const p of PRODUCTS) {
  const { data: product, error } = await admin
    .from("products")
    .upsert(
      {
        slug: p.slug,
        name: p.name,
        description: p.description ?? null,
        category_id: categoryId[p.category],
        price: p.price,
        mrp: p.mrp,
        material: p.material,
        is_bestseller: p.is_bestseller ?? false,
        is_new_arrival: p.is_new_arrival ?? false,
        badge_text: p.badge_text ?? null,
        stock: p.stock ?? 20,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();
  if (error) throw error;
  productIds[p.slug] = product.id;

  const imageCount = p.imageCount ?? 2;
  await admin.from("product_images").delete().eq("product_id", product.id);
  await admin.from("product_images").insert(
    Array.from({ length: imageCount }, (_, i) => ({
      product_id: product.id,
      image_url: placeholder(imageCount > 1 ? `${p.name} ${i + 1}` : p.name),
      sort_order: i + 1,
    }))
  );

  await admin.from("product_variants").delete().eq("product_id", product.id);
  if (p.variants?.length) {
    await admin.from("product_variants").insert(
      p.variants.map((v) => ({
        product_id: product.id,
        variant_name: v.name,
        stock: v.stock,
        price_override: v.price_override ?? null,
      }))
    );
    variantCount += p.variants.length;
  }
}
console.log(`  ${PRODUCTS.length} products upserted with images (${variantCount} variants across products that have them).`);

console.log("Re-seeding homepage_top_styles...");
await admin.from("homepage_top_styles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const TOP_STYLES = [
  ...["gold-drop-earrings", "solitaire-ring", "classic-gold-kada", "heart-pendant", "rose-gold-bracelet", "enamel-bangle-set"].map((slug, i) => ({ slug, tab: "all", sort_order: i })),
  ...["gold-drop-earrings", "pearl-stud-earrings", "statement-ear-cuff"].map((slug, i) => ({ slug, tab: "earrings", sort_order: i })),
  ...["solitaire-ring", "stackable-band-ring"].map((slug, i) => ({ slug, tab: "rings", sort_order: i })),
  ...["heart-pendant", "layered-pendant-chain"].map((slug, i) => ({ slug, tab: "pendants", sort_order: i })),
];
const { error: topStylesError } = await admin.from("homepage_top_styles").insert(
  TOP_STYLES.map((t) => ({ product_id: productIds[t.slug], tab: t.tab, sort_order: t.sort_order }))
);
if (topStylesError) throw topStylesError;
console.log(`  ${TOP_STYLES.length} top-style rows across ${new Set(TOP_STYLES.map((t) => t.tab)).size} tabs.`);

console.log("Re-seeding homepage_banners...");
await admin.from("homepage_banners").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const BANNERS = [
  { section: "hero", image_url: placeholder("Hero 1 — New Collection", 1200, 1500), link_url: "/category/rings", sort_order: 1 },
  { section: "hero", image_url: placeholder("Hero 2 — Festive Edit", 1200, 1500), link_url: "/category/pendants", sort_order: 2 },
  { section: "hero", image_url: placeholder("Hero 3 — Everyday Gold", 1200, 1500), link_url: null, sort_order: 3 },
  { section: "hero", image_url: placeholder("Hero 4 — Bridal Edit", 1200, 1500), link_url: "/category/bracelet-kadas", sort_order: 4 },
  { section: "hero", image_url: placeholder("Hero 5 — Gifting Season", 1200, 1500), link_url: "/category/earrings", sort_order: 5 },
  { section: "mood_daily", image_url: placeholder("Daily Wear", 600, 800), link_url: "/category/earrings", sort_order: 1 },
  { section: "mood_party", image_url: placeholder("Party Wear", 600, 800), link_url: "/category/rings", sort_order: 2 },
  { section: "mood_dayout", image_url: placeholder("Day Out", 600, 800), link_url: "/category/bracelets", sort_order: 3 },
  { section: "gifting_her", image_url: placeholder("Gifts for Her", 900, 1200), link_url: "/category/earrings", sort_order: 1 },
];
const { error: bannerError } = await admin.from("homepage_banners").insert(BANNERS);
if (bannerError) throw bannerError;
console.log(`  ${BANNERS.length} banners across ${new Set(BANNERS.map((b) => b.section)).size} sections.`);

console.log("\nDone.");
