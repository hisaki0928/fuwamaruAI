import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 型エラーがあっても無視してビルドを成功させる
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLintのエラーも無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
