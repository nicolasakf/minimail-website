/**
 * "Email got overcomplicated": four short stories of what other mail apps do. They are drawn as a generic,
 * flat old mail app sunk into the plastic, so they never read as MiniMail. Each ends on one plain sentence.
 */
import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, LoaderCircle, Paperclip, Search, Star, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { EASE, useLoop, useTyping } from "~/lib/motion";
import { Lead, Reveal, Section, Title } from "~/parts/site";

/** A flat, grey screen of some other mail app, set into the plate. */
function OldScreen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[220px] overflow-hidden rounded-[14px] border border-[#c9c6c0] bg-[#f6f6f4] font-[Arial,Helvetica,sans-serif] text-[12px] text-[#333]",
        className,
      )}
      style={{ boxShadow: "var(--stamped)" }}
    >
      {children}
    </div>
  );
}

function TitleBar({ children }: { children: ReactNode }) {
  return <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[#d8d6d2] bg-[#ecebe8] px-3 font-bold">{children}</div>;
}

function OldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex h-[27px] items-center gap-2 border-b border-[#e2e0dc] px-3", className)}>{children}</div>;
}

/** The sentence a story ends on, over the old screen. */
function Verdict({ children, show }: { children: ReactNode; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="absolute inset-x-3 bottom-3 rounded-[10px] bg-[#2b2622]/90 px-3 py-2 text-center font-sans text-[13px] font-semibold text-white"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** One frame of a story, faded in place of the one before. */
function Frame({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div
      key={id}
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Slow: the bar crawls, the clock runs, nothing shows. ---------- */

function Slow() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [800, 900, 1000, 1200, 1400, 2600], 5);
  const percent = [6, 22, 37, 49, 52, 52][step];
  const seconds = [2, 5, 9, 14, 21, 34][step];
  return (
    <OldScreen>
      <div ref={ref} className="flex h-full flex-col">
        <TitleBar>Inbox</TitleBar>
        <div className="flex flex-col items-center px-4 pt-5">
          <div className="flex items-center gap-2 text-[#555]">
            <LoaderCircle className="size-4 animate-spin text-[#4a77c9]" />
            Loading messages…
          </div>
          <div className="mt-2 font-sans text-[30px] font-bold tabular-nums text-[#333]">0:{String(seconds).padStart(2, "0")}</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#dedcd8]">
            <motion.div className="h-full bg-[#4a77c9]" animate={{ width: `${percent}%` }} transition={{ duration: 0.6, ease: EASE }} />
          </div>
        </div>
        <div className="mt-3">
          {[0, 1].map((i) => (
            <OldRow key={i}>
              <span className="h-2 w-16 animate-pulse rounded bg-[#dedcd8]" />
              <span className="h-2 flex-1 animate-pulse rounded bg-[#e6e4e0]" />
            </OldRow>
          ))}
        </div>
        <Verdict show={step === 5}>Still waiting for your inbox.</Verdict>
      </div>
    </OldScreen>
  );
}

/* ---------- Unreliable: it said "Sent". It never left. ---------- */

function Unreliable() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1500, 1500, 2200, 3200], 3);
  return (
    <OldScreen>
      <div ref={ref} className="absolute inset-0">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <Frame id="compose">
              <TitleBar>New message</TitleBar>
              <OldRow>
                <span className="w-12 text-[#777]">To</span> Sam Okafor
              </OldRow>
              <OldRow>
                <span className="w-12 text-[#777]">Subject</span> Signed contract
              </OldRow>
              <div className="flex-1 px-3 py-2 text-[#555]">
                Here it is, signed.
                <div className="mt-2 flex w-fit items-center gap-1 rounded border border-[#d0cdc7] bg-white px-1.5 py-0.5">
                  <Paperclip className="size-3" /> contract.pdf
                </div>
              </div>
              <div className="flex justify-end px-3 pb-3">
                <motion.span
                  className="rounded border border-[#3d66b3] bg-[#4a77c9] px-4 py-1 font-bold text-white"
                  animate={{ scale: [1, 1, 0.92, 1] }}
                  transition={{ duration: 1.2, times: [0, 0.7, 0.8, 1] }}
                >
                  Send
                </motion.span>
              </div>
            </Frame>
          )}
          {step === 1 && (
            <Frame id="sent">
              <TitleBar>Inbox</TitleBar>
              <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center gap-2 rounded-full border border-[#b9d8bf] bg-[#e7f5ea] px-4 py-2 text-[14px] font-bold text-[#2c7a3f]">
                  <Check className="size-4" /> Message sent
                </div>
              </div>
            </Frame>
          )}
          {step === 2 && (
            <Frame id="later">
              <div className="flex flex-1 flex-col justify-center gap-3 bg-[#eef0f3] px-4 font-sans">
                <div className="text-center text-[11px] font-semibold uppercase tracking-wide text-[#8a8f98]">Two days later</div>
                <div className="flex items-end gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c9b5e0] text-[11px] font-bold text-[#4a3566]">SO</span>
                  <div className="rounded-[16px] rounded-bl-[4px] bg-white px-3 py-2 text-[13.5px] leading-snug text-[#222] shadow-sm">
                    Did you send the contract? I never got it.
                  </div>
                </div>
              </div>
            </Frame>
          )}
          {step === 3 && (
            <Frame id="outbox">
              <TitleBar>Outbox (1)</TitleBar>
              <OldRow className="bg-[#fdecea]">
                <TriangleAlert className="size-3.5 shrink-0 text-[#c0392b]" />
                <span className="font-bold">Signed contract</span>
                <span className="ml-auto text-[#c0392b]">Not sent</span>
              </OldRow>
              <div className="px-3 py-2 text-[11px] text-[#888]">Error 0x800CCC0E. Will retry later.</div>
            </Frame>
          )}
        </AnimatePresence>
        <Verdict show={step === 3}>It said "sent". It never left.</Verdict>
      </div>
    </OldScreen>
  );
}

/* ---------- Overwhelming: ads pile up and push the one email that matters out of sight. ---------- */

const ADS = [
  "FLASH SALE: 60% off everything",
  "We miss you! Come back for 20%",
  "Your weekly digest is here",
  "Last chance: deals end tonight",
  "You've been selected for a reward",
  "New arrivals you'll love",
];

function Overwhelming() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [1400, 600, 600, 600, 600, 600, 600, 2800], 7);
  const shown = ADS.slice(0, Math.min(step, ADS.length)).reverse();
  return (
    <OldScreen>
      <div ref={ref} className="flex h-full flex-col">
        <TitleBar>
          Inbox <span className="font-normal text-[#c0392b]">({1204 + Math.min(step, 6) * 7} unread)</span>
        </TitleBar>
        <AnimatePresence initial={false}>
          {shown.map((ad) => (
            <motion.div key={ad} initial={{ height: 0, opacity: 0 }} animate={{ height: 27, opacity: 1 }} transition={{ duration: 0.3 }}>
              <OldRow>
                <span className="rounded-sm bg-[#e8a33a] px-1 text-[9px] font-bold text-white">AD</span>
                <span className="truncate font-bold">{ad}</span>
              </OldRow>
            </motion.div>
          ))}
        </AnimatePresence>
        <OldRow className="bg-[#fff8d6]">
          <Star className="size-3.5 shrink-0 fill-[#f0b400] text-[#d49b00]" />
          <span className="truncate font-bold">Noor: Kitchen renovation quote</span>
        </OldRow>
        <Verdict show={step === 7}>The one email you needed is out of sight.</Verdict>
      </div>
    </OldScreen>
  );
}

/* ---------- Hard to search: slow, and the invoice is not among the results. ---------- */

function HardToSearch() {
  const ref = useRef<HTMLDivElement>(null);
  const { step } = useLoop(ref, [2000, 1800, 3000, 500], 2);
  const typed = useTyping("invoice from acme", step < 3, 14);
  return (
    <OldScreen>
      <div ref={ref} className="flex h-full flex-col">
        <div className="flex h-9 items-center border-b border-[#d8d6d2] bg-[#ecebe8] px-3">
          <div className="flex h-6 flex-1 items-center gap-1.5 rounded-sm border border-[#bdbab4] bg-white px-2">
            <Search className="size-3.5 text-[#777]" />
            <span>{step === 3 ? "" : typed}</span>
            {step === 0 && <span className="h-3.5 w-px animate-pulse bg-[#333]" />}
          </div>
        </div>
        {step === 1 && (
          <div className="flex flex-1 items-center justify-center gap-2 text-[#777]">
            <LoaderCircle className="size-4 animate-spin" /> Searching all mailboxes…
          </div>
        )}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
            <div className="px-3 py-1.5 text-[#777]">3 results (12.4 s)</div>
            <OldRow>
              <span className="truncate">Acme newsletter: March highlights</span>
            </OldRow>
            <OldRow>
              <span className="truncate">Invitation: Acme spring party</span>
            </OldRow>
            <OldRow>
              <span className="truncate">Re: re: fwd: notes from Acme</span>
            </OldRow>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[#c0392b]">
              <CircleAlert className="size-3.5" /> No invoice.
            </div>
          </motion.div>
        )}
        <Verdict show={step === 2}>12 seconds, and not what you asked for.</Verdict>
      </div>
    </OldScreen>
  );
}

const PROBLEMS = [
  { title: "Slow.", text: "Mail takes forever to load, open and search.", scene: <Slow /> },
  { title: "Unreliable.", text: "Sync stalls and sends fail, and it's hard to understand why.", scene: <Unreliable /> },
  { title: "Overwhelming.", text: "Ads, spam and mail you never asked for bury the mail that matters.", scene: <Overwhelming /> },
  { title: "Hard to search.", text: "By sender, subject or attachment: slow, and often the wrong results.", scene: <HardToSearch /> },
];

export function ProblemsSection() {
  return (
    <Section id="why">
      <div className="max-w-[720px]">
        <Title>Email got overcomplicated.</Title>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((problem, i) => (
          <Reveal key={problem.title} delay={i * 0.08} className="plate-1 corner-squircle flex flex-col rounded-[26px] p-3.5">
            {problem.scene}
            <div className="px-1.5 pb-1.5 pt-4">
              <h3 className="text-lg font-bold">{problem.title}</h3>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{problem.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Question />
    </Section>
  );
}

function Question() {
  const words = "How simple can we make it?".split(" ");
  return (
    <div className="mt-28 text-center md:mt-36">
      <Lead className="mx-auto max-w-[560px]">MiniMail is a desktop email client built on a different question:</Lead>
      <h2 className="mx-auto mt-6 max-w-[900px] text-balance text-[48px] font-bold leading-[1] tracking-[-0.03em] md:text-[88px]">
        {words.map((word, i) => (
          <motion.span
            key={word}
            className={cn("inline-block pr-[0.22em]", word === "simple" && "text-sidebar-primary")}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: EASE }}
          >
            {word}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}
