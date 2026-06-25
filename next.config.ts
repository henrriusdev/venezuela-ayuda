import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    // Photos are downscaled client-side (~150-400 KB) but leave headroom.
    serverActions: { bodySizeLimit: "3mb" },
  },
  images: {
    remotePatterns: [
      // Public Supabase Storage (check-in / missing-person photos).
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
