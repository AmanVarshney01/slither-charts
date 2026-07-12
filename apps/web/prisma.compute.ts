import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "slither-charts",
    framework: "bun",
    entry: "server.ts",
    httpPort: 3000,
  },
});
