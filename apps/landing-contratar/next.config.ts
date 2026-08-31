import type { NextConfig } from "next";

function getAllowedDevOrigins(): string[] {
  const origins = [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      origins.push(new URL(siteUrl).host);
    } catch {
      // Ignore invalid NEXT_PUBLIC_SITE_URL in local config.
    }
  }

  return origins;
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  transpilePackages: ["@repo/ui"],
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
