import type { NextConfig } from "next";

// assetPrefix is set at deploy time to the versioned CDN base, e.g.
//   VRPUMPS_CDN_BASE=https://us-cdn1.centilio.com/vrpumps/v2
// Unset (local dev / non-CDN build) -> assets served from the app origin.
const CDN_BASE = process.env.VRPUMPS_CDN_BASE;

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vrpumps",
  assetPrefix: CDN_BASE || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
