import type { NextConfig } from "next"

// Unlike apps/frontend, this site reads only its own .env.local (it deploys on its own domain).
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
