import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler for automatic memoization
  reactCompiler: true,

  // Standalone output for minimal Docker images
  // Creates self-contained build in .next/standalone
  output: "standalone",

  // Strict mode for better error detection
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Compress responses (disable if using reverse proxy compression)
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Production source maps (disable for smaller images, enable for debugging)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
