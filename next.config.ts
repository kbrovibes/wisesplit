import type { NextConfig } from "next";

// basePath is empty by default (Vercel + dev). GitHub Pages sets
// NEXT_PUBLIC_BASE_PATH=/wisesplit in its workflow.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  typedRoutes: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
