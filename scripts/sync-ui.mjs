/**
 * Copies MiniMail's own look into the site, so the scenes are drawn with the app's real styles and parts:
 * the theme tokens and plastic classes, the grain, the Tailwind theme, the button and key styles, and the logos.
 * Run it after the app's look changes: `npm run sync-ui` (the app is expected at ../MiniMail, or MINIMAIL_DIR).
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = resolve(process.env.MINIMAIL_DIR ?? resolve(site, "../MiniMail"));
if (!existsSync(resolve(app, "src/renderer/src/styles/globals.css"))) {
  console.error(`MiniMail was not found at ${app}. Set MINIMAIL_DIR to its folder.`);
  process.exit(1);
}

const out = resolve(site, "src/minimail");
const files = [
  ["src/renderer/src/styles/globals.css", "styles/globals.css"],
  ["src/renderer/src/assets/grain-light.png", "assets/grain-light.png"],
  ["src/renderer/src/assets/grain-dark.png", "assets/grain-dark.png"],
  ["src/renderer/src/assets/providers/gmail.svg", "assets/providers/gmail.svg"],
  ["src/renderer/src/assets/providers/outlook.svg", "assets/providers/outlook.svg"],
  ["src/renderer/src/assets/providers/zoho.png", "assets/providers/zoho.png"],
  ["src/renderer/src/components/ui/keys.ts", "components/ui/keys.ts"],
  ["src/renderer/src/components/ui/button.tsx", "components/ui/button.tsx"],
  ["src/renderer/src/lib/utils.ts", "lib/utils.ts"],
  ["tailwind.config.ts", "tailwind.config.ts"],
];
for (const [from, to] of files) {
  const target = resolve(out, to);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(resolve(app, from), target);
}

// The app's window never scrolls; a web page does. Everything else in the stylesheet is kept as it is.
const css = resolve(out, "styles/globals.css");
writeFileSync(css, readFileSync(css, "utf8").replace(/html,\s*body,\s*#root\s*\{[^}]*\}/, "/* (the app's fixed window rule is left out on the site) */"));

for (const logo of ["minimail-glyph.svg", "minimail-light.svg", "minimail-round.svg", "minimail-simple.svg"]) {
  copyFileSync(resolve(app, "logo-variants", logo), resolve(site, "public", logo));
}
// The app icon, as drawn for the Dock (macOS `sips` turns the .icns into a PNG).
try {
  execFileSync("sips", ["-s", "format", "png", "-Z", "512", resolve(app, "build/icon.icns"), "--out", resolve(site, "public/app-icon.png")], { stdio: "ignore" });
  // The tab icon and the home-screen icon are the same picture, smaller.
  for (const [size, name] of [["64", "favicon.png"], ["180", "apple-touch-icon.png"]]) {
    execFileSync("sips", ["-Z", size, resolve(site, "public/app-icon.png"), "--out", resolve(site, "public", name)], { stdio: "ignore" });
  }
} catch {
  console.warn("Could not convert build/icon.icns (needs macOS sips); public/app-icon.png was left as it was.");
}
console.log(`Copied ${files.length} files from ${app}`);
