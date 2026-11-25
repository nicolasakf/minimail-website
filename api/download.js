/**
 * /download: sends the browser to the newest MiniMail disk image (a .dmg on the latest GitHub release), which
 * starts the download without leaving the page. `?arch=x64` asks for the Intel one; otherwise it is the Apple
 * Silicon one. The file name carries the version, so it is looked up each time (cached for ten minutes) instead
 * of being written into the site.
 */
const RELEASES = "https://api.github.com/repos/nicolasakf/MiniMail/releases/latest";
const FALLBACK = "https://github.com/nicolasakf/MiniMail/releases/latest";

export default async function handler(request, response) {
  const arch = request.query?.arch === "x64" ? "x64" : "arm64";
  try {
    const answer = await fetch(RELEASES, { headers: { Accept: "application/vnd.github+json", "User-Agent": "minimail-website" } });
    if (!answer.ok) throw new Error(`GitHub answered ${answer.status}`);
    const release = await answer.json();
    // Never the other architecture's file: an Intel Mac cannot open the Apple Silicon one.
    const dmg = release.assets?.find((asset) => asset.name.endsWith(`-${arch}.dmg`));
    if (!dmg) throw new Error(`The latest release has no ${arch} .dmg`);
    response.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    response.redirect(302, dmg.browser_download_url);
  } catch (error) {
    // The release page still has the files, so the visitor is never left with nothing.
    console.error("download:", error);
    response.setHeader("Cache-Control", "no-store");
    response.redirect(302, FALLBACK);
  }
}
