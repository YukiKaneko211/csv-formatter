/** @type {import('next').NextConfig} */
const repoName = "csv-formatter";

const nextConfig = {
  output: "export",  // ← これが必須
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",
};

module.exports = nextConfig;
