// Falls back to the Vercel-provided deployment URL, then the known
// production domain, so metadata/OG/sitemap generation never crashes on a
// missing env var. Note VERCEL_URL is only usable in server-rendered code —
// it isn't inlined into client bundles, so anything generated in the
// browser (e.g. the WhatsApp checkout link) would fall straight through to
// the final default if NEXT_PUBLIC_SITE_URL isn't set. Ideally production
// sets NEXT_PUBLIC_SITE_URL explicitly (required if a custom domain is ever
// added), but the default below keeps links correct even without it.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://eleven11collection.vercel.app");

export const SITE_NAME = "Eleven11 Collection";
