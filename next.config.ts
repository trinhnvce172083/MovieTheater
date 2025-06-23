import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  crossOrigin: "anonymous", // Thiết lập crossOrigin cho các tài nguyên
  poweredByHeader: false, // Tắt header "X-Powered-By" của Next.js
  // Cấu hình CORS cho phép các nguồn gốc phát triển
  allowedDevOrigins: ["http://localhost:3000"],
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
      {
        protocol: "https",
        hostname: "supabase.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cuzwjjseeohnyrbfcngs.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
    
    // Image formats
    formats: ["image/webp", "image/avif"],

    // Device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache TTL
    minimumCacheTTL: 31536000,

    // Disable static imports
    disableStaticImages: false,

    // Allow SVG
    dangerouslyAllowSVG: false,

    // Content Security Policy for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Unoptimized images
    unoptimized: false,
  },
};

export default withBundleAnalyzer(nextConfig);
