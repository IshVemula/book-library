import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM build of Postgres; let Node load it directly.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Uploaded covers are resized in the browser first (~100–300 KB), but leave headroom.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
};

export default nextConfig;
