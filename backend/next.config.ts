import type { NextConfig } from "next";
const backendUrl =
  process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy URLs kept working after the route rename.
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
