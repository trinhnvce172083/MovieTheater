import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  typescript: {
    // Bật chế độ strict để kiểm tra lỗi TypeScript
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  turbopack: {
    // Nếu cần loader cho file đặc biệt (ví dụ: .md), dùng rules dạng object mapping:
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      // Ví dụ cho SVG:
      // "*.svg": {
      //   loaders: ["@svgr/webpack"],
      //   as: "*.js",
      // },
    },

    // Alias module
    resolveAlias: {
      "@components": "./src/components",
      "@api": "./src/api",
    },

    // Thêm phần mở rộng custom khi resolve module
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".json"],

    // Các tùy chọn khác nếu cần
    moduleIds: "named", // hoặc "deterministic"
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
