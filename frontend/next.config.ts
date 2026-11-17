
import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/hire-staff",
        destination: "/hire-manpower",
        permanent: false,
      },
      {
        source: "/hire-staff/:path*",
        destination: "/hire-manpower/:path*",
        permanent: false,
      },
      {
        source: "/join-crew",
        destination: "/join-as-staff",
        permanent: false,
      },
      {
        source: "/join-crew/:path*",
        destination: "/join-as-staff/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
