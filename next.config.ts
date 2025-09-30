/** @type {import('next').NextConfig} */
const repoName = "csv-formatter"; // リポジトリ名だけ！

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",
};

module.exports = nextConfig;
