// Falls back to the Vercel-provided deployment URL, then localhost, so
// metadata/OG/sitemap generation never crashes on a missing env var —
// but production must set NEXT_PUBLIC_SITE_URL to the real custom domain,
// since VERCEL_URL points at the ephemeral *.vercel.app deployment URL.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Eleven11 Collection";
