import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootPath = path.join(__dirname, "../..");

/** @type {import('next').NextConfig} */
/*global process */
const nextConfig = {
  transpilePackages: ["@repo/shared-types"],
  output: "standalone",
  cacheComponents: true,
  outputFileTracingRoot: rootPath,
  turbopack: {
    root: rootPath,
  },
  rewrites: () => {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
