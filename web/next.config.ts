import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  basePath: "/trading-platform",
  images: { unoptimized: true },
  // Trailing slash makes /wireframe → /wireframe/index.html which Pages serves cleanly
  trailingSlash: true,
};

export default nextConfig;
