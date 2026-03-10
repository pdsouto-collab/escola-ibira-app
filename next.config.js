/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_ACTIONS || process.env.GITHUB_PAGES;
const basePath = isGithubPages ? "/escola-ibira-app" : "";

const nextConfig = {
  ...(isGithubPages && {
    output: "export",
    basePath: basePath,
    assetPrefix: basePath,
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
module.exports = nextConfig;