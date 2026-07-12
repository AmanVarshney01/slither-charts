import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "slither-charts",
    // The demo site lives in the turborepo; the library builds with it.
    root: "apps/web",
    framework: "bun",
    // Tiny Bun static server over dist/ with an SPA fallback.
    entry: "server.ts",
    httpPort: 3000,
    build: {
      // Run from the app root: hop to the workspace root so bun can link
      // the slither-charts workspace package, build via turbo, then drop
      // the server into dist so the artifact is self-contained (dist is
      // gitignored, so it must ship as the build output, not repo files).
      command:
        "cd ../.. && bun install && bun run build && cp apps/web/server.ts apps/web/dist/server.ts",
      outputDirectory: "dist",
      entrypoint: "server.ts",
    },
  },
});
