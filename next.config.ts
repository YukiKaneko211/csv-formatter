/** @type {import('next').NextConfig} */
const repoName = "https://YukiKaneko211.github.io/csv-formatter/"; // ← あなたのリポジトリ名に置き換える

const nextConfig = {
  output: "export",        // 静的出力モード
  images: {
    unoptimized: true,     // GH Pagesでは画像最適化不可
  },
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",
};

module.exports = nextConfig;
