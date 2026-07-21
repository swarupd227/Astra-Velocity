import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pino", "postgres", "bullmq", "ioredis"],
};

export default nextConfig;
