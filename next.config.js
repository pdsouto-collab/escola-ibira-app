/** @type {import('next').NextConfig} */

const isGithubPages = process.env.GITHUB_ACTIONS || process.env.GITHUB_PAGES;
const nextConfig = {
  ...(isGithubPages && {
    output: "export",
    basePath: "/escola-ibira-app",
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