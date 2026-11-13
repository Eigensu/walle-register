import type { NextConfig } from "next"

// The backend URL stays server-side; the browser only ever talks to this site (same origin, no CORS).
const api = (process.env.ADMIN_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      // Player photos when the backend stores uploads locally (STORAGE_MODE=local).
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
    ]
  },
}

export default nextConfig
