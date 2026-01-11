import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler for automatic memoization
  reactCompiler: true,

  // Standalone output for minimal Docker images
  // Creates self-contained build in .next/standalone
  output: "standalone",

  // Include Prisma client in standalone output
  // Needed because pnpm uses a different node_modules structure
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/**/*", "./node_modules/@prisma/**/*"],
  },

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
