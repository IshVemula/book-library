import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM build of Postgres; let Node load it directly.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
