import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, Download } from "lucide-react";

import { FLAT_KEY, FLAT_KEY_IN } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { detectMacArch, type MacArch } from "~/lib/mac-arch";
import { EASE } from "~/lib/motion";

export const LINKS = {
  /** Answered by api/download.js: redirects to the newest .dmg (`?arch=x64` for Intel), so the download starts at once. */
  download: "/download",
  github: "https://github.com/nicolasakf/MiniMail",
  guide: "https://github.com/nicolasakf/MiniMail/blob/main/docs/guide.md",
  license: "https://github.com/nicolasakf/MiniMail/blob/main/LICENSE",
  privacy: "/privacy",
};

export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Asked once per visit, however many buttons there are. */
let detected: Promise<MacArch> | undefined;

function useDownloadHref() {
  const [arch, setArch] = useState<MacArch>("arm64");
  useEffect(() => {
    void (detected ??= detectMacArch()).then(setArch);
  }, []);
  return arch === "x64" ? `${LINKS.download}?arch=x64` : LINKS.download;
}

/** The files offered by hand, for a Mac the detection got wrong or a download meant for another one. */
const CHOICES: { arch: MacArch; label: string }[] = [
  { arch: "arm64", label: "Apple Silicon" },
  { arch: "x64", label: "Intel" },
];

/**
 * The blue raised insert, like the app's Compose key, split in two: the wide part downloads the file for this Mac,
 * the arrow lists both. `compact` is the smaller size of the scrolled header.
 */
export function DownloadButton({ className, size = "lg", compact = false }: { className?: string; size?: "lg" | "sm"; compact?: boolean }) {
  const href = useDownloadHref();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const arrow = useRef<HTMLButtonElement>(null);

  // The list closes on Escape, and when a click or the focus goes elsewhere.
  useEffect(() => {
    if (!open) return;
    const elsewhere = (event: Event) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      arrow.current?.focus();
    };
    document.addEventListener("pointerdown", elsewhere);
    document.addEventListener("focusin", elsewhere);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", elsewhere);
      document.removeEventListener("focusin", elsewhere);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const half = "flex h-full items-center justify-center transition-colors hover:bg-white/10 focus-visible:bg-white/20";
  const ease = "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <div ref={root} className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "grain corner-squircle press-sink inline-flex items-stretch overflow-hidden bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-raise-1",
          ease,
          size === "lg" ? "h-12 rounded-[14px] text-[15px]" : compact ? "h-8 rounded-[10px] text-sm" : "h-9 rounded-[11px] text-sm",
        )}
      >
        <a href={href} className={cn(half, "gap-2", size === "lg" ? "pl-6 pr-5" : "pl-3.5 pr-3")}>
          <Download className={size === "lg" ? "size-[18px]" : "size-4"} />
          {size === "sm" ? (
            <span>
              Download<span className="hidden sm:inline"> for macOS</span>
            </span>
          ) : (
            "Download for macOS"
          )}
        </a>
        <span aria-hidden className="my-2 w-px bg-black/25 shadow-[1px_0_0_rgb(255_255_255/0.25)]" />
        <button
          ref={arrow}
          type="button"
          aria-label="Choose the download for your Mac"
          aria-expanded={open}
          onClick={() => setOpen((was) => !was)}
          className={cn(half, size === "lg" ? "w-11" : "w-8")}
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div className="plate-1 corner-squircle absolute right-0 top-full z-30 mt-2 flex w-44 flex-col gap-0.5 rounded-[14px] p-1 text-left text-sm font-medium text-foreground">
          {CHOICES.map(({ arch, label }) => (
            <a key={arch} href={`${LINKS.download}?arch=${arch}`} onClick={() => setOpen(false)} className={cn("rounded-[10px] px-3 py-2", FLAT_KEY_IN)}>
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function GithubButton({ className }: { className?: string }) {
  return (
    <a
      href={LINKS.github}
      className={cn(
        "plate-1 corner-squircle press-sink face-hover inline-flex h-12 items-center justify-center gap-2 rounded-[14px] px-6 text-[15px] font-semibold transition-[box-shadow,transform,background-color] duration-100",
        className,
      )}
    >
      <GithubMark className="size-[18px]" />
      View on GitHub
    </a>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const link = cn("rounded-[11px] px-3 py-2 text-sm font-medium", FLAT_KEY);
  const ease = "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      {/* At the top: the plate as it was. Scrolled: it shrinks to a small pill of see-through matte plastic. */}
      <nav
        className={cn(
          "corner-squircle relative mx-auto flex items-center gap-1 pl-3 pr-2",
          ease,
          scrolled
            ? "h-11 max-w-[640px] rounded-[16px] bg-background/60 shadow-raise-1 backdrop-blur-xl backdrop-saturate-150"
            : "plate-1 h-14 max-w-[1120px] rounded-[18px]",
        )}
      >
        {/* The grain stays on the see-through pill, so it still reads as plastic. */}
        <span aria-hidden className={cn("grain pointer-events-none absolute inset-0 rounded-[inherit] [corner-shape:inherit]", ease, scrolled ? "opacity-70" : "opacity-0")} />
        <a href="#top" className="relative mr-auto flex items-center gap-2.5 pr-3 font-bold tracking-[-0.01em]">
          <img src="/app-icon.png" alt="" className={cn(ease, scrolled ? "size-6" : "size-8")} />
          <span className={cn(ease, scrolled ? "text-[15px]" : "text-[17px]")}>MiniMail</span>
        </a>
        <a href="#minimum" className={cn(link, "relative hidden md:inline-flex", scrolled && "py-1.5")}>Features</a>
        <a href="#agents" className={cn(link, "relative hidden md:inline-flex", scrolled && "py-1.5")}>Agents</a>
        <a href={LINKS.github} className={cn(link, "relative hidden items-center gap-1.5 sm:inline-flex", scrolled && "py-1.5")}>
          <GithubMark className="size-4" /> GitHub
        </a>
        <DownloadButton size="sm" compact={scrolled} className="ml-2" />
      </nav>
    </header>
  );
}

export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-16 md:px-8 md:py-32", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-semibold uppercase tracking-[0.28em] text-sidebar-primary", className)}>{children}</p>;
}

/** The depth of the molding: full for the big titles, shallower for the smaller ones on a phone, whose strokes are thin. */
const MOLDS = [
  { id: "molded", depth: 1 },
  { id: "molded-small", depth: 0.6 },
];

/**
 * The light on the big titles' letters (`.molded` in site.css), drawn once for the whole page. Text cannot take the
 * cards' box shadows, so this does the same to the letter shapes: a lit top-left edge, a shaded bottom-right edge and
 * a cast shadow.
 */
export function MoldedFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      {MOLDS.map(({ id, depth }) => (
        <filter key={id} id={id} x="-10%" y="-25%" width="120%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation={0.5 * depth} result="soft" />
          {/* What the shape covers and its shifted copy does not is the rim on one side. */}
          <feOffset in="soft" dx={1.5 * depth} dy={1.5 * depth} result="down" />
          <feComposite in="SourceAlpha" in2="down" operator="out" result="litRim" />
          <feFlood floodColor="#fff" floodOpacity="0.55" />
          <feComposite in2="litRim" operator="in" result="lit" />
          <feGaussianBlur in="SourceAlpha" stdDeviation={1.1 * depth} result="softer" />
          <feOffset in="softer" dx={-1.8 * depth} dy={-1.8 * depth} result="up" />
          <feComposite in="SourceAlpha" in2="up" operator="out" result="shadeRim" />
          <feFlood floodColor="#000" floodOpacity="0.4" />
          <feComposite in2="shadeRim" operator="in" result="shade" />
          <feMerge result="edges">
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shade" />
            <feMergeNode in="lit" />
          </feMerge>
          <feComposite in="edges" in2="SourceAlpha" operator="in" result="face" />
          {/* The cast shadow, in the plastic's shadow tone: a tight one and a wider one, as on a raised plate. */}
          <feDropShadow in="face" dx={depth} dy={depth} stdDeviation={0.5 * depth} floodColor="#484037" floodOpacity="0.3" result="near" />
          <feDropShadow in="near" dx={2.8 * depth} dy={2.8 * depth} stdDeviation={2 * depth} floodColor="#484037" floodOpacity="0.28" />
        </filter>
      ))}
    </svg>
  );
}

/** A heading that rises into place the first time it is seen. */
export function Title({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  const M = motion[Tag];
  return (
    <M
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={cn("molded molded-face text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.025em] md:text-[56px]", className)}
    >
      {children}
    </M>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
      className={cn("text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl", className)}
    >
      {children}
    </motion.p>
  );
}

/** A groove across the page between two parts. */
export function Groove() {
  return <div aria-hidden className="groove-h mx-auto w-full max-w-[1136px]" />;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
