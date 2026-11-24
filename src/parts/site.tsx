import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Download } from "lucide-react";

import { FLAT_KEY } from "@/components/ui/keys";
import { cn } from "@/lib/utils";
import { EASE } from "~/lib/motion";

export const LINKS = {
  /** Answered by api/download.js: redirects to the newest .dmg, so the download starts at once. */
  download: "/download",
  github: "https://github.com/nicolasakf/MiniMail",
  guide: "https://github.com/nicolasakf/MiniMail/blob/main/docs/guide.md",
  license: "https://github.com/nicolasakf/MiniMail/blob/main/LICENSE",
};

export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** The blue raised insert, like the app's Compose key. */
export function DownloadButton({ className, size = "lg" }: { className?: string; size?: "lg" | "sm" }) {
  return (
    <a
      href={LINKS.download}
      className={cn(
        "grain corner-squircle press-sink inline-flex items-center justify-center gap-2 bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-raise-1 transition-[box-shadow,transform,filter] duration-100 hover:brightness-110",
        size === "lg" ? "h-12 rounded-[14px] px-6 text-[15px]" : "h-9 rounded-[11px] px-4 text-sm",
        className,
      )}
    >
      <Download className={size === "lg" ? "size-[18px]" : "size-4"} />
      {size === "sm" ? (
        <>
          Download<span className="hidden sm:inline"> for macOS</span>
        </>
      ) : (
        "Download for macOS"
      )}
    </a>
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
          "corner-squircle relative mx-auto flex items-center gap-1 overflow-hidden pl-3 pr-2",
          ease,
          scrolled
            ? "h-11 max-w-[640px] rounded-[16px] bg-background/60 shadow-raise-1 backdrop-blur-xl backdrop-saturate-150"
            : "plate-1 h-14 max-w-[1120px] rounded-[18px]",
        )}
      >
        {/* The grain stays on the see-through pill, so it still reads as plastic. */}
        <span aria-hidden className={cn("grain pointer-events-none absolute inset-0", ease, scrolled ? "opacity-70" : "opacity-0")} />
        <a href="#top" className="relative mr-auto flex items-center gap-2.5 pr-3 font-bold tracking-[-0.01em]">
          <img src="/app-icon.png" alt="" className={cn(ease, scrolled ? "size-6" : "size-8")} />
          <span className={cn(ease, scrolled ? "text-[15px]" : "text-[17px]")}>MiniMail</span>
        </a>
        <a href="#minimum" className={cn(link, "relative hidden md:inline-flex", scrolled && "py-1.5")}>Features</a>
        <a href="#agents" className={cn(link, "relative hidden md:inline-flex", scrolled && "py-1.5")}>Agents</a>
        <a href={LINKS.github} className={cn(link, "relative hidden items-center gap-1.5 sm:inline-flex", scrolled && "py-1.5")}>
          <GithubMark className="size-4" /> GitHub
        </a>
        <DownloadButton size="sm" className={cn("relative ml-2", ease, scrolled && "h-8 rounded-[10px] px-3")} />
      </nav>
    </header>
  );
}

export function Section({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={cn("relative mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-semibold uppercase tracking-[0.28em] text-sidebar-primary", className)}>{children}</p>;
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
      className={cn("text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.025em] md:text-[56px]", className)}
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
