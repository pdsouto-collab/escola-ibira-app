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
  ...(!isGithubPages && {
    async headers() {
      return [
        {
          // Aplica cabecalhos de CORS para todas as rotas da API
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" }, // Altere para o dominio especifico se desejar
            { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          ]
        }
      ]
    }
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
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath
  }
};
module.exports = nextConfig;