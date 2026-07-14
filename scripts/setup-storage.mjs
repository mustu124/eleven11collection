// One-off setup: creates the Supabase Storage buckets used for admin
// uploads (product images, homepage banner images). Safe to re-run (checks
// if each bucket already exists).
//
// Usage: node --env-file=.env.local scripts/setup-storage.mjs

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

const FILE_SIZE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKETS = ["product-images", "homepage-banners"];

for (const bucket of BUCKETS) {
  const { data: existing } = await admin.storage.getBucket(bucket);

  if (existing) {
    console.log(`Bucket "${bucket}" already exists — updating its limits.`);
    const { error } = await admin.storage.updateBucket(bucket, {
      public: true,
      fileSizeLimit: FILE_SIZE_LIMIT_BYTES,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) throw error;
  } else {
    console.log(`Creating bucket "${bucket}"...`);
    const { error } = await admin.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: FILE_SIZE_LIMIT_BYTES,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) throw error;
  }
}

console.log(
  `Done. ${BUCKETS.map((b) => `"${b}"`).join(" and ")} are public-read, ${FILE_SIZE_LIMIT_BYTES / 1024 / 1024}MB upload limit, images only.`
);
console.log("Uploads only ever happen server-side via the service-role client (admin Server Actions), so no public write policy is needed.");
