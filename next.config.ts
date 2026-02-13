import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: "export",
  // Using explicit path for GitHub Pages
  basePath: "/escola-ibira-app",
  trailingSlash: true,
  images: { unoptimized: true },
  generateEtags: false,
};

export default nextConfig;
