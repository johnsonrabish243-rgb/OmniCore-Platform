import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Turbopack config (used in dev)
  turbopack: {
    root: process.cwd(),
  },

  // Production source maps (disabled for faster builds, enable for debugging)
  productionBrowserSourceMaps: false,

  // Image optimization config
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "4majgdg3.us-east.insforge.app",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
