import type { NextConfig } from "next";

// In local development behind corporate enterprise proxies (e.g. Kyndryl VPN),
// allow local Node.js to trust the corporate root certificate.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
