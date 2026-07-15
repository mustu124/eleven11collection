/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  experimental: {
    serverActions: {
      // Default body limit is 1MB, but product image uploads send up to 4
      // files at 5MB each as multipart FormData — well past that default,
      // which silently rejects the request once more than one image (or
      // one large one) is attached.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
