import type { NextConfig } from "next"

// Unlike apps/frontend, this site reads only its own .env.local (it deploys on its own domain).
const registrationApi = process.env.REGISTRATION_API_URL?.replace(/\/$/, "")

const nextConfig: NextConfig = {
  // Expose Vercel's deploy environment so lib/content.ts can default to "production" on production deploys.
  env: { NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "" },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The registration form talks to this event's backend through /api/*, so the backend URL stays
  // server-side and the browser makes same-origin requests (no CORS).
  async rewrites() {
    return registrationApi ? [{ source: "/api/:path*", destination: `${registrationApi}/api/:path*` }] : []
  },
}

export default nextConfig
