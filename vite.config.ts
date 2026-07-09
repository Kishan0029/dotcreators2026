import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite"; // 1. Add this import at the top

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      nitro({
        preset: "vercel", // 2. Explicitly force Nitro to build for Vercel here
      }),
    ],
  },
});
