import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";

import { cn } from "@/lib/utils";

import { EASE, useViewportHeight } from "~/lib/motion";
import { DownloadButton, GithubButton } from "~/parts/site";
import { HeroScene, NOTES, TOUR_STRETCHES, noteFor } from "~/scenes/hero";

/** How far the page scrolls for each step of the tour, as a share of the screen height. */
const STEP_VH = 70;

/** A word or two for each step of the tour, in the order of the notes. */
const STEP_LABELS = ["Categories", "List", "Views", "Accounts", "Folders"];

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

      <div ref={tour} className="relative mt-6 md:mt-10" style={{ height: `calc(100vh + ${TOUR_STRETCHES * STEP_VH}vh)` }}>
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-2.5 px-5 pt-16 md:px-8">
          <StepTrack tour={tour} progress={progress} />
          <motion.div
            className="mx-auto w-full max-w-[1320px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
          >
            <HeroScene progress={progress} maxHeight={viewport - 150} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** The steps of the tour, in a row above the window: the one in view is lit, and any can be clicked to go there. */
function StepTrack({ tour, progress }: { tour: React.RefObject<HTMLDivElement | null>; progress: MotionValue<number> }) {
  const [current, setCurrent] = useState(() => noteFor(progress.get()));
  useMotionValueEvent(progress, "change", (v) => setCurrent(noteFor(v)));

  const goTo = (step: number) => {
    const node = tour.current;
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY;
    const range = node.offsetHeight - window.innerHeight;
    // The middle of the step's stretch, so it is clearly inside it.
    window.scrollTo({ top: top + ((step + 1.5) / TOUR_STRETCHES) * range, behavior: "smooth" });
  };

  return (
    <nav aria-label="Tour steps" className="plate-1 corner-squircle relative z-30 flex shrink-0 items-center gap-0.5 rounded-[16px] p-1">
      {NOTES.map((note, i) => {
        const active = i === current;
        return (
          <button
            key={note.title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Step ${i + 1}: ${note.title}`}
            aria-current={active ? "step" : undefined}
            title={note.title}
            className={cn(
              "corner-squircle flex h-7 items-center justify-center rounded-[12px] px-2.5 text-[12px] font-medium transition-all duration-200 md:px-3.5",
              active ? "text-sidebar-primary shadow-pressed" : "text-muted-foreground hover:plate-2 hover:text-foreground",
            )}
          >
            {STEP_LABELS[i]}
          </button>
        );
      })}
    </nav>
  );
}
