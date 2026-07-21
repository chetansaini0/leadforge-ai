import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
