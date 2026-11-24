import type { Config } from "tailwindcss";

import app from "./src/minimail/tailwind.config";

/** MiniMail's own theme (copied by `npm run sync-ui`), pointed at the site's files. */
export default {
  ...app,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
} satisfies Config;
