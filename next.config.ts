import type { NextConfig } from "next";

// "standalone" output is for the self-hosted Docker path (Fly.io/Railway) — it produces a
// pruned, minimal server bundle for the Dockerfile to copy. Vercel's own build/packaging step
// expects the *standard* output structure and breaks on standalone's, so skip it there. Vercel
// sets VERCEL=1 during its builds, which is what we key off of.
const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
