import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/database",
        destination: "https://app.turso.tech/vercel-icfg-ibz30j8x6gcr3a7emmdkktl0/databases/database-purple-elephant/data",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
