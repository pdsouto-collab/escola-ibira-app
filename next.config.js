/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    basePath: "/escola-ibira-app",
    trailingSlash: true,
    images: { unoptimized: true },
    generateEtags: false,
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
