import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["api.telegram.org"],
  },
}

export default nextConfig
