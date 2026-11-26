import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Two pages: the site and the privacy policy, a plain page that needs no script.
  build: { rollupOptions: { input: [resolve(here, "index.html"), resolve(here, "privacy.html")] } },
  // 5173 belongs to the MiniMail app's own dev server.
  server: { port: 4321, strictPort: false },
  resolve: {
    alias: {
      // The app's files (copied by `npm run sync-ui`) import each other with "@/".
      "@": resolve(here, "src/minimail"),
      "~": resolve(here, "src"),
    },
  },
});
