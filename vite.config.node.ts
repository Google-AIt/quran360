// Production build config for self-hosting on a Node.js server (cPanel "Setup Node.js App").
// Used only by the manual export build; the Lovable platform keeps using vite.config.ts.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
    output: { dir: ".output-node" },
  },
});
