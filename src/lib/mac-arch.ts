/**
 * Which MiniMail disk image this browser's Mac needs. The user agent cannot say: every Mac calls itself "Intel".
 * Chromium browsers answer through client hints; elsewhere the graphics card does. Anything unclear is Apple Silicon.
 */
export type MacArch = "arm64" | "x64";

interface ClientHints {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
}

function fromGraphics(): MacArch {
  const gl = document.createElement("canvas").getContext("webgl");
  if (!gl) return "arm64";
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  const extensions = gl.getSupportedExtensions() ?? [];
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  // Firefox names the card (or one like it).
  if (/intel|amd|radeon|nvidia|geforce/i.test(renderer)) return "x64";
  // Safari says "Apple GPU" on every Mac, but only Apple's own chips read ETC textures.
  if (/apple/i.test(renderer) && extensions.length > 0 && !extensions.includes("WEBGL_compressed_texture_etc")) return "x64";
  return "arm64";
}

export async function detectMacArch(): Promise<MacArch> {
  // Phones, tablets and other systems cannot run either file: leave them the usual one.
  if (!/Macintosh/.test(navigator.userAgent) || navigator.maxTouchPoints > 1) return "arm64";
  try {
    const hints = (navigator as Navigator & { userAgentData?: ClientHints }).userAgentData;
    const architecture = (await hints?.getHighEntropyValues?.(["architecture"]))?.architecture;
    if (architecture) return architecture === "x86" ? "x64" : "arm64";
    return fromGraphics();
  } catch {
    // expected: a browser that refuses the question gets the usual file.
    return "arm64";
  }
}
