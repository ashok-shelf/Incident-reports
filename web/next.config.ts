import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Set tracing root to repo root so standalone output preserves the
  // directory structure (web/ alongside incidents/ and runbooks/)
  outputFileTracingRoot: path.join(import.meta.dirname, ".."),
};

export default nextConfig;
