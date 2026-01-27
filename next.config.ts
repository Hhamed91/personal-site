import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        fs: path.resolve("lib/shims/empty-object.ts"),
        path: path.resolve("lib/shims/empty-object.ts"),
        url: path.resolve("lib/shims/empty-object.ts"),
      };
    }
    return config;
  },
};

export default nextConfig;
