import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use native Node.js modules (fs, path, native bindings)
  // and must NOT be bundled by webpack. They run only on the server.
  serverExternalPackages: ["pg", "pdf-parse", "mammoth"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse internally calls fs.readFileSync() on a test PDF at module
      // load time (in node_modules/pdf-parse/lib/pdf-parse.js).
      // This alias stubs that out so Next.js doesn't crash during bundling.
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdf-parse/lib/utils/pdfjs/getDocument": false,
      };
    }
    return config;
  },
};

export default nextConfig;
