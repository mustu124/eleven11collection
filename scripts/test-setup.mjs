// Verifies Prompt 1 setup: seeded categories, a product read back through
// the anon-key client with its nested images/variants, and that the
// `orders` table is unreadable and uninsertable with the anon key.
//
// Usage: node --env-file=.env.local scripts/test-setup.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
// SUPABASE_SERVICE_ROLE_KEY to point at a real (local or hosted) Supabase
// project that already has the migrations + seed applied.

import { createClient } from "@supabase/supabase-js";

const EXPECTED_CATEGORY_SLUGS = [
  "earrings",
  "ear-cuffs",
  "bracelet-kadas",
  "bracelets",
  "rings",
  "watches",
  "pendants",
  "enamel-bangles",
  "hand-cuffs",
  "hand-chains",
  "anklets",
  "crochet",
  "jewellery-boxes",
  "waist-chains",
  "others",
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, " +
      "SUPABASE_SERVICE_ROLE_KEY in .env.local and run with --env-file=.env.local"
  );
  process.exit(1);
}

const anon = createClient(url, anonKey);
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let failures = 0;
function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function testCategoriesSeeded() {
  console.log("\n1. Categories seeded (15 rows, correct slugs) — anon client");
  const { data, error } = await anon
    .from("categories")
    .select("name, slug")
    .order("sort_order");

  check("query succeeded", !error, error?.message);
  const slugs = (data ?? []).map((c) => c.slug);
  check("15 categories present", slugs.length === 15, `got ${slugs.length}`);
  check(
    "slugs match expected set/order",
    JSON.stringify(slugs) === JSON.stringify(EXPECTED_CATEGORY_SLUGS),
    JSON.stringify(slugs)
  );
}

async function testProductReadBack() {
  console.log("\n2. Dummy product + 2 images + 1 variant — insert via SQL/admin, read via anon");

  const { data: category, error: categoryError } = await admin
    .from("categories")
    .select("id")
    .eq("slug", "rings")
    .single();
  check("fetched a category to attach the product to", !categoryError && !!category, categoryError?.message);

  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      category_id: category.id,
      name: "__TEST__ Gold Solitaire Ring",
      slug: `__test-gold-solitaire-ring-${Date.now()}`,
      price: 4999,
      mrp: 5999,
      stock: 10,
      material: "9KT Gold",
    })
    .select()
    .single();
  check("dummy product inserted", !productError && !!product, productError?.message);

  const { error: imagesError } = await admin.from("product_images").insert([
    { product_id: product.id, image_url: "https://example.com/ring-1.jpg", sort_order: 1 },
    { product_id: product.id, image_url: "https://example.com/ring-2.jpg", sort_order: 2 },
  ]);
  check("2 images inserted", !imagesError, imagesError?.message);

  const { error: variantError } = await admin.from("product_variants").insert({
    product_id: product.id,
    variant_name: "Size 7",
    stock: 5,
  });
  check("1 variant inserted", !variantError, variantError?.message);

  const { data: readBack, error: readError } = await anon
    .from("products")
    .select("name, price, product_images(image_url), product_variants(variant_name)")
    .eq("id", product.id)
    .single();

  check("anon client read the product back", !readError && !!readBack, readError?.message);
  check("name matches", readBack?.name === "__TEST__ Gold Solitaire Ring");
  check("2 images nested", readBack?.product_images?.length === 2, `got ${readBack?.product_images?.length}`);
  check("1 variant nested", readBack?.product_variants?.length === 1, `got ${readBack?.product_variants?.length}`);

  // cleanup — cascades to product_images and product_variants
  await admin.from("products").delete().eq("id", product.id);
}

async function testOrdersLockedDown() {
  console.log("\n3. orders table blocked for anon (read + insert)");

  const { data: seedOrder, error: seedError } = await admin
    .from("orders")
    .insert({
      customer_name: "__TEST__ Customer",
      phone: "9999999999",
      address: "123 Test St",
      pincode: "560001",
      cart_items: [{ product_id: "test", qty: 1, price: 100 }],
      total: 100,
    })
    .select()
    .single();
  check("seeded one order via service role (bypasses RLS)", !seedError && !!seedOrder, seedError?.message);

  const { data: anonRead, error: anonReadError } = await anon.from("orders").select("*");
  check(
    "anon SELECT returns no rows (RLS blocks, not an error, PostgREST just filters rows)",
    !anonReadError && (anonRead ?? []).length === 0,
    anonReadError ? anonReadError.message : `got ${anonRead?.length} rows`
  );

  const { error: anonInsertError } = await anon.from("orders").insert({
    customer_name: "__TEST__ Should Fail",
    phone: "9999999999",
    address: "123 Test St",
    pincode: "560001",
    cart_items: [],
    total: 0,
  });
  check(
    "anon INSERT is rejected by RLS",
    !!anonInsertError,
    anonInsertError ? undefined : "insert unexpectedly succeeded"
  );

  if (seedOrder) {
    await admin.from("orders").delete().eq("id", seedOrder.id);
  }
}

await testCategoriesSeeded();
await testProductReadBack();
await testOrdersLockedDown();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
