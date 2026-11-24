import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { EASE, useViewportHeight } from "~/lib/motion";
import { DownloadButton, GithubButton } from "~/parts/site";
import { HeroScene, NOTES } from "~/scenes/hero";

export function HeroSection() {
  const tour = useRef<HTMLDivElement>(null);
  const viewport = useViewportHeight();
  // The window stays in place while the page scrolls past it; the notes come one by one.
  const { scrollYProgress } = useScroll({ target: tour, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, (v) => v);

  return (
    <section className="relative">
      <div className="mx-auto flex max-w-[760px] flex-col items-center px-5 pt-32 text-center md:pt-40">
        <motion.img
          src="/app-icon.png"
          alt="MiniMail"
          className="size-28 md:size-36"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <motion.h1
          className="mt-6 text-balance text-[52px] font-bold leading-[0.98] tracking-[-0.03em] md:text-[84px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
        >
          Email made simple.
        </motion.h1>
        <motion.p
          className="mt-6 max-w-[560px] text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
        >
          Everything email needs. Nothing it doesn't.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
        >
          <DownloadButton />
          <GithubButton />
        </motion.div>
        <motion.p
          className="mt-4 text-[13px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Free and open source · macOS on Apple Silicon · Gmail, Outlook and any IMAP account
        </motion.p>
      </div>

      <div ref={tour} className="relative mt-6 md:mt-10" style={{ height: `calc(100vh + ${(NOTES.length + 2) * 38}vh)` }}>
        <div className="sticky top-0 flex h-screen items-center px-5 pt-16 md:px-8">
          <motion.div
            className="mx-auto w-full max-w-[1320px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          >
            <HeroScene progress={progress} maxHeight={viewport - 110} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
